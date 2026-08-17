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

import { IDB2Session } from "../../rest/session/doc/IDB2Session";
import { IDB2Driver } from "./IDB2Driver";
import { JdbcDriver } from "./JdbcDriver";
import { OdbcDriver } from "./OdbcDriver";

/**
 * Factory class to instantiate the appropriate DB2 driver (ODBC or JDBC)
 */
export class DB2DriverFactory {
    /**
     * Get a DB2 driver instance for the given session configuration
     * @param session DB2 session parameters
     * @returns IDB2Driver instance (OdbcDriver or JdbcDriver)
     */
    public static getDriver(session: IDB2Session): IDB2Driver {
        const driverType = session.driverType ? session.driverType.toLowerCase() : "odbc";
        if (driverType === "jdbc") {
            return new JdbcDriver(session);
        }
        return new OdbcDriver(session);
    }
}
