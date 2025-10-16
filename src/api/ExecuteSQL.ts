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

import * as ibmdb from "ibm_db";
import { IDB2Session } from "../rest/session/doc/IDB2Session";
import { ConnectionString } from "./ConnectionString";
import { DB2Error } from "./DB2Error";
import { DB2_PARM_INPUT, IDB2Parameter } from "./doc/IDB2Parameter";
import { SessionValidator } from "./SessionValidator";

/**
 * Class to handle execution of SQL statements
 * @export
 * @class ExecuteSQL
 */
export class ExecuteSQL {

    /**
     * Connection to a DB2 region
     * @type {ibmdb.Database}
     * @memberof ExportTable
     * @private
     */
    private mConnection: ibmdb.Database;

    /**
     * The connection string to use with ODBC driver
     * @type {string}
     * @memberof ExportTable
     * @private
     */
    private readonly mConnectionString: string;

    /**
     * Constructor
     * @param {IDB2Session} session DB2 session parameters
     */
    constructor(session: IDB2Session) {
        SessionValidator.validate(session);
        this.mConnectionString = ConnectionString.buildFromSession(session);
    }

    /**
     * Execute a SQL statement
     * @param {string} sql Statement to execute
     * @param {IDB2Parameter[]} parameters Array of DB2 parameters to bind to the SQL statement
     * @returns {IterableIterator<any>}
     * @static
     * @memberof ExecuteSQL
     */
    public *execute(sql: string, parameters?: IDB2Parameter[]): IterableIterator<any> {
        const options = {
            fetchMode: ibmdb.FETCH_OBJECT,
        };
        let result;
        const newParameters: ibmdb.SQLParam[] = [];
        try {
            this.mConnection = ibmdb.openSync(this.mConnectionString, options);
            if (parameters != null) {
                for (const parameter of parameters) {
                    if (parameter.ParamType == undefined) { parameter.ParamType = DB2_PARM_INPUT; }
                    newParameters.push(parameter as ibmdb.SQLParam);
                }
            }
            result = this.mConnection.queryResultSync(sql, newParameters);
            if (result instanceof Error) {
                throw result;
            }
            Array.isArray(result) ? yield result[0].fetchAllSync(): yield result.fetchAllSync();
            while (Array.isArray(result) ? result[0].moreResultsSync(): result.moreResultsSync()) {
                Array.isArray(result) ? yield result[0].fetchAllSync(): yield result.fetchAllSync();
            }
            this.mConnection.closeSync();
        }
        catch (err) {
            DB2Error.process(err);
        }
    }
}
