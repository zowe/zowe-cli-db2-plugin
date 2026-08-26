# JDBC Support in the IBM Db2 Plug-in for Zowe CLI

Introduced in v6.1.17 as an opt-in alternative to the ODBC driver for environments where an ODBC license key is unavailable.

---

## Overview

The plug-in will continue to default to the ODBC driver (`ibm_db` native binding). Setting `driverType: "jdbc"` in a profile or passing `--driver-type jdbc` on the CLI activates the JDBC pathway. Both paths implement the same [`IDB2Driver`](../src/api/driver/IDB2Driver.ts) interface, so all commands (`execute sql`, `export table`, `call procedure`) work identically regardless of driver.

ODBC users with existing profiles are unaffected — `driverType` defaults to `"odbc"` when absent.

---

## How It Works

When `driverType=jdbc`, the plug-in:

1. Builds a JDBC connection URL from the session parameters — [`ConnectionString.buildJdbcUrl()`](../src/api/ConnectionString.ts)
2. Resolves a JVM classpath from `jdbcJarPath`, `jdbcLicensePath`, and the bundled Java runner — [`JdbcDriver.buildClasspath()`](../src/api/driver/JdbcDriver.ts)
3. Spawns a Java subprocess, passing credentials via **stdin** (never as process arguments, so they are not visible in `ps`/`/proc` listings) — [`JdbcDriver.runJavaCommand()`](../src/api/driver/JdbcDriver.ts)
4. The Java runner ([`Db2JdbcRunner.java`](../src/java/Db2JdbcRunner.java)) connects, executes the action, and writes JSON results to stdout
5. The Node.js side parses that JSON and returns it through `IDB2Driver`

Driver selection is centralised in [`DB2DriverFactory.getDriver()`](../src/api/driver/DB2DriverFactory.ts).

### Architecture

```
CLI handler
    │
    ▼
DB2Session.createSessCfgFromArgs()   ← maps --driver-type, --jdbc-jar, etc. → IDB2Session
    │
    ▼
SessionValidator.validate()          ← requires jdbcJarPath when driverType=jdbc
    │
    ▼
DB2DriverFactory.getDriver()
    ├── driverType=odbc  →  OdbcDriver   (ibm_db native binding)
    └── driverType=jdbc  →  JdbcDriver
                                │
                                ▼
                         ConnectionString.buildJdbcUrl()
                                │
                                ▼
                         child_process.execFileSync("java", [...])
                                │  stdin:  { user, password, args }
                                │  stdout: JSON result
                                ▼
                         Db2JdbcRunner.java
                           ├── execute    → SQL query / DML
                           ├── call       → stored procedure
                           └── getcolumns → DatabaseMetaData
```

---

## Session Parameters

| Parameter | CLI flag | Profile key | Required |
|---|---|---|---|
| `driverType` | `--driver-type jdbc` | `driverType` | Yes — must be `"jdbc"` |
| `jdbcJarPath` | `--jdbc-jar <path>` | `jdbcJarPath` | Yes — must be an explicit path to `db2jcc4.jar` |
| `jdbcLicensePath` | `--jdbc-license <path>` | `jdbcLicensePath` | Recommended — must be an explicit path to `db2jcc_license_cisuz.jar` |
| `javaPath` | `--java-path <path>` | `javaPath` | No — defaults to `java` on PATH |
| `jdbcProperties` | `--jdbc-props <key=val;...>` | `jdbcProperties` | No — additional JDBC URL properties |

Both `jdbcJarPath` and `jdbcLicensePath` must point to an existing `.jar` file. Directory paths are not accepted — specify the full path to the JAR explicitly.

Security-sensitive keys (`user`, `password`, `sslConnection`, `sslTrustStoreLocation`, `securityMechanism`) are blocked from `jdbcProperties` and always set directly by the plugin.

---

## SSL / TLS

Pass `--ssl-file <path>` (profile key `sslFile`) with an absolute path to a certificate file. The plugin validates the path exists and injects `sslConnection=true` and `sslTrustStoreLocation=<path>` into the JDBC URL automatically.

---

## Zowe Team Config (`zowe.config.json`)

The `zowe.config.schema.json` is generated at runtime by Zowe CLI from the Imperative profile definition in [`src/imperative.ts`](../src/imperative.ts) — it is not committed to the repository. All five JDBC properties are declared there and are included in the generated schema automatically when the plugin is installed.

### Example profile

```yaml
profiles:
  my-db2:
    type: db2
    properties:
      host: db2.example.com
      port: 50000
      database: MYDB
      driverType: jdbc
      jdbcJarPath: /opt/ibm/db2/jdbc/db2jcc4.jar
      jdbcLicensePath: /opt/ibm/db2/jdbc/db2jcc_license_cisuz.jar
    secure:
      - user
      - password
```

### Example CLI invocation

```bash
zowe db2 execute sql "SELECT * FROM SYSIBM.SYSDUMMY1" \
  --host db2.example.com --port 50000 \
  --user myuser --password mypassword \
  --database MYDB \
  --driver-type jdbc \
  --jdbc-jar /opt/ibm/db2/jdbc/db2jcc4.jar \
  --jdbc-license /opt/ibm/db2/jdbc/db2jcc_license_cisuz.jar
```

---

## Build

At `npm run build`, [`scripts/buildJava.js`](../scripts/buildJava.js) compiles `src/java/Db2JdbcRunner.java` to `lib/java/Db2JdbcRunner.class` using `javac`. If `javac` is not on the PATH, the source file is copied to `lib/java/` instead and executed at runtime via the Java 11+ single-file source launcher (`java Db2JdbcRunner.java`). The `.class` path is always preferred when present.

---

## Backwards Compatibility

- **ODBC users are unaffected.** `driverType` defaults to `"odbc"` in both `DB2Session.ts` and `createSessCfgFromArgs`. Existing profiles without `driverType` continue to use ODBC.
- **No new required fields** are added to the profile schema for ODBC users.
- **`IDB2Driver` interface** is the abstraction boundary — both drivers are interchangeable from the perspective of all API callers (`ExecuteSQL`, `CallSP`, `ExportTable`).
- **`ibm_db` dependency is unchanged** — ODBC remains the default and the native binding is still required for ODBC mode.
