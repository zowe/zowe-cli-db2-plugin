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

import { IImperativeError, ImperativeError, TextUtils } from "@zowe/imperative";

/**
 * Class to handle DB2 driver errors (ODBC & JDBC)
 * @export
 * @class DB2Error
 */
export class DB2Error {

    /**
     * Prettify the error message
     * @param {any} original The original error caught
     */
    public static process(original: any) {
        if (!original) {
            throw new ImperativeError({ msg: "Unknown DB2 Driver Error" });
        }

        if (original instanceof ImperativeError) {
            throw original;
        }

        const msgStr = original.message || original.error || String(original);
        const details = {
            Error: msgStr.trim(),
            SQLCODE: original.sqlcode != null ? original.sqlcode : undefined,
            SQLSTATE: original.state != null ? original.state : undefined,
        };

        const prefix = original.error ? "DB2 ODBC Driver Error:" : "DB2 Driver Error:";
        const error: IImperativeError = {
            msg: `${prefix} ${original.error || msgStr}\n`,
            additionalDetails: TextUtils.prettyJson(details, undefined, false),
        };
        throw new ImperativeError(error);
    }
}
