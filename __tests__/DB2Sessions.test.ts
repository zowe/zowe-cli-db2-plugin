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

import { ICommandArguments, IProfile } from "@brightside/imperative";
import { DB2Session } from "../src/cli/DB2Session";
import { SESSION } from "./__src__/Db2TestConstants";
import { IDB2Session } from "../src/rest/session/doc/IDB2Session";
const port = 1111111;
describe("createDB2Session()", () => {
    let args: ICommandArguments = {$0: "", _: [], ...SESSION};
    let profile: IProfile = { ...SESSION };
    it("should create a session from cmd arguments if profile is undefined", () => {
        let session = DB2Session.createDB2Session(args, profile);
        session = session.ISession as IDB2Session;

        expect(session.hostname).toEqual(SESSION.hostname);
        expect(session.port).toEqual(SESSION.port);
        expect(session.username).toEqual(SESSION.username);
        expect(session.database).toEqual(SESSION.database);
    });

    it("should create a session from profile if cmd arguments are undefined", () => {
        args = {$0: "", _: []};
        let session = DB2Session.createDB2Session(args, profile);
        session = session.ISession as IDB2Session;

        expect(session.hostname).toEqual(SESSION.hostname);
        expect(session.port).toEqual(SESSION.port);
        expect(session.username).toEqual(SESSION.username);
        expect(session.database).toEqual(SESSION.database);
    });
    it("should create a session and override profile with cmd arguments", () => {
        args = {$0: "", _: [], ...SESSION};
        profile = {...profile, hostname: "some-test-host", port: 1111111};
        let session = DB2Session.createDB2Session(args, profile);
        session = session.ISession as IDB2Session;

        expect(session.hostname).not.toEqual("some-test-host");
        expect(session.port).not.toEqual(port);
        expect(session.hostname).toEqual(SESSION.hostname);
        expect(session.port).toEqual(SESSION.port);
        expect(session.username).toEqual(SESSION.username);
        expect(session.database).toEqual(SESSION.database);
    });
});
