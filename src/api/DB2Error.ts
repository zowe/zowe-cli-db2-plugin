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

import { IImperativeError, ImperativeError, TextUtils } from "@brightside/imperative";

/**
 * Class to handle DB2 ODBC Driver errors
 * @export
 * @class DB2Error
 */
export class DB2Error {

    /**
     * Prettify the error message
     * @param {any} original The original error catched
     */
    public static process(original: any) {
        const details = {
            Error: original.message.trim(),
            SQLCODE: original.sqlcode,
            SQLSTATE: original.state,
        };
        const error: IImperativeError = {
            msg: `DB2 ODBC Driver Error: ${original.error}\n`,
            additionalDetails: TextUtils.prettyJson(details, undefined, false),
        };
        throw new ImperativeError(error);
    }
}
