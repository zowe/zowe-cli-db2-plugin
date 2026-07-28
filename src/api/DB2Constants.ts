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

/**
 * Class to contain DB2 related constants
 * @export
 * @class DB2Constants
 */
export class DB2Constants {
    // ibm_db FETCH_ARRAY / FETCH_OBJECT constants (from ibm_db/lib/climacros.js).
    // Inlined here to avoid a top-level require("ibm_db") which would fail at
    // plugin load time when the native binary has not been compiled (e.g. npm 12
    // blocking ibm_db's install script).
    public static readonly FETCH_MODE_ARRAY = 3 as const;
    public static readonly FETCH_MODE_OBJECT = 4 as const;
}
