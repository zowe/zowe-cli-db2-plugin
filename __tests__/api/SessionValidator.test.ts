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

import { SessionValidator, IDB2Session } from "../../src";
import * as C from "../__src__/Db2TestConstants";

const SESSION_GOOD: IDB2Session = {
    database: C.DATABASE_NAME,
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
};

const SESSION_NO_HOST: IDB2Session = {
    database: C.DATABASE_NAME,
    hostname: undefined,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
};

const SESSION_NO_PORT: IDB2Session = {
    database: C.DATABASE_NAME,
    hostname: C.HOST_NAME,
    port: null,
    user: C.USER_NAME,
    password: C.PASSWORD,
};

const SESSION_NO_DB: IDB2Session = {
    database: "",
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
};

const SESSION_NO_USER: IDB2Session = {
    database: C.DATABASE_NAME,
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: undefined,
    password: C.PASSWORD,
};

const SESSION_NO_PASS: IDB2Session = {
    database: C.DATABASE_NAME,
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: undefined,
};

describe("SessionValidator", () => {
    describe("validate", () => {
        it("should accept a valid DB2 session object", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_GOOD);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeUndefined();
        });

        it("should fail validating a null DB2 session object", () => {
            let error;
            try {
                SessionValidator.validate(null);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating an empty DB2 session object", () => {
            let error;
            const empty: any = {};
            try {
                SessionValidator.validate(empty);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating a DB2 session object with empty 'hostname' field", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_NO_HOST);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating a DB2 session object with empty 'port' field", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_NO_PORT);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating a DB2 session object with empty 'database' field", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_NO_DB);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating a DB2 session object with empty 'username' field", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_NO_USER);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });

        it("should fail validating a DB2 session object with empty 'password' field", () => {
            let error;
            try {
                SessionValidator.validate(SESSION_NO_PASS);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error.toString()).toMatchSnapshot();
        });
    });
});
