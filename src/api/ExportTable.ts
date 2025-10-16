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

import { ImperativeExpect, ImperativeError } from "@zowe/imperative";
import * as ibmdb from "ibm_db";
import { IDB2Session } from "../rest/session/doc/IDB2Session";
import { ConnectionString } from "./ConnectionString";
import { DB2Error } from "./DB2Error";
import { IDB2Column } from "./doc/IDB2Column";
import { noDatabaseName, noTableName } from "./doc/Messages";
import { SessionValidator } from "./SessionValidator";

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
            fetchMode: ibmdb.FETCH_OBJECT,
        };
        try {
            this.mConnection = ibmdb.openSync(this.mConnectionString, options);
        }
        catch (err) {
            DB2Error.process(err);
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

                    let data: IDB2Column[] = [];
                    if (res[0] && !(Array.isArray(res[0]))) {
                        data = res as IDB2Column[];
                    }
                    resolve(data);
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
        if (result instanceof Error) {
            throw result;
        }
        let row = Array.isArray(result) ? result[0].fetchSync(): result.fetchSync();
        while (row != null) {
            yield row;
            row = Array.isArray(result) ? result[0].fetchSync(): result.fetchSync();
        }
        Array.isArray(result) ? result[0].closeSync(): result.closeSync();
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
