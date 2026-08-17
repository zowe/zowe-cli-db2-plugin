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
import { SessionValidator } from "./SessionValidator";
import { DB2DriverFactory } from "./driver/DB2DriverFactory";
import { IDB2Driver } from "./driver/IDB2Driver";

/**
 * Class to handle execution of SQL statements
 * @export
 * @class ExecuteSQL
 */
export class ExecuteSQL {

    private readonly driver: IDB2Driver;

    /**
     * Constructor
     * @param {IDB2Session} session DB2 session parameters
     */
    constructor(session: IDB2Session) {
        SessionValidator.validate(session);
        this.driver = DB2DriverFactory.getDriver(session);
    }

    /**
     * Execute a SQL statement
     * @param {string} sql Statement to execute
     * @param {IDB2Parameter[]} parameters Array of DB2 parameters to bind to the SQL statement
     * @returns {IterableIterator<any>}
     * @memberof ExecuteSQL
     */
    public execute(sql: string, parameters?: IDB2Parameter[]): IterableIterator<any> {
        return this.driver.execute(sql, parameters);
    }
}
