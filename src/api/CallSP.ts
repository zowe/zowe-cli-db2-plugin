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

import { IDB2Session } from "../rest/session/doc/IDB2Session";
import { IDB2Parameter } from "./doc/IDB2Parameter";
import { IDB2Response } from "./doc/IDB2Response";
import { SessionValidator } from "./SessionValidator";
import { DB2DriverFactory } from "./driver/DB2DriverFactory";

/**
 * Class to handle the invocation of stored procedures
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
        const driver = DB2DriverFactory.getDriver(session);
        return driver.callSP(routineName, parameters) as IDB2Response;
    }

    /**
     * Call a stored procedure
     * @param {IDB2Session} session DB2 session parameters
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
