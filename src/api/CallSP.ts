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
import { DB2_PARM_INOUT, DB2_PARM_OUTPUT, IDB2Parameter } from "./doc/IDB2Parameter";
import { IDB2Response } from "./doc/IDB2Response";
import { SessionValidator } from "./SessionValidator";
import { ConnectionString } from "./ConnectionString";
import { DB2Constants } from "./DB2Constants";
import { DB2Error } from "./DB2Error";

/**
 * Class to handle the invocation of the stored procedures
 * @export
 * @class CallSP
 */
export class CallSP {

    /**
     * Call a stored procedure
     * @param {IDB2Session} session DB2 session parameters
     * @param {string} routineName Name of the stored procedure to call
     * @param {IDB2Parameter[]} parameters Parameters to bind to the SQL statement
     * @returns {IDB2Response}
     * @memberof CallSP
     * @static
     */
    public static callCommon(session: IDB2Session, routineName: string, parameters?: IDB2Parameter[]): IDB2Response {
        SessionValidator.validate(session);
        const connectionString = ConnectionString.buildFromSession(session);
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
        // Count parameters with type OUTPUT or INOUT as they will be returned in the result set.
        if (parameters != null) {
            for (const parameter of parameters) {
                if (parameter.ParamType === DB2_PARM_INOUT || parameter.ParamType === DB2_PARM_OUTPUT) {
                    outVarCount++;
                }
            }
        }

        try {
            const db2 = ibmdb.openSync(connectionString, options);
            // Prepare and execute the statement
            const preparedStatement = db2.prepareSync(query);
            result = preparedStatement.executeSync(parameters);
            // Extract INOUT and OUTPUT parameters
            if (outVarCount !== 0 && Array.isArray(result)) {
                // If there are OUT/INOUT parameters, then ODBC driver returns an array, where
                //   - element with index 0 is the ODBSResult
                //   - element with index 1 is an array of INOUT/OUTPUT parameters
                while (outVarCount > 0) {
                    response.results.push(result[1].shift());
                    outVarCount--;
                }
                result = result[0];
            }
            const data = result.fetchAllSync();
            // Rest is the result set
            if (data.length) {
                response.results.push(data);
            }
            // Retrieve all other result sets
            while (result.moreResultsSync()) {
                response.results.push(result.fetchAllSync());
            }
            response.success = true;
            result.closeSync();
            db2.closeSync();
        }
        catch (err) {
            DB2Error.process(err);
        }
        return response;
    }

    /**
     * Call a stored procedure
     * @param {IDB2Session} session session DB2 session parameters
     * @param {string} routineName Name of the stored procedure to call
     * @param {IDB2Parameter} parameters Parameters to bind to the SQL statement
     * @returns {IDB2Response}
     * @memberof CallSP
     * @static
     */
    public static call(session: IDB2Session, routineName: string, ...parameters: IDB2Parameter[]): IDB2Response {
        return CallSP.callCommon(session, routineName, parameters);
    }
}
