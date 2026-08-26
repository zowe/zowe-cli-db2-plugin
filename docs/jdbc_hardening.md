# JDBC Hardening Checklist — Pre-Release

> **Ephemeral document.** Delete this file before merging the PR. Items should be tracked as issues or inline TODOs once resolved.

Branch: `jdbc-support`  
Target: merge to `master` as v6.1.17

---

## Must-Fix (blockers)

### H1 — OUT parameter SQL type is hardcoded to `VARCHAR`

**File:** [`src/java/Db2JdbcRunner.java:184`](../src/java/Db2JdbcRunner.java)

`registerOutParameter` always registers `Types.VARCHAR`. Numeric, date, timestamp, and BLOB output parameters will be silently miscast or fail at runtime.

**Fix:** Add a `sqlType` field to the parameter JSON object (e.g. `{ "ParamType": 2, "Data": null, "SqlType": 4 }`). Extend `IDB2Parameter`, update `JdbcDriver.callSP()` serialisation, and use the passed-in type code in `registerOutParameter`.

- [ ] `IDB2Parameter` — add optional `SqlType?: number`
- [ ] `JdbcDriver.callSP()` — include `SqlType` in JSON when set
- [ ] `Db2JdbcRunner.java` — use `sqlType` in `registerOutParameter`, default to `Types.VARCHAR` only when absent
- [ ] Unit test covering OUT with a non-VARCHAR type

---

### H2 — No SQLCODE/SQLSTATE surfaced from JDBC `SQLException`

**File:** [`src/api/DB2Error.ts`](../src/api/DB2Error.ts), [`src/java/Db2JdbcRunner.java`](../src/java/Db2JdbcRunner.java)

JDBC failures arrive as plain `Error` objects thrown from `runJavaCommand()`. `DB2Error.process()` cannot extract SQLCODE or SQLSTATE, so the user sees a raw Java stack trace instead of a structured error message.

**Fix:** Have `Db2JdbcRunner` write a structured JSON error to stderr on failure (e.g. `{"error":true,"sqlcode":-204,"sqlstate":"42704","message":"..."}`) and have `runJavaCommand()` parse and rethrow it as a typed object that `DB2Error.process()` can handle.

- [ ] `Db2JdbcRunner.java` — catch `SQLException`, emit JSON to stderr
- [ ] `JdbcDriver.runJavaCommand()` — parse stderr JSON and rethrow as structured object
- [ ] `DB2Error.process()` — handle JDBC error shape (extract `sqlcode`, `sqlstate`)
- [ ] Unit test: mock `execFileSync` to throw with JSON stderr, assert `ImperativeError` contains SQLCODE

---

## Should-Fix (high confidence regressions or test coverage gaps)

### H3 — `getTableRows` has no unit test

**File:** [`src/api/driver/JdbcDriver.ts:176`](../src/api/driver/JdbcDriver.ts), [`__tests__/api/DriverFactory.test.ts`](../__tests__/api/DriverFactory.test.ts)

`JdbcDriver.getTableRows()` is the method called by `ExportTable` — one of the three primary commands. It is implemented but completely untested.

**Fix:** Mock `execFileSync` returning `[[{"COL":"VAL1"},{"COL":"VAL2"}]]` and assert rows are yielded in order.

- [ ] Add `getTableRows` test in `DriverFactory.test.ts`

---

### H4 — `callSP` OUT/INOUT parameter paths are untested

**File:** [`__tests__/api/DriverFactory.test.ts:81`](../__tests__/api/DriverFactory.test.ts)

The existing `callSP` test passes an empty parameter array. The OUT and INOUT serialisation paths in both `JdbcDriver.callSP()` and `Db2JdbcRunner.callProcedure()` are never exercised by unit tests.

**Fix:** Add tests passing `IDB2Parameter` objects with `ParamType` 2 (OUTPUT) and 3 (INOUT), asserting the correct JSON shape is written to stdin and the response is unpacked.

- [ ] Add `callSP` with OUTPUT param test
- [ ] Add `callSP` with INOUT param test

---

### H5 — `driverType` backwards compat: `imperative.ts` profile schema has no `defaultValue` or `allowableValues`

**File:** [`src/imperative.ts:86`](../src/imperative.ts), [`src/cli/DB2Session.ts:93`](../src/cli/DB2Session.ts)

`DB2Session.ts` correctly declares `defaultValue: "odbc"` and `allowableValues: ["odbc","jdbc"]` on `DB2_OPTION_DRIVER_TYPE`. The corresponding `optionDefinition` in `imperative.ts` (used for v1 profile management) omits both, so a user running `zowe profiles create db2` would not see the valid values or get the default.

**Fix:** Add `defaultValue: "odbc"` and `allowableValues` to the `driverType` `optionDefinition` in `imperative.ts`.

- [ ] `imperative.ts` — add `defaultValue: "odbc"` and `allowableValues: { values: ["odbc","jdbc"], caseSensitive: false }` to `driverType.optionDefinition`

---

## Discovered During Testing

### H11 — Binary columns render as Java object references (`[B@...`)

**File:** [`src/java/Db2JdbcRunner.java`](../src/java/Db2JdbcRunner.java)

`resultSetToListOfMaps` calls `rs.getObject(i)` for all column types. For binary/ROWID columns (`ROWID`, `CHAR FOR BIT DATA`, `VARCHAR FOR BIT DATA`) this returns a `byte[]`, and the JSON serialiser calls `.toString()` on it, producing garbage like `[B@a767d18` instead of a hex or base64 string.

**Fix:** In `resultSetToListOfMaps`, detect `byte[]` values and encode them as hex strings.

- [ ] `Db2JdbcRunner.java` — check `val instanceof byte[]` and emit hex string

---

### H12 — Compiler warning on stderr corrupts error messages (fixed)

**File:** [`src/api/driver/JdbcDriver.ts`](../src/api/driver/JdbcDriver.ts), [`src/java/Db2JdbcRunner.java`](../src/java/Db2JdbcRunner.java)

The Java single-file source launcher emitted an unchecked cast warning to stderr on every invocation. On success this was interleaved with output; on failure it prepended the warning to the actual error message, making it unreadable.

**Fixed:** Added `@SuppressWarnings("unchecked")` to `parseJsonArray` in the Java source, and added `-Xlint:none` to the source launcher args. Also hardened the error path in `runJavaCommand` to strip compiler warning lines from stderr before surfacing the error.

---

## Nice-to-Have (can follow in a subsequent PR)

### H6 — No system tests for JDBC pathway

All system tests in [`__tests__/__system__`](../__tests__/__system__) are ODBC-only. End-to-end correctness of `execute sql`, `export table`, and `call procedure` via JDBC against a real Db2 instance has not been formally verified by CI.

**Proposal:** Add `DRIVER_TYPE=jdbc` variants for `execute sql` and `call` in the system test suite, gated by a `JDBC_JAR_PATH` env var so they are skipped when no JAR is present.

---

### H7 — `jdbcProperties` semicolons in values are not handled

**File:** [`src/api/ConnectionString.ts:144`](../src/api/ConnectionString.ts)

The string form of `jdbcProperties` is split on `;`. A value containing a literal semicolon will be incorrectly tokenised. Scope: document the restriction clearly in the option description rather than implement a full parser.

- [ ] Update `DB2_OPTION_JDBC_PROPERTIES` description in `DB2Session.ts` to note "property values must not contain semicolons"

---

### H9 — No query timeout on `execFileSync`

**File:** [`src/api/driver/JdbcDriver.ts:125`](../src/api/driver/JdbcDriver.ts)

`execFileSync` has no `timeout` set, so a hung Db2 query blocks the CLI process indefinitely. Consider exposing `jdbcQueryTimeout` (milliseconds) as an optional session parameter.

---

### H10 — CI never exercises the compiled `.class` path

**File:** [`scripts/buildJava.js`](../scripts/buildJava.js)

If `javac` is absent from the CI image, `buildJava.js` silently skips compilation and the `.class` file is never produced. The runtime single-file launcher path is exercised, but the compiled path is not. Decide: install a JDK in CI (e.g. `actions/setup-java`) or document that compiled mode is validated only locally.

---

## Pre-Merge Gate

Before squashing and opening the PR against `master`:

- [ ] All items in **Must-Fix** are resolved
- [ ] All items in **Should-Fix** are resolved or deferred with a filed issue
- [ ] `npm run build` passes (TypeScript + `javac` or graceful fallback)
- [ ] `npm run test:unit` passes with no new failures
- [ ] `npm run lint` clean
- [ ] This file is **deleted** from the branch
