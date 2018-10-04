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

import { ITestEnvironment } from "../../../__src__/environment/doc/response/ITestEnvironment";
import { TestEnvironment } from "../../../__src__/environment/TestEnvironment";
import { runCliScript } from "../../../__src__/TestUtils";
import { ICommandResponse } from "@brightside/imperative";

let TEST_ENV: ITestEnvironment;

describe("db2 execute sql command", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "execute_sql_command",
        });
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("should display the help", () => {
        const response = runCliScript(__dirname + "/__scripts__/sql_help.sh", TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.stderr.toString()).toBe("");
    });

    it("should fail with invalid option", () => {
        const response = runCliScript(__dirname + "/__scripts__/sql_invalid_option.sh", TEST_ENV);
        expect(response.status).toBe(1);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
    });

    it("should not accept mutually exclusive options", () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_query_file.sh", TEST_ENV);
        expect(response.status).toBe(1);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
    });

    it("should complete the command successfully and return a valid JSON response", () => {
        const response = runCliScript(__dirname + "/__scripts__/success_rfj.sh", TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
        // Convert response to an object and check fields
        const respObj: ICommandResponse  = JSON.parse(response.stdout.toString());
        expect(respObj.success).toBe(true);
        expect(respObj.message).toBe("");
        expect(respObj.stderr).toBe("");
        expect(respObj.error).toBeUndefined();
        expect((respObj.data as any[]).length).toBeGreaterThan(0);
    });

    it("should be able to execute SQL statements from file", () => {
        const response = runCliScript(__dirname + "/__scripts__/success_file.sh", TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
    });

    it("should fail when file doesn't exist", () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_no_file.sh", TEST_ENV);
        expect(response.status).toBe(1);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toBe("");
    });
});
