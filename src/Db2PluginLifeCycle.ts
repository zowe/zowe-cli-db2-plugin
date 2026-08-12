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
import { AbstractPluginLifeCycle, ImperativeError, Logger } from "@zowe/imperative";
import { Constants } from "./Constants";

/**
 * Life cycle actions for the Db2 plug-in.
 *
 * The plug-in delivers the native `ibm_db` module as a bundled dependency.
 * npm does not run the lifecycle scripts of bundled dependencies (and as of
 * npm v12 it does not run them even when scripts are allowed), so the driver
 * install script that `ibm_db` relies on never runs during a plug-in install.
 * We use the post-install hook to detect that condition and to tell the user
 * how to complete the installation themselves.
 *
 * @export
 * @class Db2PluginLifeCycle
 */
class Db2PluginLifeCycle extends AbstractPluginLifeCycle {
    /**
     * The name of the native module that Db2 commands require.
     * @type {string}
     * @static
     * @memberof Db2PluginLifeCycle
     */
    public static readonly NATIVE_MODULE_NM: string = "ibm_db";

    /**
     * A horizontal rule used to make the reported steps stand out among the
     * other messages that are displayed while a plug-in is installed.
     * @type {string}
     * @static
     * @memberof Db2PluginLifeCycle
     */
    private static readonly DIVIDER: string =
        "____________________________________________________________________________________________________";

    /**
     * Confirm that the bundled native module can be loaded after the plug-in
     * has been installed. When it cannot be loaded, report the steps that the
     * user must perform to finish the installation.
     *
     * @throws {ImperativeError}
     *      When the native module cannot be loaded. The message contains the
     *      steps that complete the installation.
     * @memberof Db2PluginLifeCycle
     */
    public postInstall(): void {
        const impLogger = Logger.getImperativeLogger();
        try {
            Db2PluginLifeCycle.loadNativeModule();
            impLogger.debug(`The '${Db2PluginLifeCycle.NATIVE_MODULE_NM}' module was loaded successfully ` +
                `after the installation of ${Constants.DISPLAY_NAME}.`
            );
        } catch (err) {
            const warningMsg = Db2PluginLifeCycle.formIncompleteInstallMsg(err?.message ?? err);
            impLogger.warn(warningMsg);
            throw new ImperativeError({msg: warningMsg});
        }
    }

    /**
     * The Db2 plug-in makes no changes outside of its own installation
     * directory, so nothing must be reverted before it is uninstalled.
     *
     * @memberof Db2PluginLifeCycle
     */
    public preUninstall(): void {
        // nothing to do
    }

    /**
     * Attempt to load the native module that Db2 commands require.
     *
     * @private
     * @static
     * @throws When the native module has not been completely installed.
     * @memberof Db2PluginLifeCycle
     */
    private static loadNativeModule(): void {
        require(Db2PluginLifeCycle.NATIVE_MODULE_NM);
    }

    /**
     * Form the message that tells the user how to finish the installation of
     * the native module that this plug-in bundles.
     *
     * @private
     * @static
     * @param {string} reason The reason that the native module could not be loaded.
     * @returns {string} The multi-line message to report to the user.
     * @memberof Db2PluginLifeCycle
     */
    private static formIncompleteInstallMsg(reason: string): string {
        const nativeMod = Db2PluginLifeCycle.NATIVE_MODULE_NM;
        const nativeModDir = Db2PluginLifeCycle.findNativeModuleDir();

        return `\n${Db2PluginLifeCycle.DIVIDER}\n` +
            `${Constants.DISPLAY_NAME} was installed, but its required '${nativeMod}' module could not be loaded.\n` +
            `Db2 commands will fail until the installation of '${nativeMod}' is completed.\n` +
            `\n` +
            `Reason = ${reason}\n` +
            `\n` +
            `The plug-in delivers '${nativeMod}' as a bundled dependency, so that the plug-in can be installed\n` +
            `without access to a public npm registry. However, '${nativeMod}' is a native module. Its own npm install\n` +
            `script must download the IBM Db2 ODBC CLI driver and build the binding for your platform. npm does\n` +
            `not run the lifecycle scripts of a bundled dependency, so that install script did not run on this\n` +
            `system. The '--allow-scripts' option of 'plugins install' does not change that behavior, because\n` +
            `npm skips the scripts of bundled dependencies even when scripts are allowed.\n` +
            `\n` +
            `To finish the installation, run that install script yourself:\n` +
            `\n` +
            `    cd "${nativeModDir}"\n` +
            `    npm run install\n` +
            `\n` +
            `You must run the script from the directory shown above, because '${nativeMod}' installs the CLI driver\n` +
            `relative to the current directory. If npm is not available, run the same script directly:\n` +
            `\n` +
            `    cd "${nativeModDir}"\n` +
            `    node installer/driverInstall.js\n` +
            `\n` +
            `The script downloads the CLI driver from https://public.dhe.ibm.com, so the system needs network\n` +
            `access to that site. If this system already has a Db2 client, a Db2 server, or a copy of the CLI\n` +
            `driver, set the IBM_DB_HOME environment variable to that directory before you run the script to\n` +
            `skip the download.\n` +
            `\n` +
            `See ${path.join(nativeModDir, "README.md")} for more '${nativeMod}' installation options.\n` +
            `${Db2PluginLifeCycle.DIVIDER}\n`;
    }

    /**
     * Find the directory into which the native module was installed, so that
     * we can show the user exactly where to run its install script.
     *
     * @private
     * @static
     * @returns {string} The path to the directory of the native module.
     * @memberof Db2PluginLifeCycle
     */
    private static findNativeModuleDir(): string {
        const nativeMod = Db2PluginLifeCycle.NATIVE_MODULE_NM;
        try {
            /* The module cannot be loaded, but its package.json can still be
             * resolved, which reflects wherever npm placed the module.
             */
            return path.dirname(require.resolve(`${nativeMod}/package.json`));
        } catch (err) {
            // fall back to the location that a bundled dependency normally occupies
            return path.resolve(__dirname, "..", "node_modules", nativeMod);
        }
    }
}

export = Db2PluginLifeCycle;
