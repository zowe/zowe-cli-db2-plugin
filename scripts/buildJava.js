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

const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const srcJavaDir = path.resolve(__dirname, "../src/java");
const libJavaDir = path.resolve(__dirname, "../lib/java");

if (!fs.existsSync(libJavaDir)) {
    fs.mkdirSync(libJavaDir, { recursive: true });
}

// Copy Java source file to lib/java/
const srcFile = path.join(srcJavaDir, "Db2JdbcRunner.java");
const destFile = path.join(libJavaDir, "Db2JdbcRunner.java");
if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
}

// Attempt to compile with javac if available
try {
    child_process.execSync(`javac -d "${libJavaDir}" "${destFile}"`, { stdio: "ignore" });
    console.log("Db2JdbcRunner compiled successfully to lib/java.");
} catch (err) {
    console.log("javac not found or compilation skipped; Db2JdbcRunner.java source file copied for runtime execution.");
}
