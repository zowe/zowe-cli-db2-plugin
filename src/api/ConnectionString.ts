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

import * as fs from "fs";
import * as path from "path";
import { IDB2Session } from "../";
import { DB2Constants } from "./DB2Constants";

/**
 * JDBC properties that must not be overridden by user-supplied jdbcProperties,
 * as they are set explicitly by the plugin (credentials, SSL config).
 */
const BLOCKED_JDBC_KEYS = new Set(["user", "password", "ssltruststorelocation", "sslconnection", "securitymechanism"]);

/**
 * DB2 server APIs
 * @class DB2
 * @export
 */
export class ConnectionString {

    /**
     * Build the ODBC connection string from a Session object
     * @param {IDB2Session} session Connection string values
     * @returns {string}
     * @memberof ConnectionString
     */
    public static buildFromSession(session: IDB2Session): string {
        let connectionString: string = "DRIVER={DB2 ODBC Driver};";
        if (session.database != null) {
            connectionString += `DATABASE=${session.database};`;
        }
        if (session.hostname != null) {
            connectionString += `HOSTNAME=${session.hostname};`;
        }
        if (session.port != null) {
            connectionString += `PORT=${session.port};PROTOCOL=TCPIP;`;
        }
        if (session.user != null) {
            connectionString += `UID=${session.user};`;
        }
        if (session.password != null) {
            connectionString += `PWD=${session.password};`;
        }
        if (session.sslFile != null) {
            connectionString += `Security=SSL;SSLServerCertificate=${session.sslFile};`;
        }
        return connectionString;
    }

    /**
     * Build the ODBC connection string
     * @param {string} hostname The name or IP address of the server to connect to
     * @param {number} port The port number where the server is listening
     * @param {string} user The user ID
     * @param {string} password The user's password
     * @param {string} database The database name to use
     * @param {string} sslFile The path to a SSL Certificate file or CA signed certificate
     * @returns {string}
     */
    public static build(hostname?: string, port?: number, user?: string, password?: string, database?: string, sslFile?: string) {
        let connectionString: string = "DRIVER={DB2 ODBC Driver};";
        if (database != null) {
            connectionString += `DATABASE=${database};`;
        }
        if (hostname != null) {
            connectionString += `HOSTNAME=${hostname};`;
        }
        if (port != null) {
            connectionString += `PORT=${port};PROTOCOL=TCPIP;`;
        }
        if (user != null) {
            connectionString += `UID=${user};`;
        }
        if (password != null) {
            connectionString += `PWD=${password};`;
        }
        if (sslFile != null) {
            connectionString += `Security=SSL;SSLServerCertificate=${sslFile};`;
        }
        return connectionString;
    }

    /**
     * Build the JDBC connection URL from a Session object
     * @param {IDB2Session} session Connection values
     * @returns {string}
     * @memberof ConnectionString
     */
    public static buildJdbcUrlFromSession(session: IDB2Session): string {
        return ConnectionString.buildJdbcUrl(
            session.hostname,
            session.port,
            session.database,
            session.sslFile,
            session.jdbcProperties
        );
    }

    /**
     * Build the JDBC connection URL
     * @param {string} hostname Host name
     * @param {number} port Port number
     * @param {string} database Database name
     * @param {string} sslFile SSL certificate file path — must be an absolute path to an existing file
     * @param {string | Record<string, string>} jdbcProperties Additional JDBC properties
     * @returns {string}
     * @throws {Error} if sslFile is not an absolute path to an existing file, or if jdbcProperties
     *   attempts to shadow a security-sensitive key (user, password, sslConnection, etc.)
     */
    public static buildJdbcUrl(
        hostname?: string,
        port?: number,
        database?: string,
        sslFile?: string,
        jdbcProperties?: string | Record<string, string>
    ): string {
        const host = hostname || "localhost";
        const p = port || DB2Constants.DEFAULT_DB2_PORT;
        const db = database || "";
        let url = `jdbc:db2://${host}:${p}/${db}`;
        const props: string[] = [];

        if (sslFile) {
            // Guard against path traversal — require an absolute path to an existing file
            const resolved = path.resolve(sslFile);
            if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
                throw new Error(`sslFile must be an absolute path to an existing certificate file: ${sslFile}`);
            }
            props.push(`sslConnection=true`, `sslTrustStoreLocation=${resolved}`);
        }

        if (jdbcProperties) {
            const pairs: Array<[string, string]> = [];
            if (typeof jdbcProperties === "string") {
                for (const token of jdbcProperties.split(";").map(s => s.trim()).filter(Boolean)) {
                    const eq = token.indexOf("=");
                    if (eq === -1) { pairs.push([token, ""]); } else {
                        pairs.push([token.substring(0, eq), token.substring(eq + 1)]);
                    }
                }
            } else {
                for (const [k, v] of Object.entries(jdbcProperties)) {
                    pairs.push([k, v]);
                }
            }
            for (const [k, v] of pairs) {
                if (BLOCKED_JDBC_KEYS.has(k.toLowerCase())) {
                    throw new Error(
                        `jdbcProperties must not override security-sensitive key '${k}'. ` +
                        `Remove it from jdbcProperties; the plugin sets it directly.`
                    );
                }
                props.push(`${k}=${v}`);
            }
        }

        if (props.length > 0) {
            url += ":" + props.join(";") + ";";
        }
        return url;
    }

}
