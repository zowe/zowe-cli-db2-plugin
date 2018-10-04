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

jest.mock("ibm_db");
const ibm_db = require("ibm_db"); // tslint:disable-line

import { ExportTableSQL } from "../../src";
import * as C from "../__src__/Db2TestConstants";

describe("ExportTable", () => {

    let exportSQL: ExportTableSQL;

    beforeEach(async () => {
        ibm_db.__setMockColumns(C.COLUMNS);
        ibm_db.__setMockResults(C.ROWS);
        exportSQL = new ExportTableSQL(C.SESSION, C.DATABASE_NAME, C.TABLE_NAME);
        await exportSQL.init();
    });

    describe("escape", () => {

        it("should return 'NULL' for null values", () => {
            expect(exportSQL.escape("V", null)).toBe("NULL");
        });

        it("should add quotes for CHAR column type", () => {
            expect(exportSQL.escape("C", C.ROWS[0].C)).toBe(`'${C.ROWS[0].C}'`);
        });

        it("should add quotes for VARCHAR column type", () => {
            expect(exportSQL.escape("V", C.ROWS[0].V)).toBe(`'${C.ROWS[0].V}'`);
        });

        it("should add quotes for DATE column type", () => {
            expect(exportSQL.escape("D", C.ROWS[0].D)).toBe(`'${C.ROWS[0].D}'`);
        });

        it("should add quotes for TIME column type", () => {
            expect(exportSQL.escape("T", C.ROWS[0].T)).toBe(`'${C.ROWS[0].T}'`);
        });

        it("should add quotes for TIMESTAMP column type", () => {
            expect(exportSQL.escape("S", C.ROWS[0].S)).toBe(`'${C.ROWS[0].S}'`);
        });

        it("should return value as is for other types", () => {
            expect(exportSQL.escape("I", C.ROWS[0].I)).toBe(C.ROWS[0].I);
        });
    });

    describe("buildInsertStatement", () => {
        it("should create an INSERT SQL statement", () => {
            const insert = exportSQL.buildInsertStatement(C.ROWS[0]);
            expect(insert).toMatchSnapshot();
        });
    });

    describe("getTableMeta", () => {
        it("should return a table meta data", async () => {
            const meta = await exportSQL.getTableMeta();
            expect(meta).toEqual(C.COLUMNS);
        });
    });

    describe("getColumnMeta", () => {
        it("should provide column meta data by column name", () => {
            for (const column of C.COLUMNS) {
                const meta = exportSQL.getColumnMeta(column.COLUMN_NAME);
                expect(meta).toEqual(column);
            }
        });
    });

    describe("getColumnNames", () => {
        it("should be able to extract column names", () => {
            const columnNames = exportSQL.getColumnNames();
            expect(columnNames.length).toBe(C.COLUMNS.length);
            expect(columnNames).toMatchSnapshot();
        });
    });

    describe("rows", () => {
        it("should return rows one by one", () => {
            const rows: any[] = [];
            let err;
            let row;

            try {
                const exporter = exportSQL.rows();
                while (!(row = exporter.next()).done) {
                    rows.push(row.value);
                }
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(rows.length).toBe(C.ROWS.length);
            expect(rows).toEqual(C.ROWS);
        });
    });

    describe("export", () => {
        it("should return the table's rows as an SQL INSERT statements", () => {
            const inserts: string[] = [];
            let err;

            let row;
            try {
                const exporter = exportSQL.export();
                while (!(row = exporter.next()).done) {
                    inserts.push(row.value);
                }
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(inserts.length).toBe(C.ROWS.length);
            expect(inserts).toMatchSnapshot();
        });
    });
});
