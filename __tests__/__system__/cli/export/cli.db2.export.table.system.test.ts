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
import * as fs from "fs";

let TEST_ENV: ITestEnvironment;
let hostname: string;
let port: number;
let username: string;
let password: string;
let database: string;

describe("db2 export table command", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "export_table_command",
        });

        hostname = TEST_ENV.systemTestProperties.db2.hostname;
        port = TEST_ENV.systemTestProperties.db2.port;
        username= TEST_ENV.systemTestProperties.db2.username;
        password = TEST_ENV.systemTestProperties.db2.password;
        database = TEST_ENV.systemTestProperties.db2.database;
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("should display the help", () => {
        const response = runCliScript(__dirname + "/__scripts__/table_help.sh", TEST_ENV);
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
    });

    it("should fail with invalid option", async () => {
        const response = runCliScript(__dirname + "/__scripts__/table_invalid_option.sh", TEST_ENV);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toBe("");
        expect(response.status).toBe(1);
    });

    it("should fail with empty table name", async () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_empty_table.sh", TEST_ENV);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toBe("");
        expect(response.status).toBe(1);
    });

    it("should fail to export a not existing table", () => {
        const response = runCliScript(__dirname + "/__scripts__/fail_table_not_exists.sh", TEST_ENV);
        expect(response.stderr.toString()).toContain("Error getting metadata for the table");
        expect(response.stdout.toString()).toBe("");
        expect(response.status).toBe(1);
    });

    it("should export the system roles table to the standard out", () => {
        const regex: RegExp = new RegExp(fs.readFileSync(__dirname + "/__regex__/export_table.regex").toString(), "gs");
        const response = runCliScript(__dirname + "/__scripts__/success_export_stdout.sh", TEST_ENV);
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expect(new RegExp(regex, "gs").test(response.stdout.toString())).toBe(true);
    });

    it("should export the system roles table to a file", () => {
        const regex = fs.readFileSync(__dirname + "/__regex__/export_table.regex").toString();
        const response = runCliScript(__dirname + "/__scripts__/success_export_file.sh", TEST_ENV);
        const outFilePath = TEST_ENV.workingDir + "/export.sql";
        expect(response.stdout.toString()).toBe("");
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expect(fs.existsSync(outFilePath)).toBe(true);
        const outFile = fs.readFileSync(outFilePath).toString();
        fs.unlinkSync(outFilePath);
        expect(new RegExp(regex, "gs").test(outFile)).toBe(true);
    });

    it("should export the system roles table to the standard out overriding some profile options by cmd arguments", () => {
        const regex: RegExp = new RegExp(fs.readFileSync(__dirname + "/__regex__/export_table.regex").toString(), "gs");
        const response = runCliScript(__dirname + "/__scripts__/success_override_profile.sh", TEST_ENV,
            [hostname, port, database]);
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expect(new RegExp(regex, "gs").test(response.stdout.toString())).toBe(true);
    });

});

describe("db2 export table command without profile", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            testName: "export_table_command",
        });

        hostname = TEST_ENV.systemTestProperties.db2.hostname;
        port = TEST_ENV.systemTestProperties.db2.port;
        username = TEST_ENV.systemTestProperties.db2.username;
        password = TEST_ENV.systemTestProperties.db2.password;
        database = TEST_ENV.systemTestProperties.db2.database;
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });


    it("should export the system roles table to the standard out without profile just using cmd options", () => {
        const regex: RegExp = new RegExp(fs.readFileSync(__dirname + "/__regex__/export_table.regex").toString(), "gs");
        const response = runCliScript(__dirname + "/__scripts__/success_no_profile.sh", TEST_ENV,
            [hostname, port, username, password, database]);
        expect(response.stderr.toString()).toBe("");
        expect(response.status).toBe(0);
        expect(new RegExp(regex, "gs").test(response.stdout.toString())).toBe(true);
    });
});
