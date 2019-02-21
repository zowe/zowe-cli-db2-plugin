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


import { ICommandArguments, ICommandOptionDefinition, Logger } from "@brightside/imperative";
import { Session } from "../index";

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
     * Options related to connecting to DB2
     * These options can be filled in if the user creates a profile
     */
    public static DB2_CONNECTION_OPTIONS: ICommandOptionDefinition[] = [
        DB2Session.DB2_OPTION_HOST,
        DB2Session.DB2_OPTION_PORT,
        DB2Session.DB2_OPTION_USER,
        DB2Session.DB2_OPTION_PASS,
        DB2Session.DB2_OPTION_DATABASE,
        DB2Session.DB2_OPTION_SSL_FILE
    ];

    /**
     * Create a REST Client Session from given command line arguments or profile.
     * @static
     * @param {ICommandArguments} args - The arguments specified by the user or loaded from profile
     * @returns {Session} - A session for usage in the DB2 REST Client
     */
    public static createDB2Session(args: ICommandArguments): Session {
        this.log.info("Creating a DB2 session from cmd arguments or profile");
        const DB2session = {
            hostname: args.host,
            port: args.port,
            user: args.user,
            password: args.password,
            database: args.database,
            sslFile: args.sslFile,
        };
        return new Session(DB2session);
    }

    private static get log(): Logger {
        return Logger.getAppLogger();
    }

}

