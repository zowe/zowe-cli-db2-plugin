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

let TEST_ENV: ITestEnvironment;

describe("db2 call command", () => {

    // Create the unique test environment
    beforeAll(async () => {
        TEST_ENV = await TestEnvironment.setUp({
            installPlugin: true,
            tempProfileTypes: ["db2"],
            testName: "call_command"
        });
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(TEST_ENV);
    });

    it("should display the help", () => {
        const response = runCliScript(__dirname + "/__scripts__/call_help.sh", TEST_ENV);
        expect(response.status).toBe(0);
        expect(response.stdout.toString()).toMatchSnapshot();
        expect(response.stderr.toString()).toBe("");
    });

    it("should fail with invalid parameter", async () => {
        const response = runCliScript(__dirname + "/__scripts__/invalid_parameter.sh", TEST_ENV);
        expect(response.status).toBe(1);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
    });

    it("should fail with invalid option", async () => {
        const response = runCliScript(__dirname + "/__scripts__/invalid_option.sh", TEST_ENV);
        expect(response.status).toBe(1);
        expect(response.stderr.toString()).toMatchSnapshot();
        expect(response.stdout.toString()).toMatchSnapshot();
    });
});
