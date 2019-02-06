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


import { ICommandArguments, ICommandOptionDefinition, IProfile, Logger, Session, AbstractSession } from "@brightside/imperative";
import { IDB2Session } from "../api/doc/IDB2Session";

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
        name: "hostname",
        description: "The Db2 server host name",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for port for DB2
     */
    public static DB2_OPTION_PORT: ICommandOptionDefinition = {
        name: "port",
        description: "The Db2 server port number",
        type: "number",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for username / ID  for DB2
     */
    public static DB2_OPTION_USER: ICommandOptionDefinition = {
        name: "username",
        description: "The Db2 user ID (may be the same as the TSO login)",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for password/passphrase for DB2
     */
    public static DB2_OPTION_PASS: ICommandOptionDefinition = {
        name: "password",
        description: "The Db2 password (may be the same as the TSO password)",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP,
    };

    /**
     * Option used in profile creation and commands for rejectUnauthorized setting for connecting to DB2
     */
    public static DB2_OPTION_DATABASE: ICommandOptionDefinition = {
        name: "database",
        description: "The name of the database",
        type: "string",
        group: DB2Session.DB2_CONNECTION_OPTION_GROUP
    };

    /**
     * Option used in profile creation and commands for base path setting for connecting to DB2
     */
    public static DB2_OPTION_SSL_FILE: ICommandOptionDefinition = {
        name: "sslFile",
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
     * Given a DB2 profile, create a REST Client Session.
     * @static
     * @param {IProfile} profile - The DB2 profile contents
     * @returns {Session} - A session for usage in the DB2 REST Client
     */
    public static createBasicDB2Session(profile: IProfile): Session {
        this.log.debug("Creating a DB2 session from the profile named %s", profile.name);
        return new Session({
            hostname: profile.hostname,
            port: profile.port,
            user: profile.username,
            password: profile.password,
            tokenType: profile.database,
            tokenValue: profile.sslfile
        });
    }

    /**
     * Given command line arguments, create a REST Client Session.
     * @static
     * @param {IProfile} args - The arguments specified by the user
     * @returns {Session} - A session for usage in the DB2 REST Client
     */
    public static createDB2SessionFromCommandLine(args: ICommandArguments): Session {
        this.log.debug("Creating a DB2 session from arguments");

        return new Session({
            hostname: args.hostname,
            port: args.port,
            user: args.username,
            password: args.password,
            tokenType: args.database,
            tokenValue: args.sslfile
        });

    }

    private static get log(): Logger {
        return Logger.getAppLogger();
    }

}

