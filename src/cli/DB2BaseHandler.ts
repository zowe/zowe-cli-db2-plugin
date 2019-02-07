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

import {
    AbstractSession,
    ICommandHandler,
    IHandlerParameters,
    IProfile,
    IHandlerResponseConsoleApi,
    ImperativeError,
    IImperativeError,
    IHandlerFormatOutputApi,
    IHandlerResponseDataApi,
} from "@brightside/imperative";
import { DB2Session } from "./DB2Sessions";
import { IDB2Session } from "../index";

/**
 * This class is used by the various DB2 handlers as the base class for their implementation.
 * All handlers should extend this class whenever possible
 */
export abstract class DB2BaseHandler implements ICommandHandler {

    /**
     * Full set of command handler parameters from imperative
     */
    protected mHandlerParams: IHandlerParameters;

    /**
     * This will grab the DB2 profile and create a session before calling the subclass
     * {@link DB2BaseHandler#processWithSession} method.
     *
     * @param {IHandlerParameters} commandParameters Command parameters sent by imperative.
     *
     * @returns {Promise<void>}
     */
    public async process(commandParameters: IHandlerParameters) {
        this.mHandlerParams = commandParameters;
        const profile = commandParameters.profiles.get("db2", false) as IDB2Session;
        const session = DB2Session.createDB2Session(commandParameters.arguments, profile);
        await this.processWithDB2Session(commandParameters, session);
    }

    /**
     * Fail the command with an imperative error
     * @param {IImperativeError} err - the imperative error parameters
     */
    public fail(err: IImperativeError) {
        throw new ImperativeError(err);
    }

    /**
     * Returns the console interface for the command handler
     * @returns {IHandlerResponseConsoleApi}
     */
    public get console(): IHandlerResponseConsoleApi {
        return this.mHandlerParams.response.console;
    }

    /**
     * Returns the format interface for the command handler
     * @returns {IHandlerFormatOutputApi}
     */
    public get format(): IHandlerFormatOutputApi {
        return this.mHandlerParams.response.format;
    }

    /**
     * Returns the format interface for the command handler
     * @returns {IHandlerResponseDataApi}
     */
    public get data(): IHandlerResponseDataApi {
        return this.mHandlerParams.response.data;
    }

    /**
     * This is called by the {@link DB2BaseHandler#process} after it creates a session. Should
     * be used so that every class does not have to instantiate the session object.
     *
     * @param {IHandlerParameters} commandParameters Command parameters sent to the handler.
     * @param {AbstractSession} session The session object generated from the Command Line.
     * @param {IProfile} DB2Profile The DB2 profile that was loaded from the DB2 Profile.
     *
     * @returns {Promise<void>} The response from the underlying DB2 api call.
     */
    public abstract async processWithDB2Session(
        commandParameters: IHandlerParameters,
        session: AbstractSession
    ): Promise<void>;


}
