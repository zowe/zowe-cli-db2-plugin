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

import { ICommandDefinition } from "@brightside/imperative";
import { SQLDefinition } from "./sql/SQL.definition";
import { DB2Session } from "../../index";

export const Execute: ICommandDefinition = {
    name: "execute",
    type: "group",
    summary: "Execute a SQL query",
    description: "Execute SQL queries against a Db2 region and retrieve the response. " +
        "Enclose the query in quotes and escape any symbols that have a special meaning to the shell.",
    children: [
        SQLDefinition,
    ],
    passOn: [
        {
            property: "options",
            value: DB2Session.DB2_CONNECTION_OPTIONS,
            merge: true,
            ignoreNodes: [
                {type: "group"}
            ]
        }
    ]
};

module.exports = Execute;
