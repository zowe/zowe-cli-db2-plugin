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

}
