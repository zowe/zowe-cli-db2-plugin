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

import { ConnectionString, IDB2Session } from "./../../src";
import * as C from "../Db2TestConstants";

const SIMPLE_SESSION: IDB2Session = {
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
    database: C.DATABASE_NAME,
};

const SECURE_SESSION: IDB2Session = {
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
    database: C.DATABASE_NAME,
    sslFile: C.SSL_FILE,
};

describe("ConnectionString", () => {
    describe("build", () => {
        it("should build correct connection string from session object", () => {
            const connectionString = ConnectionString.buildFromSession(SIMPLE_SESSION);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string from session object with certificate file", () => {
            const connectionString = ConnectionString.buildFromSession(SECURE_SESSION);
            expect(connectionString).toMatchSnapshot();
        });
    });

    describe("buildFromSession", () => {
        it("should build correct connection string without parameters", () => {
            const connectionString = ConnectionString.build();
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with 1 parameter", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with 2 parameters", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME, C.PORT);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with 3 parameters", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME, C.PORT, C.USER_NAME);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with 4 parameters", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME, C.PORT, C.USER_NAME, C.PASSWORD);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with 5 parameters", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME, C.PORT, C.USER_NAME, C.PASSWORD, C.DATABASE_NAME);
            expect(connectionString).toMatchSnapshot();
        });
        it("should build correct connection string with all parameters and a certificate file", () => {
            const connectionString = ConnectionString.build(C.HOST_NAME, C.PORT, C.USER_NAME, C.PASSWORD, C.DATABASE_NAME, C.SSL_FILE);
            expect(connectionString).toMatchSnapshot();
        });
    });
});
