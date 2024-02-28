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

import { IImperativeConfig } from "@zowe/imperative";
import { Constants } from "./Constants";

const config: IImperativeConfig = {
    name: Constants.PROD_NAME,
    commandModuleGlobs: ["**/cli/*/*.definition!(.d).*s"],
    rootCommandDescription: Constants.DESCRIPTION,
    productDisplayName: Constants.DISPLAY_NAME,
    profiles: [
        {
            type: "db2",
            schema: {
                type: "object",
                title: "Db2 Profile",
                description: "A profile for interaction with Db2 for the z/OS region",
                properties: {
                    host: {
                        type: "string",
                        optionDefinition: {
                            name: "host",
                            aliases: ["H"],
                            description: "The Db2 server host name",
                            type: "string",
                        },
                    },
                    port: {
                        type: "number",
                        optionDefinition: {
                            name: "port",
                            aliases: ["P"],
                            description: "The Db2 server port number",
                            type: "number"
                        },
                        includeInTemplate: true
                    },
                    user: {
                        type: "string",
                        secure: true,
                        optionDefinition: {
                            name: "user",
                            aliases: ["u"],
                            description: "The Db2 user ID (may be the same as the TSO login)",
                            type: "string",
                        },
                    },
                    password: {
                        type: "string",
                        secure: true,
                        optionDefinition: {
                            name: "password",
                            aliases: ["pass", "pw"],
                            description: "The Db2 password (may be the same as the TSO password)",
                            type: "string",
                        },
                    },
                    database: {
                        type: "string",
                        optionDefinition: {
                            name: "database",
                            aliases: ["d"],
                            description: "The name of the database",
                            type: "string",
                        },
                    },
                    sslFile: {
                        type: "string",
                        optionDefinition: {
                            name: "ssl-file",
                            aliases: ["s"],
                            description: "Path to the root CA Certificate file",
                            type: "string",
                        },
                    },
                },
            },
        }
    ],
};

export = config;
