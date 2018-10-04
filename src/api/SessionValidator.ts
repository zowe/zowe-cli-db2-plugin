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

import { ImperativeExpect } from "@brightside/imperative";
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
        ImperativeExpect.toBeDefinedAndNonBlank(params.hostname, noHostName.message);
        ImperativeExpect.toNotBeNullOrUndefined(params.port, noPortNumber.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.username, noUserName.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.password, noPassword.message);
        ImperativeExpect.toBeDefinedAndNonBlank(params.database, noDatabaseName.message);
    }
}
