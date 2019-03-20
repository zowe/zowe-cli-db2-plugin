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
import { ProcedureDefinition } from "./procedure/Procedure.definition";
import { DB2Session } from "../../index";

export const Call: ICommandDefinition = {
    name: "call",
    type: "group",
    summary: "Call a stored procedure",
    description: "Call a Db2 stored procedure",
    children: [
        ProcedureDefinition,
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

module.exports = Call;
