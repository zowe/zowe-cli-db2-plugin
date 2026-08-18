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

import { IDB2Column } from "../doc/IDB2Column";
import { IDB2Parameter } from "../doc/IDB2Parameter";
import { IDB2Response } from "../doc/IDB2Response";

/**
 * Interface defining the operations supported by Db2 drivers (ODBC / JDBC)
 */
export interface IDB2Driver {
    /**
     * Execute SQL query statement and return array of result rows / sets
     */
    execute(sql: string, parameters?: IDB2Parameter[]): IterableIterator<any>;

    /**
     * Call a stored procedure and return procedure response
     */
    callSP(routineName: string, parameters?: IDB2Parameter[]): IDB2Response;

    /**
     * Get column metadata for a database table
     */
    getTableColumns(database: string, table: string): Promise<IDB2Column[]>;

    /**
     * Get table rows for specific columns
     */
    getTableRows(database: string, table: string, columns: string[]): IterableIterator<any>;
}
