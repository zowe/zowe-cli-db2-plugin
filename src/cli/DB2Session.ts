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


import { ConnectionPropsForSessCfg, ICommandArguments, ICommandOptionDefinition, IHandlerParameters, Logger, Session } from "@zowe/imperative";
import { IDB2Session } from "../rest/session/doc/IDB2Session";

/**
 * Utility Methods for Brightside
 * @export
 */
export class DB2Session {

    public static DB2_CONNECTION_OPTION_GROUP = "DB2 Connection Options";

    /**
     * Option used in profile creation and commands for hostname for DB2
     */
    public static DB2_OPTION_HOST: ICommandOptionDefinition = {
        name: "host",
        aliases: ["H"],
        description: "The Db2 server host name",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for port for DB2
     */
    public static DB2_OPTION_PORT: ICommandOptionDefinition = {
        name: "port",
        aliases: ["P"],
        description: "The Db2 server port number",
        type: "number",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for username / ID  for DB2
     */
    public static DB2_OPTION_USER: ICommandOptionDefinition = {
        name: "user",
        aliases: ["u"],
        description: "The Db2 user ID (may be the same as the TSO login)",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for password/passphrase for DB2
     */
    public static DB2_OPTION_PASS: ICommandOptionDefinition = {
        name: "password",
        aliases: ["pass", "pw"],
        description: "The Db2 password (may be the same as the TSO password)",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP,
    };

    /**
     * Option used in profile creation and commands for rejectUnauthorized setting for connecting to DB2
     */
    public static DB2_OPTION_DATABASE: ICommandOptionDefinition = {
        name: "database",
        aliases: ["db"],
        description: "The name of the database",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for base path setting for connecting to DB2
     */
    public static DB2_OPTION_SSL_FILE: ICommandOptionDefinition = {
        name: "sslFile",
        aliases: ["ssl"],
        description: "Path to an SSL Certificate file",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands to specify driver type ("odbc" or "jdbc")
     */
    public static DB2_OPTION_DRIVER_TYPE: ICommandOptionDefinition = {
        name: "driverType",
        aliases: ["driver"],
        description: "Driver type used to connect to Db2: 'odbc' or 'jdbc'",
        type: "string",
        allowableValues: {
            values: ["odbc", "jdbc"],
            caseSensitive: false
        },
        defaultValue: "odbc",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands to specify path to Db2 JDBC driver JAR file
     */
    public static DB2_OPTION_JDBC_JAR: ICommandOptionDefinition = {
        name: "jdbcJarPath",
        aliases: ["jdbc-jar"],
        description: "Path to the Db2 JDBC driver JAR file (e.g. db2jcc4.jar) or directory containing it",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands to specify path to Db2 JDBC license JAR file
     */
    public static DB2_OPTION_JDBC_LICENSE: ICommandOptionDefinition = {
        name: "jdbcLicensePath",
        aliases: ["jdbc-license"],
        description: "Path to the Db2 JDBC license JAR file (e.g. db2jcc_license_cisuz.jar) or directory containing it",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands to specify Java executable path for JDBC
     */
    public static DB2_OPTION_JAVA_PATH: ICommandOptionDefinition = {
        name: "javaPath",
        aliases: ["java-path"],
        description: "Path to Java executable to use for JDBC connections (defaults to 'java')",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands to specify additional JDBC connection properties
     */
    public static DB2_OPTION_JDBC_PROPERTIES: ICommandOptionDefinition = {
        name: "jdbcProperties",
        aliases: ["jdbc-props"],
        description: "Additional JDBC connection properties (e.g. 'securityMechanism=13;clientProgramName=ZoweCLI;')",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Options related to connecting to DB2
     * These options can be filled in if the user creates a profile
     */
    public static DB2_CONNECTION_OPTIONS: ICommandOptionDefinition[] = [
        DB2Session.DB2_OPTION_HOST,
        DB2Session.DB2_OPTION_PORT,
        DB2Session.DB2_OPTION_USER,
        DB2Session.DB2_OPTION_PASS,
        DB2Session.DB2_OPTION_DATABASE,
        DB2Session.DB2_OPTION_SSL_FILE,
        DB2Session.DB2_OPTION_DRIVER_TYPE,
        DB2Session.DB2_OPTION_JDBC_JAR,
        DB2Session.DB2_OPTION_JDBC_LICENSE,
        DB2Session.DB2_OPTION_JAVA_PATH,
        DB2Session.DB2_OPTION_JDBC_PROPERTIES
    ];

    /**
     * Create a REST Client Session from given command line arguments or profile.
     * @static
     * @param {ICommandArguments} args - The arguments specified by the user or loaded from profile
     * @returns {Session} - A session for usage in the DB2 REST Client
     */
    public static createDB2Session(args: ICommandArguments): Session {
        this.log.info("Creating a DB2 session from cmd arguments or profile");
        const DB2session: IDB2Session = {
            hostname: args.host,
            port: args.port,
            user: args.user,
            password: args.password,
            database: args.database,
            sslFile: args.sslFile,
            driverType: args.driverType ? (args.driverType.toLowerCase() as "odbc" | "jdbc") : "odbc",
            jdbcJarPath: args.jdbcJarPath,
            jdbcLicensePath: args.jdbcLicensePath,
            javaPath: args.javaPath,
            jdbcProperties: args.jdbcProperties,
        };
        return new Session(DB2session);
    }

    /**
     * Given command line arguments, create a REST Client Session.
     * @static
     * @param {IProfile} args - The arguments specified by the user
     * @param {boolean} doPrompting - Whether to prompt for missing arguments (defaults to true)
     * @param {IHandlerParameters} handlerParams - The command parameters object for Daemon mode prompting
     * @returns {Session} - A session for usage in the CMCI REST Client
     */
    public static async createSessCfgFromArgs(args: ICommandArguments, doPrompting = true, handlerParams?: IHandlerParameters): Promise<Session> {
        const sessCfg: IDB2Session = {
            hostname: args.host,
            port: args.port,
            user: args.user,
            password: args.password,
            database: args.database,
            sslFile: args.sslFile,
            driverType: args.driverType ? (args.driverType.toLowerCase() as "odbc" | "jdbc") : "odbc",
            jdbcJarPath: args.jdbcJarPath,
            jdbcLicensePath: args.jdbcLicensePath,
            javaPath: args.javaPath,
            jdbcProperties: args.jdbcProperties,
        };

        const sessCfgWithCreds = await ConnectionPropsForSessCfg.addPropsOrPrompt<IDB2Session>(sessCfg, args, {doPrompting, parms: handlerParams});
        return new Session(sessCfgWithCreds);
    }

    private static get log(): Logger {
        return Logger.getAppLogger();
    }

}

