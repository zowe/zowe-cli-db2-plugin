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

import { ImperativeExpect, ImperativeError } from "@brightside/imperative";
import { ConnectionString, DB2Constants, IDB2Session, IDB2Column, SessionValidator } from "../";
import * as ibmdb from "ibm_db";
import { noDatabaseName, noTableName } from "./doc/Messages";

/**
 * Class to handle exporting of DB2 tables
 * @export
 * @class ExportTable
 */
export abstract class ExportTable {

    /**
     * The database name
     * @type {string}
     * @memberof ExportTable
     * @private
     */
    protected readonly mDatabase: string;

    /**
     * The table name
     * @type {string}
     * @memberof ExportTable
     * @private
     */
    protected readonly mTable: string;

    /**
     * The table metadata
     * @type {IDB2Column[]|null}
     * @memberof ExportTable
     * @private
     */
    protected mMetadata: IDB2Column[] | null;

    /**
     * Connection to a DB2 region
     * @type {ibmdb.Database}
     * @memberof ExportTable
     * @private
     */
    private mConnection: ibmdb.Database;

    /**
     * The connection string to use with the ODBC driver
     * @type {string}
     * @memberof ExportTable
     * @private
     */
    private readonly mConnectionString: string;

    /**
     * Constructor
     * @param {IDB2Session} session DB2 session parameters
     * @param {string} databaseName Name of the database
     * @param {string} tableName Name of the table
     */
    constructor(session: IDB2Session, databaseName: string, tableName: string) {
        SessionValidator.validate(session);
        ImperativeExpect.toBeDefinedAndNonBlank(databaseName, noDatabaseName.message);
        ImperativeExpect.toBeDefinedAndNonBlank(tableName, noTableName.message);
        this.mDatabase = databaseName;
        this.mTable = tableName;
        this.mConnectionString = ConnectionString.buildFromSession(session);
        this.mMetadata = null;
    }

    public async init() {
        const options = {
            fetchMode: DB2Constants.FETCH_MODE_OBJECT,
        };
        try {
            this.mConnection = ibmdb.openSync(this.mConnectionString, options);
        }
        catch (err) {
            throw new ImperativeError({msg: err.toString()});
        }
        this.mMetadata = await this.getTableMeta();
        if (Array.isArray(this.mMetadata) && this.mMetadata.length === 0) {
            throw new ImperativeError({msg: `Error getting metadata for the table ${this.mDatabase}.${this.mTable}`});
        }
    }

    /**
     * Get a table metadata
     * @returns {Promise<IDB2Column[]>}
     * @memberof ExportTable
     */
    public getTableMeta(): Promise<IDB2Column[]> {
        return new Promise((resolve, reject) => {
            if (this.mMetadata == null) {
                this.mConnection.columns(null, this.mDatabase, this.mTable, null, (err, res) => {
                    if (err !== null) {
                        reject(err);
                    }
                    resolve(res);
                });
            }
            else {
                resolve(this.mMetadata);
            }
        });
    }

    public getColumnMeta(columnName: string): IDB2Column {
        for (const meta of this.mMetadata) {
            if (meta.COLUMN_NAME === columnName) {
                return meta;
            }
        }
        return null;
    }

    /**
     * Supply data from table by one row
     * @returns {IterableIterator<any>}
     */
    public *rows(): IterableIterator<any> {
        const columns = this.getColumnNames().join(", ");
        const query = `SELECT ${columns} FROM ${this.mDatabase}.${this.mTable}`;
        const result = this.mConnection.queryResultSync(query);
        let row = result.fetchSync();
        while (row != null) {
            yield row;
            row = result.fetchSync();
        }
        result.closeSync();
    }

    /**
     * Extract a list of columns out of a table metadata
     * @returns {string[]} Columns list
     */
    public getColumnNames(): string[] {
        const columnNames: string[] = [];
        for (const column of this.mMetadata) {
            columnNames.push(column.COLUMN_NAME);
        }
        return columnNames;
    }

    public abstract export(): any;
}
