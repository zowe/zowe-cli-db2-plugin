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
import { IDB2Session, ExportTable } from "../";
import { isNull } from "util";

/**
 * Class to handle exporting DB2 tables
 * @export
 * @class ExportTable
 */
export class ExportTableSQL extends ExportTable {

    /**
     * Constructor
     * @param {IDB2Session} session DB2 session parameters
     * @param {string} databaseName Name of the database
     * @param {string} tableName Name of the table
     */
    constructor(session: IDB2Session, databaseName: string, tableName: string) {
        super(session, databaseName, tableName);
    }

    /**
     * Export a DB2 table in SQL INSERT format
     * @memberof ExportTableSQL
     */
    public *export(): IterableIterator<string> {
        try {
            let row;
            const rows = this.rows();
            while (!(row = rows.next()).done) {
                yield this.buildInsertStatement(row.value);
            }
        }
        catch (err) {
            throw new ImperativeError({msg: err.toString()});
        }
    }

    /**
     * Make an SQL INSERT statement out of the table metadata and values
     * @param {any} data Object containing row data
     * @returns {string}
     */
    public buildInsertStatement(data: any): string {
        const columnNames = this.getColumnNames();
        const values: any[] = [];
        for (const columnName of columnNames) {
            values.push(this.escape(columnName, data[columnName]));
        }
        const columnList: string = columnNames.join(", ");
        const valuesList: string = values.join(", ");

        return `INSERT INTO ${this.mDatabase}.${this.mTable}(${columnList})\nVALUES(${valuesList})\n`;
    }

    /**
     * Add quotes to character types
     * @param {string} columnName Name of the column
     * @param value Value to escape
     * @returns {any}
     */
    public escape(columnName: string, value: any): any {
        const columnMeta = this.getColumnMeta(columnName);
        if (isNull(value)) {
            return "NULL";
        }
        switch (columnMeta.TYPE_NAME) {
            case "CHAR":
            case "DATE":
            case "TIME":
            case "TIMESTAMP":
            case "VARCHAR":
                return `'${value}'`;
            default:
                return value;
        }
    }
}
