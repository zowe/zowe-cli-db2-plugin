# JDBC Test Plan

Test coverage needed before the `jdbc-support` branch is merge-ready. Organised by layer — Java runner unit tests (JUnit or standalone), Node.js unit tests (Jest mocks), and live integration tests against the sandbox instance.

---

## 1. SQL Execution (`execute` action)

### Unit (Jest — mock `execFileSync`)

| Test | Input | Expected |
|---|---|---|
| Simple SELECT returns rows | `SELECT 1 FROM SYSIBM.SYSDUMMY1` | Result array with one row |
| Multi-result-set query | SQL with two SELECTs separated by `;` | Two result sets yielded in order |
| DML (INSERT/UPDATE/DELETE) | `INSERT INTO ...` | Empty result set, no error |
| Empty result set | SELECT with no matching rows | Empty array, no error |
| SQL syntax error | `SELEKT * FROM FOO` | `ImperativeError` with SQLCODE surfaced (H2) |
| `execFileSync` throws with JSON stderr | Mock stderr as `{"error":true,"sqlcode":-204,"sqlstate":"42704","message":"..."}` | `ImperativeError` msg includes SQLCODE=-204 |
| `execFileSync` throws with plain stderr | Mock stderr as raw Java stack | `ImperativeError` with stack stripped to first meaningful line |

### Live (sandbox)

| Test | Command | Expected |
|---|---|---|
| Row count | `SELECT COUNT(*) FROM SYSIBM.SYSTABLES` | Numeric result |
| Multi-column row | `SELECT * FROM SYSIBM.SYSDUMMY1` | Row with `IBMREQD` column |
| No-rows result | `SELECT * FROM SYSIBM.SYSTABLES WHERE NAME='ZZZNOMATCH'` | Empty result set, no error |

---

## 2. Stored Procedure — INPUT only (`call` action)

### Unit (Jest)

| Test | Input | Expected |
|---|---|---|
| No parameters | `CALL MYPROC()` | Calls `execFileSync` with `args=["MYPROC","[]"]` |
| Single INPUT string | `ParamType:"INPUT", Data:"A00"` | Param JSON includes `ParamType:"INPUT"` |
| Multiple INPUT params | Mixed string/integer DATA values | All params serialised in order |
| INPUT with `DataType` set | `DataType:12` (VARCHAR) | `DataType` included in serialised JSON |

### Live (sandbox)

| Test | Proc | Expected |
|---|---|---|
| INPUT-only, result set | `JFLICKE.LISTTABLES()` | Returns table rows |

---

## 3. Stored Procedure — OUTPUT parameters

### Unit (Jest)

| Test | Input | Expected |
|---|---|---|
| `ParamType:"OUTPUT"` resolves correctly | Mock returns `{success:true,results:["VAL"]}` | `resolveParamType("OUTPUT")` → 2, result unpacked |
| `ParamType:"INOUT"` resolves correctly | Mock returns `{success:true,results:["VAL"]}` | `resolveParamType("INOUT")` → 3, result unpacked |
| Integer `ParamType:2` still works | Legacy numeric form | Resolves to OUTPUT without error |
| `DataType` passthrough for DECIMAL | `ParamType:"OUTPUT", DataType:3` | `DataType:3` included in param JSON to runner |
| `DataType` passthrough for INTEGER | `ParamType:"OUTPUT", DataType:4` | `DataType:4` included in param JSON to runner |
| `DataType` defaults to VARCHAR when absent | `ParamType:"OUTPUT"` no DataType | Runner uses `Types.VARCHAR` (12) |
| INOUT sets input then registers out | `ParamType:"INOUT", Data:"X", DataType:12` | `setObject` called then `registerOutParameter` |
| `failureResponse` in runner response surfaced | Mock returns `{success:false,failureResponse:"SQLCODE=-440"}` | `ImperativeError` thrown with message |

### Java unit (`Db2JdbcRunner` — isolated)

| Test | Scenario | Expected |
|---|---|---|
| `resolveParamType("INPUT")` | String "INPUT" | Returns 1 |
| `resolveParamType("OUTPUT")` | String "OUTPUT" | Returns 2 |
| `resolveParamType("INOUT")` | String "INOUT" | Returns 3 |
| `resolveParamType("FILE")` | String "FILE" | Returns 1 (treated as INPUT) |
| `resolveParamType(1)` | Integer 1 | Returns 1 |
| `resolveParamType(2)` | Integer 2 | Returns 2 |
| `resolveParamType(3)` | Integer 3 | Returns 3 |
| `resolveParamType(null)` | null | Returns 1 (default) |

### Live (sandbox)

| Test | Proc / params | Expected |
|---|---|---|
| DECIMAL OUT | `JFLICKE.TOTALSALARY("A00", OUT DECIMAL, OUT INTEGER)` | Two numeric OUT values returned |
| VARCHAR OUT | Proc with VARCHAR OUT | String value returned |
| INOUT round-trip | Proc with INOUT param | Output value differs from input |

---

## 4. SQL Type Mapping (`java.sql.Types` codes)

Key codes a caller may need to pass as `DataType`:

| `DataType` value | `java.sql.Types` constant | Db2 type |
|---|---|---|
| 2 | `NUMERIC` | NUMERIC |
| 3 | `DECIMAL` | DECIMAL |
| 4 | `INTEGER` | INTEGER |
| 5 | `SMALLINT` | SMALLINT |
| 6 | `FLOAT` | FLOAT |
| 8 | `DOUBLE` | DOUBLE |
| 12 | `VARCHAR` | VARCHAR (default) |
| 1 | `CHAR` | CHAR |
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

### Live (sandbox)

| Test | Query | Expected |
|---|---|---|
| SYSIBM.SYSTABLES CHECKRID column | `SELECT CHECKRID FROM SYSIBM.SYSTABLES FETCH FIRST 1 ROW ONLY` | Hex string, not `[B@...` |

---

## 6. Error Handling (H2)

### Unit (Jest)

| Test | Scenario | Expected |
|---|---|---|
| `SQLException` with SQLCODE | Runner emits `{"error":true,"sqlcode":-204,"sqlstate":"42704","message":"..."}` on stderr | `ImperativeError` contains SQLCODE and SQLSTATE |
| Connection failure | Bad host | `ImperativeError` with clean message, no stack trace |
| Auth failure | Bad password | `ImperativeError` with `SQLCODE=-4214` |
| Compiler warning stripped | stderr contains `warning: [unchecked]` prefix | Warning lines not included in error message |

### Live (sandbox)

| Test | Scenario | Expected |
|---|---|---|
| Bad table name | `SELECT * FROM JFLICKE.NOTEXIST` | Error with SQLCODE=-204 surfaced cleanly |
| Bad SQL syntax | `SELEKT 1` | Error with SQLCODE=-104 surfaced cleanly |

---

## 7. Connection / Session

### Unit (Jest)

| Test | Scenario | Expected |
|---|---|---|
| JDBC URL built correctly | host/port/database set | `jdbc:db2://host:port/db` |
| SSL injected into URL | `sslFile` set to existing file | URL contains `sslConnection=true;sslTrustStoreLocation=...` |
| `jdbcJarPath` missing | `driverType=jdbc`, no jar | `SessionValidator` throws before JVM spawned |
| `jdbcJarPath` is directory | Path is a dir | `SessionValidator` throws with "must be a path to a .jar file" |
| Blocked `jdbcProperties` key | `user=hacker` in props | `ConnectionString.buildJdbcUrl` throws |

---

## 8. Export Table (JDBC path)

### Unit (Jest)

| Test | Scenario | Expected |
|---|---|---|
| `getTableRows` yields rows | Mock returns `[[{COL:"VAL1"},{COL:"VAL2"}]]` | Two rows yielded in order |
| `getTableColumns` returns metadata | Mock returns column array | Columns returned as `IDB2Column[]` |
| Empty table | Mock returns `[[]]` | Zero rows, no error |

### Live (sandbox)

| Test | Command | Expected |
|---|---|---|
| Export JFLICKE table | `zowe db2 export table JFLICKE.EMP` | CSV output with headers |
