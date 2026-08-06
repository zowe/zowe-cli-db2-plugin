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

/**
 * Stub for @zowe/imperative's transitive "sanitize-html" dependency, which is only
 * used by its web-diff help feature (never exercised by this plugin's tests). The real
 * package's "htmlparser2" dependency ships ESM-only code that Jest cannot parse, so we
 * avoid loading it here rather than downgrading "sanitize-html".
 */
module.exports = (html) => html;
