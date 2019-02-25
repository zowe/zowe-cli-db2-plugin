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
let host: string;
let port: number;
let user: string;
let password: string;
let database: string;
describe("db2 execute sql command", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "execute_sql_command",
        });

        host = TEST_ENV.systemTestProperties.db2.host;
        port = TEST_ENV.systemTestProperties.db2.port;
        user = TEST_ENV.systemTestProperties.db2.user;
        password = TEST_ENV.systemTestProperties.db2.password;
        database = TEST_ENV.systemTestProperties.db2.database;
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("should display the help", () => {
        const response = runCliScript(__dirname + "/__scripts__/sql_help.sh", TEST_ENV);
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
    });

    it("should fail with invalid option", () => {
        const response = runCliScript(__dirname + "/__scripts__/sql_invalid_option.sh", TEST_ENV);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(1);
    });

    it("should not accept mutually exclusive options", () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_query_file.sh", TEST_ENV);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(1);
    });

    it("should complete the command successfully and return a valid JSON response", () => {
        const response = runCliScript(__dirname + "/__scripts__/success_rfj.sh", TEST_ENV);
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(0);
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
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(0);
    });


    it("should be able to execute SQL statements overriding some of the options by arguments", () => {
        const response = runCliScript(__dirname + "/__scripts__/success_override_profile.sh",
            TEST_ENV, [host, port, database]);
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(0);
    });

    it("should fail when file doesn't exist", () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_no_file.sh", TEST_ENV);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toBe("");
        expect(response.status).toBe(1);
    });
});

describe("should execute sql commands without profile", async () => {
// Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            testName: "execute_sql_command",
        });

        host = TEST_ENV.systemTestProperties.db2.host;
        port = TEST_ENV.systemTestProperties.db2.port;
        user = TEST_ENV.systemTestProperties.db2.user;
        password = TEST_ENV.systemTestProperties.db2.password;
        database = TEST_ENV.systemTestProperties.db2.database;
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("should be able to execute SQL statements using passed options not profile", () => {
        const response = runCliScript(__dirname + "/__scripts__/success_no_profile.sh",
            TEST_ENV, [host, port, user, password, database]);
        expect(response.stderr.toString()).toBe("");
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.status).toBe(0);
    });
});
