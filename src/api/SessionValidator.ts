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

import { ImperativeExpect, ImperativeError } from "@zowe/imperative";
import { IDB2Session } from "../";
import { noDatabaseName, noDB2Input, noHostName, noPassword, noPortNumber, noUserName } from "./doc/Messages";

/**
 * Validate DB2 input parameters
 * @class SessionValidator
 * @export
 */
export class SessionValidator {

    /**
     * Validate DB2 parameters
     * @static
     * @param {IDB2Session} params
     * @memberof SessionValidator
     */
    public static validate(params: IDB2Session) {
        ImperativeExpect.toNotBeNullOrUndefined(params, noDB2Input.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.hostname, "hostname", noHostName.message);
        ImperativeExpect.toNotBeNullOrUndefined(params.port, noPortNumber.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.user, "user", noUserName.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.password, "password", noPassword.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.database, "database", noDatabaseName.message);

        if (params.driverType) {
            const driverLower = params.driverType.toLowerCase();
            if (driverLower !== "odbc" && driverLower !== "jdbc") {
                throw new ImperativeError({
                    msg: `Invalid driverType '${params.driverType}'. Supported values are 'odbc' or 'jdbc'.`
                });
            }
            if (driverLower === "jdbc" && !params.jdbcJarPath) {
                throw new ImperativeError({
                    msg: `jdbcJarPath is required when driverType is 'jdbc'. ` +
                         `Specify the path to db2jcc4.jar using --jdbc-jar or in your Zowe profile.`
                });
            }
        }
    }
}
