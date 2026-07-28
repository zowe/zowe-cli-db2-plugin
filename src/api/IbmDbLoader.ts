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
import { ImperativeError } from "@zowe/imperative";

/**
 * Returns the directory containing the installed ibm_db package.
 *
 * ibm_db's package.json is a plain JSON file that resolves successfully
 * even when the native binary (odbc_bindings.node) has not been compiled,
 * so this function is safe to call before the binary exists.
 */
export function getIbmDbDir(): string {
    try {
        return path.dirname(require.resolve("ibm_db/package.json"));
    } catch {
        return "<ibm_db package directory>";
    }
}

/**
 * Builds the remediation message for a missing ibm_db native binary,
 * embedding the actual ibm_db install path so the user can run the fix
 * without searching for the directory themselves.
 *
 * WHY NOT `npm install-scripts approve ibm_db`:
 *   ibm_db ships as a bundledDependency inside @zowe/db2-for-zowe-cli.
 *   npm extracts bundled packages directly from the tarball and never runs
 *   its registry install pipeline for them — so no "pending script" record
 *   is ever created, and `approve` returns ENOMATCH.
 *
 * THE CORRECT FIX:
 *   Run ibm_db's install script directly via `npm run install`.
 *   Explicit `npm run` calls are NOT subject to npm 12's lifecycle blocking.
 *   The script downloads the IBM ODBC driver and installs a prebuilt binary.
 *   No plugin reinstall is needed afterward.
 */
export function ibmDbMissingRemediation(ibmDbDir: string): string {
    return (
        "Under npm 12, install scripts are blocked by default.\n" +
        "The ibm_db ODBC driver requires its install script to compile a\n" +
        "native C++ binary (odbc_bindings.node). That script was not run.\n" +
        "\n" +
        "Note: 'npm install-scripts approve ibm_db' does NOT work here.\n" +
        "ibm_db is a bundled dependency — npm never registers a pending-script\n" +
        "record for bundled packages, so approve returns ENOMATCH.\n" +
        "\n" +
        "To resolve, run ibm_db's install script directly:\n" +
        "\n" +
        `  cd "${ibmDbDir}"\n` +
        "  npm run install\n" +
        "\n" +
        "This downloads the IBM ODBC driver and installs the native binary.\n" +
        "No plugin reinstall is needed after running the above commands.\n" +
        "\n" +
        "For more information, see:\n" +
        "  https://docs.zowe.org/stable/troubleshoot/troubleshoot-db2-plugin"
    );
}

let _ibmdb: typeof import("ibm_db") | undefined;

/**
 * Lazily loads ibm_db. Defers the require() to first use so that the DB2
 * plugin's command definitions load successfully even when the ibm_db native
 * binary (odbc_bindings.node) is absent.
 *
 * Under npm 12 install scripts are blocked by default. ibm_db requires its
 * install script to compile the native C++ ODBC driver. When that script is
 * blocked the binary is never built, and every DB2 command fails here with a
 * clear, actionable error rather than a cryptic module-not-found at load time.
 */
export function getIbmDb(): typeof import("ibm_db") {
    if (_ibmdb == null) {
        try {
            _ibmdb = require("ibm_db");
        } catch (err) {
            const msg = (err as Error).message ?? "";
            const isMissingBinary =
                msg.includes("locate the bindings") ||
                msg.includes("odbc_bindings") ||
                msg.includes("MODULE_NOT_FOUND");

            if (isMissingBinary) {
                throw new ImperativeError({
                    msg: "The DB2 plugin requires the ibm_db native binary, which was not built.",
                    additionalDetails: ibmDbMissingRemediation(getIbmDbDir()),
                });
            }
            throw err;
        }
    }
    return _ibmdb;
}
