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

import { ImperativeError } from "@brightside/imperative";

/**
 * The DB2 response
 * @export
 * @interface IDB2Response
 */
export interface IDB2Response {

    /**
     * True if the DB2 statement was executed without error
     * @type {boolean}
     * @memberof IDB2Response
     */
    success: boolean;

    /**
     * List of SQL execution results
     * @type {any[]}
     * @memberof IDB2Response
     */
    results: any[];

    /**
     * Message in case of error
     * @type {ImperativeError}
     * @memberof IDB2Response
     */
    failureResponse: ImperativeError;
}
