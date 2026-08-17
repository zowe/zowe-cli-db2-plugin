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
 * JDBC driver implementation executing queries via a Java runner subprocess
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
     * Build the classpath string including JDBC driver JAR, license JAR, and runner class directory
     */
    public buildClasspath(): string {
        const paths: string[] = [];

        if (this.session.jdbcJarPath) {
            paths.push(this.session.jdbcJarPath);
        }

        if (this.session.jdbcLicensePath) {
            paths.push(this.session.jdbcLicensePath);
        }

        // Add runner directory (both lib/java and src/java locations)
        const runnerLibDir = path.resolve(__dirname, "../../java");
        const runnerSrcDir = path.resolve(__dirname, "../../../src/java");
        if (fs.existsSync(runnerLibDir)) {
            paths.push(runnerLibDir);
        }
        if (fs.existsSync(runnerSrcDir)) {
            paths.push(runnerSrcDir);
        }

        return paths.join(path.delimiter);
    }

    /**
     * Invoke the Java Db2JdbcRunner subprocess
     */
    public runJavaCommand(action: string, extraArgs: string[] = []): any {
        const javaExe = this.session.javaPath || "java";
        const classpath = this.buildClasspath();

        const runnerDir = path.resolve(__dirname, "../../java");
        const javaSourceFile = path.join(runnerDir, "Db2JdbcRunner.java");
        const javaClassFile = path.join(runnerDir, "Db2JdbcRunner.class");

        const args: string[] = ["-cp", classpath];

        // If Java class file doesn't exist, try running single-file Java source (Java 11+)
        if (!fs.existsSync(javaClassFile) && fs.existsSync(javaSourceFile)) {
            args.push(javaSourceFile);
        } else {
            args.push("Db2JdbcRunner");
        }

        args.push(action, this.jdbcUrl, this.session.user || "", this.session.password || "");
        args.push(...extraArgs);

        try {
            const output = child_process.execFileSync(javaExe, args, {
                encoding: "utf-8",
                maxBuffer: JdbcDriver.MAX_BUFFER_SIZE,
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
            return {
                success: false,
                results: [],
                failureResponse: err.message,
            };
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
