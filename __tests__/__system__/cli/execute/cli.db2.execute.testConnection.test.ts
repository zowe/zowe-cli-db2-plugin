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

import { ISetupEnvironmentParms } from "../../../__src__/environment/doc/parms/ISetupEnvironmentParms";
import { ITestEnvironment } from "../../../__src__/environment/doc/response/ITestEnvironment";
import { TestEnvironment } from "../../../__src__/environment/TestEnvironment";
import { runCliScript } from "../../../__src__/TestUtils";
import { ImperativeError, ImperativeExpect, IO } from "@zowe/imperative";
import { TempTestProfiles } from "../../../__src__/environment/TempTestProfiles";
import { ITestPropertiesSchema } from "../../../__src__/environment/doc/ITestPropertiesSchema";

let TEST_ENV: ITestEnvironment;

describe("Test Connection", () => {
  beforeAll(async () => {
    TEST_ENV = await setup({
      installPlugin: true,
      tempProfileTypes: ["db2"],
      testName: "test_db2_connection",
    });
  });

  afterAll(async () => {
    await cleanUp(TEST_ENV);
  });

  it("should be able to execute simple SQL statements to test connection", () => {
    const response = runCliScript(
      __dirname + "/__scripts__/success_simple_sql.sh",
      TEST_ENV
    );
    expect(response.stderr.toString()).toBe("");
    // expect(response.stdout.toString()).toMatchSnapshot();
    expect(response.stdout.toString().length).toBeGreaterThan(0);
    expect(response.stdout.toString()).toContain("Result #1");
    expect(response.status).toBe(0);
  });

  it("should be able to execute simple SQL statements with the -q alias", () => {
    const response = runCliScript(
      __dirname + "/__scripts__/success_simple_sql_alias.sh",
      TEST_ENV
    );
    expect(response.stderr.toString()).toBe("");
    // expect(response.stdout.toString()).toMatchSnapshot();
    expect(response.stdout.toString().length).toBeGreaterThan(0);
    expect(response.stdout.toString()).toContain("Result #1");
    expect(response.status).toBe(0);
  });
});

async function setup(
  params: ISetupEnvironmentParms
): Promise<ITestEnvironment> {
  ImperativeExpect.toNotBeNullOrUndefined(
    params,
    `${TestEnvironment.ERROR_TAG} createTestEnv(): No parameters supplied.`
  );
  ImperativeExpect.keysToBeDefinedAndNonBlank(
    params,
    ["testName"],
    `${TestEnvironment.ERROR_TAG} createTestEnv(): You must supply the name of the test. ` +
      `Used to append to the data directory for ease of identification.`
  );

  const testDirectory: string = TestEnvironment.createUniqueTestDataDir(
    params.testName
  );

  const systemProps: ITestPropertiesSchema = {
    db2: {
      host: process.env.npm_config_host,
      port: parseInt(process.env.npm_config_port),
      user: process.env.npm_config_user,
      password: process.env.npm_config_password,
      database: process.env.npm_config_database,
    },
  };

  const env: { [key: string]: string } = {};
  env["ZOWE_CLI_HOME"] = testDirectory;

  const result: ITestEnvironment = {
    workingDir: testDirectory,
    systemTestProperties: systemProps,
    env,
  };

  if (params.installPlugin) {
    await installPlugin(result);
    result.pluginInstalled = true;
  }

  result.tempProfiles = await TempTestProfiles.createProfiles(
    result,
    params.tempProfileTypes
  );

  return result;
}

async function installPlugin(testEnvironment: ITestEnvironment) {
  let installScript: string = "#!/bin/bash\n\n";
  installScript += "# Install plugin from root of project\n";
  installScript += "bright plugins install ../../../../\n";
  installScript += "# Validate installed plugin\n";
  installScript += "bright plugins validate @zowe/db2-for-zowe-cli\n";
  installScript += "# Check that the plugin help is available\n";
  installScript += "bright db2 --help\n";
  const scriptPath = testEnvironment.workingDir + "/install_plugin.sh";
  IO.writeFile(scriptPath, Buffer.from(installScript));

  const output = runCliScript(scriptPath, testEnvironment, []);
  if (output.status !== 0) {
    throw new ImperativeError({
      msg:
        "Install of '@zowe/db2-for-zowe-cli' plugin failed! You should delete the script: \n'" +
        scriptPath +
        "' " +
        "after reviewing it to check for possible errors.\n Output of the plugin install command:\n" +
        output.stderr.toString() +
        output.stdout.toString() +
        TempTestProfiles.GLOBAL_INSTALL_NOTE,
    });
  }
  IO.deleteFile(scriptPath);
}

async function cleanUp(testEnvironment: ITestEnvironment) {
  if (testEnvironment.tempProfiles != null) {
    await TempTestProfiles.deleteProfiles(testEnvironment);
  }
  if (testEnvironment.pluginInstalled) {
    const pluginDir = testEnvironment.workingDir + "/plugins";
    require("rimraf").sync(pluginDir);
  }
}
