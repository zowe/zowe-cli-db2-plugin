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

const CREATE_TYPESMAP = [
    "CREATE PROCEDURE TYPESMAP (",
    "    IN  ICHAR        CHARACTER(20),",
    "    IN  IVARCHAR     VARCHAR(20),",
    "    IN  ISMALLINT    SMALLINT,",
    "    IN  IINTEGER     INTEGER,",
    "    IN  IBIGINT      BIGINT,",
    "    IN  IDECIMAL     DECIMAL(10,2),",
    "    IN  IREAL        REAL,",
    "    IN  IDOUBLE      DOUBLE,",
    "    IN  IDATE        DATE,",
    "    IN  ITIME        TIME,",
    "    IN  ITIMESTAMP   TIMESTAMP,",
    "    OUT OCHAR        CHARACTER(20),",
    "    OUT OVARCHAR     VARCHAR(20),",
    "    OUT OSMALLINT    SMALLINT,",
    "    OUT OINTEGER     INTEGER,",
    "    OUT OBIGINT      BIGINT,",
    "    OUT ODECIMAL     DECIMAL(10,2),",
    "    OUT OREAL        REAL,",
    "    OUT ODOUBLE      DOUBLE,",
    "    OUT ODATE        DATE,",
    "    OUT OTIME        TIME,",
    "    OUT OTIMESTAMP   TIMESTAMP",
    ") LANGUAGE SQL",
    "BEGIN",
    "    SET OCHAR      = ICHAR;",
    "    SET OVARCHAR   = IVARCHAR;",
    "    SET OSMALLINT  = ISMALLINT;",
    "    SET OINTEGER   = IINTEGER;",
    "    SET OBIGINT    = IBIGINT;",
    "    SET ODECIMAL   = IDECIMAL;",
    "    SET OREAL      = IREAL;",
    "    SET ODOUBLE    = IDOUBLE;",
    "    SET ODATE      = IDATE;",
    "    SET OTIME      = ITIME;",
    "    SET OTIMESTAMP = ITIMESTAMP;",
    "END",
].join(" ");

const DROP_TYPESMAP = "DROP PROCEDURE TYPESMAP";

describeOrSkip("db2 call stored-proc — integration (live Db2, TYPESMAP)", () => {

    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "integration_call",
        });
        // Drop any leftover from a previous failed run, ignore errors
        runCliScript(path.join(SCRIPTS, "execute_inline.sh"), TEST_ENV, [DROP_TYPESMAP]);
        // Create the type-mapping procedure under the current user's schema
        const create = runCliScript(path.join(SCRIPTS, "execute_inline.sh"), TEST_ENV, [CREATE_TYPESMAP]);
        if (create.status !== 0) {
            throw new Error(`Failed to create TYPESMAP: ${create.stderr.toString()}`);
        }
    });

    afterAll(async () => {
        runCliScript(path.join(SCRIPTS, "execute_inline.sh"), TEST_ENV, [DROP_TYPESMAP]);
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("string OUT params round-trip (CHAR, VARCHAR)", () => {
        const response = runCliScript(path.join(SCRIPTS, "call_typesmap_strings.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data.success).toBe(true);
        const results: any[] = data.results;
        expect(results[0].trim()).toBe("hello");   // OCHAR
        expect(results[1]).toBe("world");           // OVARCHAR
    });

    it("numeric OUT params round-trip (SMALLINT, INTEGER, BIGINT, DECIMAL, REAL, DOUBLE)", () => {
        const response = runCliScript(path.join(SCRIPTS, "call_typesmap_numerics.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data.success).toBe(true);
        const results: any[] = data.results;
        expect(Number(results[0])).toBe(1);              // OSMALLINT
        expect(Number(results[1])).toBe(42);             // OINTEGER
        expect(Number(results[2])).toBe(9999999999);     // OBIGINT
        expect(Number(results[3])).toBeCloseTo(3.14, 1); // ODECIMAL
    });

    it("date/time OUT params round-trip (DATE, TIME, TIMESTAMP)", () => {
        const response = runCliScript(path.join(SCRIPTS, "call_typesmap_datetime.sh"), TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        const data = JSON.parse(response.stdout.toString());
        expect(data.success).toBe(true);
        const results: any[] = data.results;
        expect(results[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);  // ODATE
        expect(results[1]).toMatch(/^\d{2}:\d{2}:\d{2}/);   // OTIME
        expect(results[2]).toMatch(/^\d{4}-\d{2}-\d{2}/);   // OTIMESTAMP
    });

});
