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

// __mocks__/ibm_db.js
"use strict";

const ibm_db = jest.genMockFromModule("ibm_db");

let mockResults = [];
let mockColumns = [];
let mockParameters = [];

class Database {
    constructor(options) {
        this.options = options;
    }

    closeSync() {
        return true;
    };

    columns(schema, database, table, column, cb) {
        cb(null, mockColumns);
    };

    prepareSync() {
        return new ODBCStatement();
    };

    queryResultSync(query, params) {
        return new ODBCResult();
    };
}

class ODBCResult {
    closeSync() {
        return true;
    };

    fetchAllSync() {
        const results = mockResults;
        mockResults = [];
        return results;
    };

    fetchSync() {
        return mockResults.shift();
    };

    moreResultsSync() {
        return mockResults.length > 0;
    };
}

class ODBCStatement {
    executeSync () {
        const result = new ODBCResult();
        const params = mockParameters.filter(function (param) {
            return (param.ParamType === "INOUT" || param.ParamType === "OUTPUT");
        });
        if (params.length === 0) {
            return result;
        }
        const values = params.map(function (param) {
            return param.Data;
        });
        return [result, values];
    };
}

function openSync(conn, options) {
    return new Database(options);
}

function __setMockResults(results) {
    mockResults = results.slice();
}

function __setMockColumns(columns) {
    mockColumns = columns.slice();
}

function __setMockParams(params) {
    mockParameters = params.slice();
}

// Mock custom implementations
ibm_db.__setMockResults = __setMockResults;
ibm_db.__setMockColumns = __setMockColumns;
ibm_db.__setMockParams = __setMockParams;
ibm_db.openSync = openSync;
ibm_db.Database = Database;
ibm_db.ODBCResult = ODBCResult;
ibm_db.ODBCStatement = ODBCStatement;

module.exports = ibm_db;
