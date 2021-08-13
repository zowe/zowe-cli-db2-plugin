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
const ibm_db = require("ibm_db");

import * as C from "../Db2TestConstants";
import { CallSP, IDB2Response } from "../../src";

describe("CallSP", () => {
    describe("callCommon", () => {

        it("should call SP and return a result", () => {
            ibm_db.__setMockResults(C.ROWS);
            ibm_db.__setMockParams([]);
            let err;
            let response: IDB2Response;

            try {
                response = CallSP.callCommon(C.SESSION, C.ROUTINE_NAME);
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(response.success).toBe(true);
            expect(response.results[0]).toEqual(C.ROWS);
        });

        it("should accept an array of parameters", () => {
            ibm_db.__setMockResults(C.ROWS);
            ibm_db.__setMockParams(C.PARAMS);
            const RESULT_LENGTH = 3;
            let err;
            let response: IDB2Response;

            try {
                response = CallSP.callCommon(C.SESSION, C.ROUTINE_NAME, C.PARAMS);
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(response.success).toBe(true);
            expect(response.results.length).toBe(RESULT_LENGTH);
            expect(response.results[0]).toBe(C.PARAM_INOUT.Data);
            expect(response.results[1]).toBe(C.PARAM_OUT.Data);
            expect(response.results[2]).toEqual(C.ROWS);
        });
    });

    describe("call", () => {

        it("should accept zero parameters", () => {
            ibm_db.__setMockResults(C.ROWS);
            ibm_db.__setMockParams([]);
            let err;
            let response: IDB2Response;

            try {
                response = CallSP.call(C.SESSION, C.ROUTINE_NAME);
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(response.success).toBe(true);
            expect(response.results[0]).toEqual(C.ROWS);
        });

        it("should accept multiple parameters", () => {
            ibm_db.__setMockResults(C.ROWS);
            ibm_db.__setMockParams(C.PARAMS);
            const RESULT_LENGTH = 3;
            let err;
            let response: IDB2Response;

            try {
                response = CallSP.call(C.SESSION, C.ROUTINE_NAME, C.PARAM_INPUT, C.PARAM_INOUT, C.PARAM_OUT);
            }
            catch (e) {
                err = e;
            }

            expect(err).toBeUndefined();
            expect(response.success).toBe(true);
            expect(response.results.length).toBe(RESULT_LENGTH);
            expect(response.results[0]).toBe(C.PARAM_INOUT.Data);
            expect(response.results[1]).toBe(C.PARAM_OUT.Data);
            expect(response.results[2]).toEqual(C.ROWS);
        });
    });
});
