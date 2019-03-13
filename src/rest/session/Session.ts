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

import { AbstractSession } from "@brightside/imperative";
import { IDB2Session } from "../../index";
/**
 * Non-abstract session class
 * @export
 * @class Session
 * @extends {AbstractSession}
 */
export class Session extends AbstractSession {

    /**
     * Creates an instance of Session.
     * @param {IDB2Session} newSession - contains input for new session
     * @memberof Session
     */
    constructor(newSession: IDB2Session) {
        super(newSession);
    }
}
