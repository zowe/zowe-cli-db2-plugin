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

jest.mock("ibm_db");
const ibm_db = require("ibm_db"); // tslint:disable-line

import { ExecuteSQL } from "../../src";
import * as C from "../Db2TestConstants";

describe("ExecuteSQL", () => {
    beforeEach(() => {
        ibm_db.__setMockResults(C.ROWS);
    });

    it("should execute an SQL SELECT query and return the result", () => {
        const result: any[] = [];
        let err;

        let row;
        try {
            const executor = new ExecuteSQL(C.SESSION);
            const response = executor.execute(C.QUERY);
            while (!(row = response.next()).done) {
                result.push(row.value);
            }
        }
        catch (e) {
            err = e;
        }

        expect(err).toBeUndefined();
        expect(result.length).toBe(1);
        expect(result[0]).toEqual(C.ROWS);
    });
});
