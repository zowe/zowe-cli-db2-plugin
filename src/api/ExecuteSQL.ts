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

import { ConnectionString, DB2Constants, IDB2Parameter, IDB2Session,
    SessionValidator, DB2Error } from "../";
import * as ibmdb from "ibm_db";

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
            fetchMode: DB2Constants.FETCH_MODE_OBJECT,
        };
        let result;
        try {
            this.mConnection = ibmdb.openSync(this.mConnectionString, options);
            result = this.mConnection.queryResultSync(sql, parameters);
            if (result instanceof Error) {
                throw result;
            }
            yield result.fetchAllSync();
            while (result.moreResultsSync()) {
                yield result.fetchAllSync();
            }
            this.mConnection.closeSync();
        }
        catch (err) {
            DB2Error.process(err);
        }
    }
}
