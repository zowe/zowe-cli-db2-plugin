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
import { IDB2Session } from "../rest/session/doc/IDB2Session";
import { DB2Error } from "./DB2Error";
import { IDB2Column } from "./doc/IDB2Column";
import { noDatabaseName, noTableName } from "./doc/Messages";
import { SessionValidator } from "./SessionValidator";
import { DB2DriverFactory } from "./driver/DB2DriverFactory";
import { IDB2Driver } from "./driver/IDB2Driver";

/**
 * Class to handle exporting of DB2 tables
 * @export
 * @class ExportTable
 */
export abstract class ExportTable {

    /**
     * The database name
     */
    protected readonly mDatabase: string;

    /**
     * The table name
     */
    protected readonly mTable: string;

    /**
     * The table metadata
     */
    protected mMetadata: IDB2Column[] | null;

    /**
     * The session object
     */
    protected readonly mSession: IDB2Session;

    /**
     * Driver instance
     */
    private readonly mDriver: IDB2Driver;

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
        this.mSession = session;
        this.mDatabase = databaseName;
        this.mTable = tableName;
        this.mDriver = DB2DriverFactory.getDriver(session);
        this.mMetadata = null;
    }

    public async init() {
        try {
            this.mMetadata = await this.getTableMeta();
        }
        catch (err) {
            DB2Error.process(err);
        }
        if (Array.isArray(this.mMetadata) && this.mMetadata.length === 0) {
            throw new ImperativeError({msg: `Error getting metadata for the table ${this.mDatabase}.${this.mTable}`});
        }
    }

    /**
     * Get table metadata
     * @returns {Promise<IDB2Column[]>}
     * @memberof ExportTable
     */
    public async getTableMeta(): Promise<IDB2Column[]> {
        if (this.mMetadata == null) {
            this.mMetadata = await this.mDriver.getTableColumns(this.mDatabase, this.mTable);
        }
        return this.mMetadata;
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
     * Supply data from table row by row
     * @returns {IterableIterator<any>}
     */
    public rows(): IterableIterator<any> {
        const columns = this.getColumnNames();
        return this.mDriver.getTableRows(this.mDatabase, this.mTable, columns);
    }

    /**
     * Extract a list of columns out of table metadata
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
