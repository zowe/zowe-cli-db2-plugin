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

import { ICommandHandler, IHandlerParameters, TextUtils, AbstractSession, IProfile, IHandlerResponseConsoleApi } from "@brightside/imperative";
import { CallSP, IDB2Session, IDB2Response, IDB2Parameter, DB2_PARM_OUTPUT } from "../../../";
import { isNullOrUndefined } from "util";
import { DB2BaseHandler } from "../../DB2BaseHandler";

/**
 * Command handler for calling a DB2 stored procedure
 * @export
 * @class ProcedureHandler
 * @implements {ICommandHandler}
 */
export default class ProcedureHandler extends DB2BaseHandler {

    /**
     * Parse the passed values and create an array of OUTPUT parameters
     * @param {any[]} parameters Values of parameters
     * @returns {IDB2Parameter[]}
     */
    public static parseParameters(parameters: any[]): IDB2Parameter[] {
        if (isNullOrUndefined(parameters)) {
            return [];
        }
        else {
            const parsed: IDB2Parameter[] = parameters.map((value) => {
                const param: IDB2Parameter = {
                    ParamType: DB2_PARM_OUTPUT,
                    Data: value,
                };
                return param;
            });
            return parsed;
        }
    }

    public async processWithDB2Session(params: IHandlerParameters, session: AbstractSession, profile?: IProfile): Promise<void> {
        let DB2session: IDB2Session;
        if (profile) {
            DB2session = {
                hostname: session.ISession.hostname || profile.hostname,
                port: session.ISession.port || profile.port,
                username: session.ISession.user || profile.user,
                password: session.ISession.password || profile.password,
                database: session.ISession.tokenType || profile.tokenType,
                sslFile: session.ISession.tokenValue || profile.tokenValue,
            };
        } else {
            DB2session = {
                hostname: session.ISession.hostname,
                port: session.ISession.port,
                username: session.ISession.user,
                password: session.ISession.password,
                database: session.ISession.tokenType,
                sslFile: session.ISession.tokenValue,
            };
        }
        const routine: string = params.arguments.routine;
        const parameters: IDB2Parameter[] = ProcedureHandler.parseParameters(params.arguments.parameters);

        const response: IDB2Response = CallSP.callCommon(DB2session, routine, parameters);

        // Print out the response
        params.response.console.log(TextUtils.prettyJson(response.results));

        // Return as an object when using --response-format-json
        params.response.data.setObj(response);

    }
}
