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

import { DB2Error } from "../../src";
import { ImperativeError } from "@zowe/imperative";
import * as C from "../__src__/Db2TestConstants";

describe("DB2Error", () => {
    describe("process", () => {
        it("should throw an error", () => {
            let error;
            try {
                DB2Error.process(C.ERROR);
            }
            catch (e) {
                error = e;
            }
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(ImperativeError);
            expect(error.toString()).toMatchSnapshot();
        });
    });
});
