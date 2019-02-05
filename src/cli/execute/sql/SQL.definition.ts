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

import { ICommandDefinition,  ICommandOptionDefinition  } from "@brightside/imperative";
import { DB2Session } from "../../DB2Sessions";

export const SQLDefinition: ICommandDefinition = {
    name: "sql",
    type: "command",
    summary: "Execute SQL statement",
    description: "Execute one or multiple SQL statements separated by a semicolon " +
    "from a command line or from a file.",
    handler: __dirname + "/SQL.handler",
    profile: {
        optional: ["db2"]
    },
    options: [
        {
            name: "query",
            aliases: ["q"],
            type: "string",
            description: "The SQL statement verbatim to execute",
            conflictsWith: ["file"],
        },
        {
            name: "file",
            aliases: ["f"],
            type: "string",
            description: "A local file containing the SQL statements to execute",
            conflictsWith: ["query"]
        }
    ],
    examples: [
        {
            description: "Execute a dummy SQL query",
            options: "--query\"SELECT 'Hello World' FROM SYSIBM.SYSDUMMY1\"",
        },
        {
            description: "Retrieve the employees table and total number of rows",
            options: "-q \"SELECT * FROM SAMPLE.EMP; SELECT COUNT(*) AS TOTAL FROM SAMPLE.EMP\"",
        },
        {
            description: "Execute a file with SQL statements",
            options: "--file backup_sample_database.sql"
        }
    ],
    mustSpecifyOne: ["query", "file"],
};
