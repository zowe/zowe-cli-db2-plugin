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

/**
 * Interface for DB2 connection parameters
 * @export
 * @interface
 */
export interface IDB2Session {

    /**
     * The name or IP address of the server to connect to
     * @type {string}
     * @memberof IDB2Session
     */
    hostname: string;

    /**
     * The port number where the server is listening
     * @type {number}
     * @memberof IDB2Session
     */
    port: number;

    /**
     * The user ID
     * @type {string}
     * @memberof IDB2Session
     */
    user: string;

    /**
     * The user's password
     * @type {string}
     * @memberof IDB2Session
     */
    password: string;

    /**
     * The database name to use
     * @type {string}
     * @memberof IDB2Session
     */
    database: string;

    /**
     * The path to a SSL Certificate file from a server or a CA signed certificate
     *
     * When specified the connection to the database server will be done over SSL.
     * @type {string}
     * @memberof IDB2Session
     */
    sslFile?: string;

    /**
     * Driver type used to connect to Db2: "odbc" or "jdbc"
     * @type {"odbc" | "jdbc"}
     * @memberof IDB2Session
     */
    driverType?: "odbc" | "jdbc";

    /**
     * Path to the Db2 JDBC driver JAR file (e.g. db2jcc4.jar) or directory containing it
     * @type {string}
     * @memberof IDB2Session
     */
    jdbcJarPath?: string;

    /**
     * Path to the Db2 JDBC license JAR file (e.g. db2jcc_license_cisuz.jar) or directory containing it
     * @type {string}
     * @memberof IDB2Session
     */
    jdbcLicensePath?: string;

    /**
     * Path to java executable to use for JDBC connections (defaults to "java")
     * @type {string}
     * @memberof IDB2Session
     */
    javaPath?: string;

    /**
     * Additional JDBC connection properties as a formatted string or key-value record
     * @type {string | Record<string, string>}
     * @memberof IDB2Session
     */
    jdbcProperties?: string | Record<string, string>;
}
