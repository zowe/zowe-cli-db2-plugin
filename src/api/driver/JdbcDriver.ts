/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import { ConnectionString } from "../ConnectionString";
import { DB2Error } from "../DB2Error";
import { IDB2Column } from "../doc/IDB2Column";
import { IDB2Parameter } from "../doc/IDB2Parameter";
import { IDB2Response } from "../doc/IDB2Response";
import { IDB2Session } from "../../rest/session/doc/IDB2Session";
import { IDB2Driver } from "./IDB2Driver";

/**
 * JDBC driver implementation executing queries via a Java runner subprocess.
 * Credentials are passed via stdin (never as process arguments) to prevent
 * them from appearing in ps/proc listings.
 */
export class JdbcDriver implements IDB2Driver {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly MAX_BUFFER_SIZE = 50 * 1024 * 1024;
    private readonly session: IDB2Session;
    private readonly jdbcUrl: string;

    constructor(session: IDB2Session) {
        this.session = session;
        this.jdbcUrl = ConnectionString.buildJdbcUrlFromSession(session);
    }

    /**
     * Resolve a classpath entry path. If a directory is provided, locate all .jar files or use wildcard.
     */
    private resolveClasspathEntry(entryPath: string): string[] {
        if (!fs.existsSync(entryPath)) {
            return [entryPath];
        }
        const stat = fs.statSync(entryPath);
        if (stat.isDirectory()) {
            try {
                const files = fs.readdirSync(entryPath);
                const jars = files.filter(f => f.toLowerCase().endsWith(".jar")).map(f => path.join(entryPath, f));
                if (jars.length > 0) {
                    return jars;
                }
            } catch (e) {
                // Fallback to directory wildcard
            }
            return [path.join(entryPath, "*")];
        }
        return [entryPath];
    }

    /**
     * Build the classpath string including JDBC driver JAR, license JAR, and runner class directory.
     * Only adds src/java as a fallback if the compiled class is absent from lib/java.
     */
    public buildClasspath(): string {
        const paths: string[] = [];

        if (this.session.jdbcJarPath) {
            paths.push(...this.resolveClasspathEntry(this.session.jdbcJarPath));
        }

        if (this.session.jdbcLicensePath) {
            paths.push(...this.resolveClasspathEntry(this.session.jdbcLicensePath));
        }

        // Prefer the compiled class in lib/java; only fall back to src/java if not compiled yet
        const runnerLibDir = path.resolve(__dirname, "../../java");
        const runnerSrcDir = path.resolve(__dirname, "../../../src/java");
        const javaClassFile = path.join(runnerLibDir, "Db2JdbcRunner.class");

        if (fs.existsSync(javaClassFile)) {
            paths.push(runnerLibDir);
        } else if (fs.existsSync(runnerSrcDir)) {
            paths.push(runnerSrcDir);
        } else if (fs.existsSync(runnerLibDir)) {
            paths.push(runnerLibDir);
        }

        return paths.join(path.delimiter);
    }

    /**
     * Invoke the Java Db2JdbcRunner subprocess.
     * Credentials and action-specific args are written to the process stdin as a JSON line
     * so they are never visible in ps/proc listings.
     */
    private runJavaCommand(action: string, extraArgs: string[] = []): any {
        const javaExe = this.session.javaPath || "java";
        const classpath = this.buildClasspath();

        const runnerLibDir = path.resolve(__dirname, "../../java");
        const javaSourceFile = path.join(runnerLibDir, "Db2JdbcRunner.java");
        const javaClassFile = path.join(runnerLibDir, "Db2JdbcRunner.class");

        const args: string[] = ["-cp", classpath];

        // If compiled class is absent, use single-file Java source launcher (Java 11+)
        if (!fs.existsSync(javaClassFile) && fs.existsSync(javaSourceFile)) {
            args.push(javaSourceFile);
        } else {
            args.push("Db2JdbcRunner");
        }

        args.push(action, this.jdbcUrl);

        // Build the stdin envelope — credentials and action args never touch the process arg list
        const stdinPayload = JSON.stringify({
            user:     this.session.user     || "",
            password: this.session.password || "",
            args:     extraArgs,
        });

        try {
            const output = child_process.execFileSync(javaExe, args, {
                encoding: "utf-8",
                maxBuffer: JdbcDriver.MAX_BUFFER_SIZE,
                input:     stdinPayload,
            });
            return JSON.parse(output.trim());
        } catch (err: any) {
            const errorMsg = err.stderr ? err.stderr.toString() : err.message;
            throw new Error(`JDBC Driver execution failed: ${errorMsg}`);
        }
    }

    public *execute(sql: string, parameters?: IDB2Parameter[]): IterableIterator<any> {
        try {
            const extraArgs: string[] = [sql];
            if (parameters && parameters.length > 0) {
                extraArgs.push(JSON.stringify(parameters));
            }
            const results = this.runJavaCommand("execute", extraArgs);
            if (Array.isArray(results)) {
                for (const resultSet of results) {
                    yield resultSet;
                }
            } else {
                yield results;
            }
        } catch (err) {
            DB2Error.process(err);
        }
    }

    public callSP(routineName: string, parameters?: IDB2Parameter[]): IDB2Response {
        try {
            const paramsJson = JSON.stringify(parameters || []);
            const response = this.runJavaCommand("call", [routineName, paramsJson]);
            return response as IDB2Response;
        } catch (err) {
            DB2Error.process(err);
        }
    }

    public async getTableColumns(database: string, table: string): Promise<IDB2Column[]> {
        try {
            const columns = this.runJavaCommand("getColumns", [database, table]);
            return columns as IDB2Column[];
        } catch (err) {
            DB2Error.process(err);
            return [];
        }
    }

    public *getTableRows(database: string, table: string, columns: string[]): IterableIterator<any> {
        const colString = columns.join(", ");
        const query = `SELECT ${colString} FROM ${database}.${table}`;
        try {
            const results = this.runJavaCommand("execute", [query]);
            if (Array.isArray(results) && results.length > 0) {
                const rows = results[0];
                if (Array.isArray(rows)) {
                    for (const row of rows) {
                        yield row;
                    }
                }
            }
        } catch (err) {
            DB2Error.process(err);
        }
    }
}
