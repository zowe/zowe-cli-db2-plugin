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

import { DB2_PARM_INOUT, DB2_PARM_INPUT, DB2_PARM_OUTPUT, IDB2Parameter, IDB2Session } from "../src";

export const PROFILE_NAME: string = "DB2P";
export const HOST_NAME: string = "db2.server.com";
export const PORT: number = 12345;
export const USER_NAME: string = "ibmuser";
export const PASSWORD: string = "ibmpass";
export const DATABASE_NAME: string = "db2test";
export const TABLE_NAME: string = "testtable";
export const ROUTINE_NAME: string = "demosp";
export const SSL_FILE: string = "/etc/path/to/certificate.crt";

export const SESSION: IDB2Session = {
    hostname: HOST_NAME,
    port: PORT,
    user: USER_NAME,
    password: PASSWORD,
    database: DATABASE_NAME,
};

export const QUERY: string = `SELECT C, D, I, S, T, V FROM ${DATABASE_NAME}.${TABLE_NAME}`;

export const COLUMNS: any[] = [
    { COLUMN_NAME: "C", TYPE_NAME: "CHAR" },
    { COLUMN_NAME: "D", TYPE_NAME: "DATE" },
    { COLUMN_NAME: "I", TYPE_NAME: "INTEGER" },
    { COLUMN_NAME: "S", TYPE_NAME: "TIMESTAMP" },
    { COLUMN_NAME: "T", TYPE_NAME: "TIME" },
    { COLUMN_NAME: "V", TYPE_NAME: "VARCHAR" },
];

export const ROWS: any[] = [
    { C: "C1", D: "2017-12-31", I: 365, S: "2017-12-31 23:59:59.1234567890", T: "23:59:59", V: "VAR1" },
    { C: "C2", D: "2018-01-01", I: 1, S: "2018-01-01 00:00:00.0000000001", T: "00:00:00", V: "VAR2" },
    { C: "C3", D: "2018-06-01", I: 152, S: "2018-06-01 12:00:00.0000000000", T: "12:00:00", V: null },
];

export const PARAM_INPUT: IDB2Parameter = {
    ParamType: DB2_PARM_INPUT,
    Data: "value",
};

export const PARAM_INOUT: IDB2Parameter = {
    ParamType: DB2_PARM_INOUT,
    Data: 42,
};

export const PARAM_OUT: IDB2Parameter = {
    ParamType: DB2_PARM_OUTPUT,
    Data: "- - - placeholder - - -",
};

export const PARAMS: IDB2Parameter[] = [
    PARAM_INPUT,
    PARAM_INOUT,
    PARAM_OUT,
];

export const ERROR = {
    error: "[node-ibm_db] Error in ODBCConnection::SomeQuery while executing query.",
    errors: [] as any,
    message: "\n[DB2] SQL01234N 'SCHEMA.TABLE' is an undefined name. SQLSTATE=45678\n\n",
    state: "45678",
    sqlcode: -123,
};
