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

import { ICommandDefinition } from "@zowe/imperative";

export const TableDefinition: ICommandDefinition = {
    name: "table",
    type: "command",
    summary: "Export data from a Db2 table in SQL format",
    description: "Export a Db2 table to the stdout or a file.",
    handler: __dirname + "/Table.handler",
    profile: {
        optional: ["db2"],
    },
    positionals: [
        {
            name: "table",
            type: "string",
            description: "The name of the table to export",
            required: true,
        }
    ],
    options: [
        {
            name: "outfile",
            aliases: ["o"],
            type: "string",
            description: "The path to the output file",
            required: false,
        }
    ],
    examples: [
        {
            description: "Export employees data from the table SAMPLE.EMP and save it to the file 'employees.sql'",
            options: "SAMPLE.EMP --outfile employees.sql",
        }
    ]
};
