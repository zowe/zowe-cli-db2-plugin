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
 * Class to contain Db2 related constants
 * @export
 * @class Constants
 */
export class Constants {
    /**
     * Product name for Db2 plugin
     * @type {string}
     * @static
     * @memberof Constants
     */
    public static readonly PROD_NAME: string = "db2";

    /**
     * Display name for Db2 plugin
     * @type {string}
     * @static
     * @memberof Constants
     */
    public static readonly DISPLAY_NAME: string = "CLI Plug-in for IBM Db2";

    /**
     * The Db2 plugin top level description
     * @type {string}
     * @static
     * @memberof Constants
     */
    public static readonly DESCRIPTION: string = "Interact with IBM Db2 for z/OS";
}
