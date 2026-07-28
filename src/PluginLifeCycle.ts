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

import { AbstractPluginLifeCycle } from "@zowe/imperative";
import { getIbmDbDir, ibmDbMissingRemediation } from "./api/IbmDbLoader";

/**
 * Zowe plugin lifecycle hooks for the DB2 plugin.
 *
 * postInstall runs after `zowe plugins install @zowe/db2-for-zowe-cli` —
 * as Zowe's own code, it executes regardless of npm's lifecycle-script
 * blocking policy (including npm 12's default of blocking all install scripts).
 *
 * This hook checks whether ibm_db's native binary was compiled. Under npm 12
 * the ibm_db install script is blocked, so the binary will be absent. When
 * that happens a warning is printed immediately after install with the exact
 * steps needed to resolve the problem, including the actual ibm_db path.
 *
 * IMPORTANT: This file must use `export =` (CommonJS default export) so that
 * Zowe's plugin manager can do `new lifeCycleClass()` directly on the require
 * result. A named `export class` compiles to a module object, not a constructor.
 */
class PluginLifeCycle extends AbstractPluginLifeCycle {
    public postInstall(): void {
        if (!this.isIbmDbBinaryPresent()) {
            const ibmDbDir = getIbmDbDir();
            process.stdout.write(
                "\n" +
                "WARNING: The DB2 plugin was installed, but the ibm_db native\n" +
                "         binary (odbc_bindings.node) was not compiled.\n" +
                "         DB2 commands will fail until the binary is built.\n" +
                "\n" +
                ibmDbMissingRemediation(ibmDbDir) +
                "\n"
            );
        }
    }

    public preUninstall(): void {
        // No cleanup required on uninstall.
    }

    /**
     * Returns true when ibm_db loads successfully (binary present and working).
     */
    private isIbmDbBinaryPresent(): boolean {
        try {
            require("ibm_db");
            return true;
        } catch {
            return false;
        }
    }
}

export = PluginLifeCycle;
