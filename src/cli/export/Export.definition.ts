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
import { TableDefinition } from "./table/Table.definition";
import { DB2Session } from "../../index";

export const Export: ICommandDefinition = {
    name: "export",
    type: "group",
    summary: "Export a table",
    description: "Export data from a Db2 table",
    children: [
        TableDefinition,
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

module.exports = Export;
