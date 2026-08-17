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

import { DB2DriverFactory, OdbcDriver, JdbcDriver, IDB2Session } from "../../src";
import * as child_process from "child_process";
import * as C from "../Db2TestConstants";

jest.mock("child_process");

const ODBC_SESSION: IDB2Session = {
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
    database: C.DATABASE_NAME,
    driverType: "odbc",
};

const JDBC_SESSION: IDB2Session = {
    hostname: C.HOST_NAME,
    port: C.PORT,
    user: C.USER_NAME,
    password: C.PASSWORD,
    database: C.DATABASE_NAME,
    driverType: "jdbc",
    jdbcJarPath: "/path/to/db2jcc4.jar",
    jdbcLicensePath: "/path/to/db2jcc_license_cisuz.jar",
    javaPath: "/usr/bin/java",
};

describe("DB2DriverFactory", () => {
    it("should instantiate OdbcDriver when driverType is odbc or undefined", () => {
        const defaultDriver = DB2DriverFactory.getDriver({
            hostname: C.HOST_NAME,
            port: C.PORT,
            user: C.USER_NAME,
            password: C.PASSWORD,
            database: C.DATABASE_NAME,
        });
        expect(defaultDriver).toBeInstanceOf(OdbcDriver);

        const odbcDriver = DB2DriverFactory.getDriver(ODBC_SESSION);
        expect(odbcDriver).toBeInstanceOf(OdbcDriver);
    });

    it("should instantiate JdbcDriver when driverType is jdbc", () => {
        const jdbcDriver = DB2DriverFactory.getDriver(JDBC_SESSION);
        expect(jdbcDriver).toBeInstanceOf(JdbcDriver);
    });
});

describe("JdbcDriver", () => {
    it("should build correct classpath", () => {
        const driver = new JdbcDriver(JDBC_SESSION);
        const cp = driver.buildClasspath();
        expect(cp).toContain("/path/to/db2jcc4.jar");
        expect(cp).toContain("/path/to/db2jcc_license_cisuz.jar");
    });

    it("should execute SQL via Java subprocess", () => {
        const mockExec = jest.spyOn(child_process, "execFileSync").mockReturnValue(
            JSON.stringify([[{ COL1: "VAL1" }]])
        );

        const driver = new JdbcDriver(JDBC_SESSION);
        const results = Array.from(driver.execute("SELECT * FROM MYTABLE"));

        expect(mockExec).toHaveBeenCalled();
        expect(results).toEqual([[{ COL1: "VAL1" }]]);
        mockExec.mockRestore();
    });

    it("should call stored procedure via Java subprocess", () => {
        const mockExec = jest.spyOn(child_process, "execFileSync").mockReturnValue(
            JSON.stringify({ success: true, results: ["OUT_VAL"] })
        );

        const driver = new JdbcDriver(JDBC_SESSION);
        const resp = driver.callSP("MY_PROC", []);

        expect(resp.success).toBe(true);
        expect(resp.results).toEqual(["OUT_VAL"]);
        mockExec.mockRestore();
    });

    it("should get table columns via Java subprocess", async () => {
        const mockCols = [{ COLUMN_NAME: "COL1", DATA_TYPE: 4, TYPE_NAME: "INTEGER" }];
        const mockExec = jest.spyOn(child_process, "execFileSync").mockReturnValue(
            JSON.stringify(mockCols)
        );

        const driver = new JdbcDriver(JDBC_SESSION);
        const cols = await driver.getTableColumns("MYDB", "MYTABLE");

        expect(cols).toEqual(mockCols);
        mockExec.mockRestore();
    });
});
