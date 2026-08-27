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

/**
 * Properties read from custom_properties.yaml for integration tests.
 * Kept separate from ITestPropertiesSchema to avoid touching the existing
 * system test infrastructure.
 */
export interface IIntegrationTestProperties {
    db2: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        sslFile?: string;
        driverType?: string;
        jdbcJarPath?: string;
        jdbcLicensePath?: string;
        javaPath?: string;
        jdbcProperties?: string;
    };
}
