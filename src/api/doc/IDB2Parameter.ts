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
 * The parameter is used as an input value.
 * @type {string}
 * @export
 */
export const DB2_PARM_INPUT = "INPUT";

/**
 * The parameter is used as an output value. It is mainly used in stored procedures.
 * @type {string}
 * @export
 */
export const DB2_PARM_OUTPUT = "OUTPUT";

/**
 * The parameter is used as an input and output value. It is used in stored procedures.
 * @type {string}
 * @export
 */
export const DB2_PARM_INOUT = "INOUT";

/**
 * Indicates that the `Data` field contains a valid path to a file to load.
 * @type {string}
 * @export
 */
export const DB2_PARM_FILE = "FILE";

/**
 * Type of the parameter to a SQL statement to bind.
 * @export
 */
export declare type DB2ParameterType = "INPUT" | "OUTPUT" | "INOUT" | "FILE";

/**
 * Interface for binding arguments to an SQL statement.
 *
 * For each marker `?` in an SQL statement, a binding parameter should be passed.
 * @export
 * @interface
 */
export interface IDB2Parameter {

    /**
     * Type of the parameter - one of `INPUT`, `OUTPUT`, `INOUT` or `FILE`.
     * If `FILE` type is used, then the Data field must contain a valid file path
     * and DataType value should be set to "BLOB".
     * @type {DB2ParameterType}
     * @memberof IDB2Parameter
     */
    ParamType?: DB2ParameterType;

    /**
     * Use C language data type for binding.
     * Default value is `CHAR`
     * @type {string}
     * @memberof IDB2Parameter
     */
    CType?: string;

    /**
     * Use SQL type for binding.
     * Default value is `CHAR`
     * @type {string}
     * @memberof IDB2Parameter
     */
    SQLType?: string;

    /**
     * Alias for `SQLType`.
     * @type {number}
     * @memberof IDB2Parameter
     */
    DataType?: number;

    /**
     * Value of the parameter
     * @type {string}
     * @memberof IDB2Parameter
     */
    Data: any;

    /**
     * Length of the Data field
     * @type {number}
     * @memberof IDB2Parameter
     */
    Length?: number;
}
