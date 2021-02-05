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

import { ICommandHandler, IHandlerParameters, ImperativeError, AbstractSession } from "@zowe/imperative";
import { ExportTableSQL, IDB2Session, DB2BaseHandler } from "../../../index";
import * as fs from "fs";

/**
 * Command handler for exporting a DB2 table
 * @export
 * @class TableHandler
 * @implements {ICommandHandler}
 */
export default class TableHandler extends DB2BaseHandler {
    public async processWithDB2Session(params: IHandlerParameters, session: AbstractSession): Promise<void>  {
        const DB2session = session.ISession as IDB2Session;
        const separatorCharacter = params.arguments.separator === `true` ? `;` : ``;
        let [database, table] = params.arguments.table.split(".");
        if (table === null) {
            table = database;
            database = DB2session.database;
        }
        let outFile;
        if (params.arguments.outfile) {
            try {
                outFile = fs.openSync(params.arguments.outfile, "w");
            }
            catch (err) {
                throw new ImperativeError({msg: err.toString()});
            }
        }
        const sqlExporter = new ExportTableSQL(DB2session, database, table);
        await sqlExporter.init();
        const statements = sqlExporter.export();
        let statement;
        while (!(statement = statements.next()).done) {
            if (params.arguments.outfile) {
                // Write statements to a file
                fs.writeSync(outFile, `${statement.value}${separatorCharacter}`);
            }
            else {
                // Print out the response
                params.response.console.log(`${statement.value}${separatorCharacter}`);
            }
        }
        if (params.arguments.outfile) {
            fs.closeSync(outFile);
        }

    }
}
