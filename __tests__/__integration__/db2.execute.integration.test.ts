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
import { ITestEnvironment, TestEnvironment, runCliScript } from "@zowe/cli-test-utils";
import { IIntegrationTestProperties } from "./doc/IIntegrationTestProperties";

// Skip the entire suite if custom_properties.yaml is absent (no live Db2 configured)
const PROPS_PATH = path.resolve(__dirname, "../__resources__/properties/custom_properties.yaml");
const describeOrSkip = fs.existsSync(PROPS_PATH) ? describe : describe.skip;

const SCRIPTS = path.resolve(__dirname, "__scripts__");

let TEST_ENV: ITestEnvironment<IIntegrationTestProperties>;

describeOrSkip("db2 execute sql — integration (live Db2)", () => {

    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "integration_execute",
        });
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("smoke test: SELECT 1 FROM SYSIBM.SYSDUMMY1", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_smoke.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
    });

    it("row count: SELECT COUNT(*) FROM SYSIBM.SYSTABLES", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_rowcount.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data[0]).toBeDefined();
    });

    it("no rows: SELECT with guaranteed empty result", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_norows.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    it("string types: VALUES with CHAR and VARCHAR casts", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_strings.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data[0]).toBeDefined();
        const row = data[0];
        expect(row.C.trim()).toBe("hello");
        expect(row.V).toBe("world");
    });

    it("numeric types: VALUES with SMALLINT, INTEGER, BIGINT, DECIMAL, REAL, DOUBLE", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_numerics.sh"), TEST_ENV);
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
        const response = runCliScript(path.join(SCRIPTS, "execute_datetime.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        const row = data[0];
        expect(row.D).toBeTruthy();
        expect(row.T).toBeTruthy();
        expect(row.TS).toBeTruthy();
    });

    it("error: bad SQL returns non-zero exit", () => {
        const response = runCliScript(path.join(SCRIPTS, "execute_badsql.sh"), TEST_ENV);
        expect(response.status).not.toBe(0);
        expect(response.stderr.toString()).toMatch(/SQLCODE|error/i);
    });

});
