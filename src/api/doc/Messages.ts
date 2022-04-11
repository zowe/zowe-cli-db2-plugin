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

import { IMessageDefinition, apiErrorHeader } from "@zowe/imperative";

export const noDB2Input: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 parameters were supplied.",
};

export const noHostName: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 server hostname was supplied.",
};

export const noPortNumber: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 server port number was supplied.",
};

export const noUserName: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 User ID was supplied.",
};

export const noPassword: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 user password was supplied.",
};

export const noDatabaseName: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 database name was supplied.",
};

export const noTableName: IMessageDefinition = {
    message: apiErrorHeader.message + " - No DB2 table name was supplied.",
};
