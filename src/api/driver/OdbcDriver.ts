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
import { ConnectionString } from "../ConnectionString";
import { DB2Constants } from "../DB2Constants";
import { DB2Error } from "../DB2Error";
import { IDB2Column } from "../doc/IDB2Column";
import { DB2_PARM_INOUT, DB2_PARM_INPUT, DB2_PARM_OUTPUT, IDB2Parameter } from "../doc/IDB2Parameter";
import { IDB2Response } from "../doc/IDB2Response";
import { IDB2Session } from "../../rest/session/doc/IDB2Session";
import { IDB2Driver } from "./IDB2Driver";

/**
 * ODBC driver implementation using node-ibm_db
 */
export class OdbcDriver implements IDB2Driver {
    private readonly session: IDB2Session;
    private readonly connectionString: string;

    constructor(session: IDB2Session) {
        this.session = session;
        this.connectionString = ConnectionString.buildFromSession(session);
    }

    public *execute(sql: string, parameters?: IDB2Parameter[]): IterableIterator<any> {
        const options = {
            fetchMode: DB2Constants.FETCH_MODE_OBJECT,
        };
        let result;
        const newParameters: ibmdb.SQLParam[] = [];
        try {
            const connection = ibmdb.openSync(this.connectionString, options);
            if (parameters != null) {
                for (const parameter of parameters) {
                    if (parameter.ParamType == undefined) { parameter.ParamType = DB2_PARM_INPUT; }
                    newParameters.push(parameter as ibmdb.SQLParam);
                }
            }
            result = connection.queryResultSync(sql, newParameters);
            if (result instanceof Error) {
                throw result;
            }
            Array.isArray(result) ? yield result[0].fetchAllSync() : yield result.fetchAllSync();
            while (Array.isArray(result) ? result[0].moreResultsSync() : result.moreResultsSync()) {
                Array.isArray(result) ? yield result[0].fetchAllSync() : yield result.fetchAllSync();
            }
            connection.closeSync();
        } catch (err) {
            DB2Error.process(err);
        }
    }

    public callSP(routineName: string, parameters?: IDB2Parameter[]): IDB2Response {
        const options = {
            fetchMode: DB2Constants.FETCH_MODE_ARRAY,
        };
        const response: IDB2Response = {
            success: false,
            results: [],
            failureResponse: undefined,
        };
        const query: string = `CALL ${routineName}`;
        let result: any;
        let outVarCount: number = 0;
        const newParameters: ibmdb.SQLParam[] = [];

        if (parameters != null) {
            for (const parameter of parameters) {
                if (parameter.ParamType === DB2_PARM_INOUT || parameter.ParamType === DB2_PARM_OUTPUT) {
                    outVarCount++;
                }
                if (parameter.ParamType == undefined) { parameter.ParamType = DB2_PARM_INPUT; }
                newParameters.push(parameter as ibmdb.SQLParam);
            }
        }

        try {
            const db2 = ibmdb.openSync(this.connectionString, options);
            const preparedStatement = db2.prepareSync(query);
            result = preparedStatement.executeSync(newParameters);

            if (outVarCount !== 0 && Array.isArray(result)) {
                while (outVarCount > 0) {
                    response.results.push(result[1].shift());
                    outVarCount--;
                }
                result = result[0];
            }
            const data = result.fetchAllSync();
            if (data.length) {
                response.results.push(data);
            }
            while (result.moreResultsSync()) {
                response.results.push(result.fetchAllSync());
            }
            response.success = true;
            result.closeSync();
            db2.closeSync();
        } catch (err) {
            DB2Error.process(err);
        }
        return response;
    }

    public getTableColumns(database: string, table: string): Promise<IDB2Column[]> {
        return new Promise((resolve, reject) => {
            const options = {
                fetchMode: DB2Constants.FETCH_MODE_OBJECT,
            };
            try {
                const connection = ibmdb.openSync(this.connectionString, options);
                connection.columns(null, database, table, null, (err, res) => {
                    connection.closeSync();
                    if (err !== null) {
                        reject(err);
                        return;
                    }
                    let data: IDB2Column[] = [];
                    if (res[0] && !(Array.isArray(res[0]))) {
                        data = res as IDB2Column[];
                    }
                    resolve(data);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public *getTableRows(database: string, table: string, columns: string[]): IterableIterator<any> {
        const options = {
            fetchMode: DB2Constants.FETCH_MODE_OBJECT,
        };
        const colString = columns.join(", ");
        const query = `SELECT ${colString} FROM ${database}.${table}`;
        try {
            const connection = ibmdb.openSync(this.connectionString, options);
            const result = connection.queryResultSync(query);
            if (result instanceof Error) {
                throw result;
            }
            let row = Array.isArray(result) ? result[0].fetchSync() : result.fetchSync();
            while (row != null) {
                yield row;
                row = Array.isArray(result) ? result[0].fetchSync() : result.fetchSync();
            }
            Array.isArray(result) ? result[0].closeSync() : result.closeSync();
            connection.closeSync();
        } catch (err) {
            DB2Error.process(err);
        }
    }
}
