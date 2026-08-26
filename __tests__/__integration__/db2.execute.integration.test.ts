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

import * as fs from "fs";
import * as path from "path";
import { runCliScript } from "@zowe/cli-test-utils";

// Integration tests require zowe.config.json at the project root (gitignored).
// The entire suite is skipped when the file is absent so CI is unaffected.
const CONFIG_PATH = path.resolve(__dirname, "../../zowe.config.json");
const SCRIPTS = path.resolve(__dirname, "__scripts__");

const describeOrSkip = fs.existsSync(CONFIG_PATH) ? describe : describe.skip;

describeOrSkip("db2 execute sql — integration (live Db2)", () => {

    it("smoke test: SELECT 1 FROM SYSIBM.SYSDUMMY1", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_smoke.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
    });

    it("row count: SELECT COUNT(*) FROM SYSIBM.SYSTABLES", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_rowcount.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data[0]).toBeDefined();
    });

    it("no rows: SELECT with guaranteed empty result", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_norows.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    it("string types: VALUES with CHAR and VARCHAR casts", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_strings.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data[0]).toBeDefined();
        const row = data[0];
        expect(row.C.trim()).toBe("hello");
        expect(row.V).toBe("world");
    });

    it("numeric types: VALUES with SMALLINT, INTEGER, BIGINT, DECIMAL, REAL, DOUBLE", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_numerics.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        const row = data[0];
        expect(Number(row.SI)).toBe(1);
        expect(Number(row.I)).toBe(42);
        expect(Number(row.BI)).toBe(9999999999);
        expect(Number(row.D)).toBeCloseTo(3.14, 1);
    });

    it("date/time types: VALUES with CURRENT DATE, TIME, TIMESTAMP", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_datetime.sh"), process.cwd() as any);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        const row = data[0];
        expect(row.D).toBeTruthy();
        expect(row.T).toBeTruthy();
        expect(row.TS).toBeTruthy();
    });

    it("error: bad SQL returns non-zero exit", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_badsql.sh"), process.cwd() as any);
        expect(response.status).not.toBe(0);
        expect(response.stderr.toString()).toMatch(/SQLCODE|error/i);
    });

});
