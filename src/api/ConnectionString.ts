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

import { isNullOrUndefined } from "util";
import { IDB2Session } from "../";

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
        if (!isNullOrUndefined(session.database)) {
            connectionString += `DATABASE=${session.database};`;
        }
        if (!isNullOrUndefined(session.hostname)) {
            connectionString += `HOSTNAME=${session.hostname};`;
        }
        if (!isNullOrUndefined(session.port)) {
            connectionString += `PORT=${session.port};PROTOCOL=TCPIP;`;
        }
        if (!isNullOrUndefined(session.username)) {
            connectionString += `UID=${session.username};`;
        }
        if (!isNullOrUndefined(session.password)) {
            connectionString += `PWD=${session.password};`;
        }
        if (!isNullOrUndefined(session.sslFile)) {
            connectionString += `Security=SSL;SSLServerCertificate=${session.sslFile};`;
        }
        return connectionString;
    }

    /**
     * Build the ODBC connection string
     * @param {string} hostname The name or IP address of the server to connect to
     * @param {number} port The port number where the server is listening
     * @param {string} username The user ID
     * @param {string} password The user's password
     * @param {string} database The database name to use
     * @param {string} sslFile The path to a SSL Certificate file or CA signed certificate
     * @returns {string}
     */
    public static build(hostname?: string, port?: number, username?: string, password?: string, database?: string, sslFile?: string) {
        let connectionString: string = "DRIVER={DB2 ODBC Driver};";
        if (!isNullOrUndefined(database)) {
            connectionString += `DATABASE=${database};`;
        }
        if (!isNullOrUndefined(hostname)) {
            connectionString += `HOSTNAME=${hostname};`;
        }
        if (!isNullOrUndefined(port)) {
            connectionString += `PORT=${port};PROTOCOL=TCPIP;`;
        }
        if (!isNullOrUndefined(username)) {
            connectionString += `UID=${username};`;
        }
        if (!isNullOrUndefined(password)) {
            connectionString += `PWD=${password};`;
        }
        if (!isNullOrUndefined(sslFile)) {
            connectionString += `Security=SSL;SSLServerCertificate=${sslFile};`;
        }
        return connectionString;
    }

}
