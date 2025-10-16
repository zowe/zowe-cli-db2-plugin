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
 * Column description
 * @interface IDB2Column
 * @export
 */
export type IDB2Column = {
    /**
     * The catalog name
     * @type {string}
     * @memberof IDB2Column
     */
    TABLE_CAT: string;

    /**
     * The scheme name
     * @type {string}
     * @memberof IDB2Column
     */
    TABLE_SCHEM: string;

    /**
     * The table name
     * @type {string}
     * @memberof IDB2Column
     */
    TABLE_NAME: string;

    /**
     * The column name
     * @type {string}
     * @memberof IDB2Column
     */
    COLUMN_NAME: string;

    /**
     * The numeric representation of the SQL data type
     * @type {number}
     * @memberof IDB2Column
     */
    DATA_TYPE: number;

    /**
     * The string representation of the SQL data type
     * @type {string}
     * @memberof IDB2Column
     */
    TYPE_NAME: string;

    /**
     * The length of the column
     * @type {number}
     * @memberof IDB2Column
     */
    COLUMN_SIZE: number;

    /**
     * Buffer length needed to store data
     * @type {number}
     * @memberof IDB2Column
     */
    BUFFER_LENGTH: number;

    /**
     * Number of decimal digits for a numeric column
     * @type {number}
     * @memberof IDB2Column
     */
    DECIMAL_DIGITS: number | null;

    /**
     * The radix of a numeric column
     * @type {number}
     * @memberof IDB2Column
     */
    NUM_PREC_RADIX: number | null;

    /**
     * Indicates whether the column can contain the null value
     *
     * 0 - NULLs are not allowed
     * 1 - NULLs are allowed
     * @type {number}
     * @memberof IDB2Column
     */
    NULLABLE: number;

    /**
     * Description of the column
     * @type {string}
     * @memberof IDB2Column
     */
    REMARKS: string;

    /**
     * The default value
     * @type {string}
     * @memberof IDB2Column
     */
    COLUMN_DEF: string;

    /**
     * The numeric representation of the SQL data type
     * @type {number}
     * @memberof IDB2Column
     */
    SQL_DATA_TYPE: number;

    /**
     * The subtype of a datetime type
     *
     * 1 - Date
     * 2 - Time
     * 3 - Timestamp
     * @type {number|null}
     * @memberof IDB2Column
     */
    SQL_DATETIME_SUB: number | null;

    /**
     * Length in bytes of the column
     * @type {number|null}
     * @memberof IDB2Column
     */
    CHAR_OCTET_LENGTH: number | null;

    /**
     * Position of the column in the table starting from 1
     * @type {number}
     * @memberof IDB2Column
     */
    ORDINAL_POSITION: number;

    /**
     * Indicates whether the column can contain the null value
     *
     * NO - NULLs are not allowed
     * YES - NULLs are allowed
     * @type {string}
     * @memberof IDB2Column
     */
    IS_NULLABLE: string;
};
