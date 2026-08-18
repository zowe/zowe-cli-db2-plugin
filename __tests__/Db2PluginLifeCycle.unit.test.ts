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

import * as path from "path";
import { ImperativeError, Logger } from "@zowe/imperative";
import Db2PluginLifeCycle = require("../src/Db2PluginLifeCycle");

describe("Db2PluginLifeCycle", () => {
    const ibmDbDir = path.dirname(require.resolve("ibm_db/package.json"));

    let loadSpy: jest.SpyInstance;
    let logWarnSpy: jest.Mock;
    let logDebugSpy: jest.Mock;

    beforeEach(() => {
        loadSpy = jest.spyOn(Db2PluginLifeCycle as any, "loadNativeModule").mockImplementation(() => undefined);
        logWarnSpy = jest.fn();
        logDebugSpy = jest.fn();
        jest.spyOn(Logger, "getImperativeLogger").mockReturnValue({
            warn: logWarnSpy,
            debug: logDebugSpy
        } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("postInstall", () => {
        it("should succeed quietly when the ibm_db module can be loaded", () => {
            expect(() => new Db2PluginLifeCycle().postInstall()).not.toThrow();

            expect(loadSpy).toHaveBeenCalledTimes(1);
            expect(logWarnSpy).not.toHaveBeenCalled();
            expect(logDebugSpy).toHaveBeenCalledTimes(1);
            expect(logDebugSpy.mock.calls[0][0]).toContain("loaded successfully");
        });

        it("should throw an ImperativeError when the ibm_db module cannot be loaded", () => {
            const requireErrMsg = "Could not locate the bindings file. Tried: odbc_bindings.node";
            loadSpy.mockImplementation(() => { throw new Error(requireErrMsg); });

            let caughtErr: any;
            try {
                new Db2PluginLifeCycle().postInstall();
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).toBeInstanceOf(ImperativeError);
            const errMsg: string = caughtErr.message;

            // the user is told what is wrong and why
            expect(errMsg).toContain("its required 'ibm_db' module could not be loaded");
            expect(errMsg).toContain("Db2 commands will fail");
            expect(errMsg).toContain(`Reason = ${requireErrMsg}`);
            expect(errMsg).toContain("lifecycle scripts of a bundled dependency");
            expect(errMsg).toContain("'--allow-scripts' option of 'plugins install' does not change that behavior");

            // the user is told how to finish the installation, and where to run the commands
            expect(errMsg).toContain(`cd "${ibmDbDir}"`);
            expect(errMsg).toContain("npm run install");
            expect(errMsg).toContain("IBM_DB_HOME");
            expect(errMsg).toContain(path.join(ibmDbDir, "README.md"));

            // the same message is recorded in the imperative log
            expect(logWarnSpy).toHaveBeenCalledTimes(1);
            expect(logWarnSpy.mock.calls[0][0]).toBe(errMsg);
            expect(logDebugSpy).not.toHaveBeenCalled();
        });

        it("should tolerate a thrown value that has no message", () => {
            loadSpy.mockImplementation(() => { throw "some string failure"; });

            let caughtErr: any;
            try {
                new Db2PluginLifeCycle().postInstall();
            } catch (err) {
                caughtErr = err;
            }

            expect(caughtErr).toBeInstanceOf(ImperativeError);
            expect(caughtErr.message).toContain("Reason = some string failure");
        });
    });

    describe("preUninstall", () => {
        it("should do nothing", () => {
            expect(() => new Db2PluginLifeCycle().preUninstall()).not.toThrow();
            expect(logWarnSpy).not.toHaveBeenCalled();
        });
    });
});
