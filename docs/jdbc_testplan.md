# JDBC Test Plan

Test coverage needed before the `jdbc-support` branch is merge-ready.

---

## Test layers

| Layer | Location | Trigger |
|---|---|---|
| Unit (Jest, mocked) | `__tests__/api/`, `__tests__/cli/` | `npm run test:unit` — always runs, no live connection needed |
| Integration (live Db2) | `__tests__/__integration__/` | `npm run test:integration` — opt-in; skipped automatically if `custom_properties.yaml` absent |
| Formal system tests | `__tests__/__system__/` | `npm run test:system` — requires `custom_properties.yaml` and managed Zowe home |

**Unit test rule:** new JDBC-specific params (`jdbcJarPath`, `jdbcLicensePath`, `javaPath`, `jdbcProperties`, `driverType`) should extend **existing** test files rather than create new ones.

---

## Integration Test Infrastructure

### How live tests run

- Tests live under `__tests__/__integration__/` — separate from `__tests__/__system__/`
- Shell scripts issue `zowe db2 ...` commands via `TestEnvironment.setUp` (same pattern as system tests), which reads `custom_properties.yaml`, creates a temp `db2` profile, and sets the working directory
- `custom_properties.yaml` is gitignored; the full suite skips automatically if the file is absent
- Requires the plugin to be built and installed first: `npm run build && zowe plugins install .`
- **ODBC path** cannot be live-tested without the IBM Data Server Driver license — ODBC remains unit-test-only (mocked). All integration tests use JDBC via `driverType: jdbc` in the profile

### Type-mapping stored procedure (`TYPESMAP`)

The call integration tests depend on a stored procedure that echo-maps every supported Db2 type through IN→OUT parameters. It is created under the **current user's schema** in `beforeAll` and dropped in `afterAll`.

> ⚠️ `CREATE PROCEDURE` with `LANGUAGE SQL` requires a WLM environment on z/OS subsystems. On the sandbox (`DB2D`), this fails with `SQLCODE=-20071`. The `TYPESMAP` tests are written but blocked pending either DBA pre-creation of the proc or access to a subsystem where the user has `CREATE PROCEDURE` permission.

> `TIMESTAMP WITH TIMEZONE` is excluded — z/OS-specific handling in the Java runner needs separate investigation.

---

## 1. SQL Execution (`execute` action)

### Unit — `__tests__/api/DriverFactory.test.ts`

Already implemented:
- `OdbcDriver` instantiated when `driverType` is `"odbc"` or absent
- `JdbcDriver` instantiated when `driverType` is `"jdbc"`
- `JdbcDriver.execute` calls `execFileSync` and returns parsed results
- `JdbcDriver.callSP` calls `execFileSync` and returns response object
- `JdbcDriver.getTableColumns` calls `execFileSync` and returns column metadata
- `JdbcDriver.buildClasspath` includes jar paths

Still needed:
| Test | Input | Expected |
|---|---|---|
| Multi-result-set query | SQL with two SELECTs | Two result sets yielded in order |
| DML with no result set | `INSERT INTO ...` | Empty array, no error |
| Empty result set | SELECT with no matching rows | Empty array, no error |
| `execFileSync` throws with JSON stderr | `{"error":true,"sqlcode":-204,...}` | `ImperativeError` with SQLCODE surfaced |
| `execFileSync` throws with plain stderr | Raw Java stack | `ImperativeError` thrown |

### Integration — `__tests__/__integration__/db2.execute.integration.test.ts`

| Test | Status | Notes |
|---|---|---|
| Smoke test: `SELECT 1 FROM SYSIBM.SYSDUMMY1` | ✅ passing | |
| Row count: `SELECT COUNT(*) FROM SYSIBM.SYSTABLES` | ✅ passing | |
| No-rows result | ✅ passing | |
| String types: CHAR, VARCHAR | ✅ passing | |
| Numeric types: SMALLINT, INTEGER, BIGINT, DECIMAL, REAL, DOUBLE | ✅ passing | |
| Date/time types: DATE, TIME, TIMESTAMP | ✅ passing | |
| Bad SQL returns non-zero exit | ✅ passing | |

---

## 2. Stored Procedure — INPUT only (`call` action)

### Unit — `__tests__/api/DriverFactory.test.ts`

Already implemented:
- `JdbcDriver.callSP` calls `execFileSync` and returns response object

Still needed:
| Test | Input | Expected |
|---|---|---|
| No parameters | `CALL MYPROC()` | `execFileSync` called with empty params array |
| Single INPUT string | `ParamType:"INPUT", Data:"A00"` | Param JSON includes `ParamType:"INPUT"` |
| Multiple INPUT params | Mixed string/integer values | All params serialised in order |
| INPUT with `DataType` set | `DataType:12` (VARCHAR) | `DataType` included in serialised JSON |

### Integration — `__tests__/__integration__/db2.call.integration.test.ts`

| Test | Status | Notes |
|---|---|---|
| String OUT params round-trip (CHAR, VARCHAR) | ❌ blocked | `CREATE PROCEDURE` fails `SQLCODE=-20071` on sandbox |
| Numeric OUT params round-trip | ❌ blocked | Same |
| Date/time OUT params round-trip | ❌ blocked | Same |

---

## 3. Stored Procedure — OUTPUT parameters

### Unit — `__tests__/api/DriverFactory.test.ts`

Still needed:
| Test | Input | Expected |
|---|---|---|
| `ParamType:"OUTPUT"` passes through to runner | Mock `{success:true,results:["VAL"]}` | `ParamType:"OUTPUT"` in stdin JSON |
| `ParamType:"INOUT"` passes through to runner | Mock `{success:true,results:["VAL"]}` | `ParamType:"INOUT"` in stdin JSON |
| Legacy numeric `ParamType:2` passes through | Integer form | Unchanged in serialised JSON |
| `DataType` for DECIMAL (3) passes through | `ParamType:"OUTPUT", DataType:3` | `DataType:3` in param JSON |
| `failureResponse` surfaced as `ImperativeError` | `{success:false,failureResponse:"SQLCODE=-440"}` | `ImperativeError` thrown |

### Java unit (`Db2JdbcRunner` — isolated)

| Test | Scenario | Expected |
|---|---|---|
| `resolveParamType("INPUT")` | String "INPUT" | Returns 1 |
| `resolveParamType("OUTPUT")` | String "OUTPUT" | Returns 2 |
| `resolveParamType("INOUT")` | String "INOUT" | Returns 3 |
| `resolveParamType("FILE")` | String "FILE" | Returns 1 (treated as INPUT) |
| `resolveParamType(1/2/3)` | Integer form | Returns correct int |
| `resolveParamType(null)` | null | Returns 1 (default) |

---

## 4. SQL Type Mapping (`java.sql.Types` codes)

Key codes a caller may need to pass as `DataType`:

| `DataType` value | `java.sql.Types` constant | Db2 type |
|---|---|---|
| 1 | `CHAR` | CHAR |
| 2 | `NUMERIC` | NUMERIC |
| 3 | `DECIMAL` | DECIMAL |
| 4 | `INTEGER` | INTEGER |
| 5 | `SMALLINT` | SMALLINT |
| 6 | `FLOAT` | FLOAT |
| 8 | `DOUBLE` | DOUBLE |
| 12 | `VARCHAR` | VARCHAR (default) |
| -5 | `BIGINT` | BIGINT |
| 91 | `DATE` | DATE |
| 92 | `TIME` | TIME |
| 93 | `TIMESTAMP` | TIMESTAMP |
| -2 | `BINARY` | CHAR FOR BIT DATA |
| -3 | `VARBINARY` | VARCHAR FOR BIT DATA |

These should be documented in `IDB2Parameter.DataType` JSDoc so users know what to pass.

---

## 5. Binary / ROWID Column Rendering (H11)

### Unit (Jest)

| Test | Mock output | Expected |
|---|---|---|
| `byte[]` column renders as hex | Runner returns `[B@abc123` style | After fix: hex string like `"0xDEADBEEF"` |

### Java unit

| Test | Scenario | Expected |
|---|---|---|
| `byte[]` value in result set | Column of type ROWID | Emitted as hex string in JSON, not `[B@...` |

### Integration

| Test | Query | Expected |
|---|---|---|
| SYSIBM.SYSTABLES CHECKRID column | `SELECT CHECKRID FROM SYSIBM.SYSTABLES FETCH FIRST 1 ROW ONLY` | Hex string, not `[B@...` |

---

## 6. Error Handling (H2)

### Unit (Jest) — `__tests__/api/DriverFactory.test.ts`

Still needed:
| Test | Scenario | Expected |
|---|---|---|
| `SQLException` with SQLCODE | Runner emits `{"error":true,"sqlcode":-204,...}` on stderr | `ImperativeError` contains SQLCODE and SQLSTATE |
| `execFileSync` throws with plain stderr | Raw Java stack | `ImperativeError` thrown with cleaned message |

### Integration

| Test | Status | Notes |
|---|---|---|
| Bad SQL syntax returns non-zero exit | ✅ passing | Covered in execute suite |

---

## 7. Connection / Session

### Unit — `__tests__/api/ConnectionString.test.ts` and `__tests__/api/SessionValidator.test.ts`

Already implemented:
- JDBC URL built correctly from session (`buildJdbcUrlFromSession`)
- SSL injected into URL when `sslFile` set to existing file
- `sslFile` does not exist → throws
- Blocked `jdbcProperties` key (`user=hacker`) → throws
- `driverType: "jdbc"` with missing `jdbcJarPath` → throws
- `jdbcJarPath` does not exist → throws
- `jdbcJarPath` is a directory → throws
- `jdbcLicensePath` is a directory → throws
- Invalid `driverType` → throws

No additional unit tests needed for this section.

---

## 8. Export Table (JDBC path)

### Unit — `__tests__/api/DriverFactory.test.ts`

Already implemented:
- `getTableColumns` calls `execFileSync` and returns column metadata

Still needed:
| Test | Scenario | Expected |
|---|---|---|
| `getTableRows` yields rows | Mock returns `[[{COL:"VAL1"},{COL:"VAL2"}]]` | Two rows yielded in order |
| Empty table export | Mock returns `[[]]` | Zero rows, no error |

### Integration

Skipped automatically if `custom_properties.yaml` is absent.

| Test | Command | Expected |
|---|---|---|
| Export SYSIBM table | `zowe db2 export table SYSIBM.SYSDUMMY1` | CSV output with headers, at least one row |
