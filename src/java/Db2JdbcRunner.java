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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Command-line Java runner for executing Db2 JDBC queries, stored procedures, and metadata queries.
 *
 * Protocol: accepts two CLI args (action, url) and reads a single JSON line from stdin containing
 * { "user": "...", "password": "...", "args": [...] }. Credentials are never passed as process
 * arguments so they are not visible in ps/proc listings. Outputs JSON results to stdout.
 *
 * The "args" array contains action-specific string arguments:
 *   execute  : args[0] = SQL, args[1] (optional) = JSON array of parameters
 *   call     : args[0] = routineName, args[1] (optional) = JSON array of parameters
 *   getcolumns: args[0] = schema, args[1] = table
 */
public class Db2JdbcRunner {

    public static void main(String[] args) {
        if (args.length < 2) {
            System.err.println("Usage: java Db2JdbcRunner <action> <url>");
            System.err.println("Credentials and action args are read as JSON from stdin.");
            System.exit(1);
        }

        String action = args[0];
        String url    = args[1];

        // Read the single JSON credential+args line from stdin
        String stdinLine;
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in, "UTF-8"));
            stdinLine = reader.readLine();
        } catch (Exception e) {
            System.err.println("JDBC Error: failed to read stdin: " + e.getMessage());
            System.exit(1);
            return;
        }

        if (stdinLine == null || stdinLine.trim().isEmpty()) {
            System.err.println("JDBC Error: no credential JSON received on stdin");
            System.exit(1);
            return;
        }

        // Parse the credential envelope: {"user":"...","password":"...","args":[...]}
        String user, password;
        List<String> actionArgs;
        try {
            Map<String, Object> envelope = parseJsonObject(stdinLine.trim());
            user     = (String) envelope.getOrDefault("user", "");
            password = (String) envelope.getOrDefault("password", "");
            Object rawArgs = envelope.get("args");
            actionArgs = new ArrayList<>();
            if (rawArgs instanceof List) {
                for (Object a : (List<?>) rawArgs) {
                    actionArgs.add(a == null ? "" : a.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("JDBC Error: failed to parse stdin JSON: " + e.getMessage());
            System.exit(1);
            return;
        }

        try {
            try {
                Class.forName("com.ibm.db2.jcc.DB2Driver");
            } catch (ClassNotFoundException e) {
                System.err.println("JDBC Error: IBM Db2 JDBC Driver class 'com.ibm.db2.jcc.DB2Driver' not found in classpath.");
                System.err.println("Please check that jdbcJarPath contains db2jcc4.jar or db2jcc.jar.");
                System.exit(2);
            }

            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                switch (action.toLowerCase()) {
                    case "execute":
                        if (actionArgs.isEmpty()) {
                            throw new IllegalArgumentException("SQL query required for execute action");
                        }
                        executeSql(conn, actionArgs.get(0));
                        break;

                    case "call":
                        if (actionArgs.isEmpty()) {
                            throw new IllegalArgumentException("Routine name required for call action");
                        }
                        String routineName = actionArgs.get(0);
                        String paramsJson  = actionArgs.size() > 1 ? actionArgs.get(1) : "[]";
                        callProcedure(conn, routineName, paramsJson);
                        break;

                    case "getcolumns":
                        if (actionArgs.size() < 2) {
                            throw new IllegalArgumentException("Schema and Table required for getColumns action");
                        }
                        getColumns(conn, actionArgs.get(0), actionArgs.get(1));
                        break;

                    default:
                        throw new IllegalArgumentException("Unknown action: " + action);
                }
            }
        } catch (Exception e) {
            System.err.println("JDBC Error: " + e.getMessage());
            e.printStackTrace(System.err);
            System.exit(2);
        }
    }

    // ─── SQL execution ───────────────────────────────────────────────────────────

    private static void executeSql(Connection conn, String sql) throws Exception {
        List<List<Map<String, Object>>> allResults = new ArrayList<>();
        try (Statement stmt = conn.createStatement()) {
            boolean isResultSet = stmt.execute(sql);
            while (true) {
                if (isResultSet) {
                    try (ResultSet rs = stmt.getResultSet()) {
                        allResults.add(resultSetToListOfMaps(rs));
                    }
                }
                isResultSet = stmt.getMoreResults();
                if (!isResultSet && stmt.getUpdateCount() == -1) {
                    break;
                }
            }
        }
        System.out.println(toJson(allResults));
    }

    private static void callProcedure(Connection conn, String routineName, String paramsJson) throws Exception {
        List<Object> paramList = parseJsonArray(paramsJson);
        StringBuilder callSql = new StringBuilder("CALL ").append(routineName);
        if (!paramList.isEmpty()) {
            callSql.append("(");
            for (int i = 0; i < paramList.size(); i++) {
                callSql.append(i > 0 ? ", ?" : "?");
            }
            callSql.append(")");
        }

        Map<String, Object> response = new HashMap<>();
        List<Object> results = new ArrayList<>();

        try (CallableStatement cstmt = conn.prepareCall(callSql.toString())) {
            for (int i = 0; i < paramList.size(); i++) {
                Object p = paramList.get(i);
                int paramType = 1; // Default INPUT
                Object data = p;
                if (p instanceof Map) {
                    Map<?, ?> pMap = (Map<?, ?>) p;
                    if (pMap.containsKey("ParamType")) {
                        paramType = ((Number) pMap.get("ParamType")).intValue();
                    }
                    data = pMap.get("Data");
                }
                int paramIndex = i + 1;
                if (paramType == 1) {         // INPUT
                    cstmt.setObject(paramIndex, data);
                } else if (paramType == 2) {  // OUTPUT
                    cstmt.registerOutParameter(paramIndex, Types.VARCHAR);
                } else if (paramType == 3) {  // INOUT
                    cstmt.setObject(paramIndex, data);
                    cstmt.registerOutParameter(paramIndex, Types.VARCHAR);
                }
            }

            boolean isResultSet = cstmt.execute();

            // Collect OUT/INOUT parameters
            for (int i = 0; i < paramList.size(); i++) {
                Object p = paramList.get(i);
                int paramType = 1;
                if (p instanceof Map) {
                    Map<?, ?> pMap = (Map<?, ?>) p;
                    if (pMap.containsKey("ParamType")) {
                        paramType = ((Number) pMap.get("ParamType")).intValue();
                    }
                }
                if (paramType == 2 || paramType == 3) {
                    results.add(cstmt.getObject(i + 1));
                }
            }

            // Collect ResultSets
            while (true) {
                if (isResultSet) {
                    try (ResultSet rs = cstmt.getResultSet()) {
                        results.add(resultSetToListOfMaps(rs));
                    }
                }
                isResultSet = cstmt.getMoreResults();
                if (!isResultSet && cstmt.getUpdateCount() == -1) {
                    break;
                }
            }

            response.put("success", true);
            response.put("results", results);
        } catch (Exception e) {
            response.put("success", false);
            response.put("results", results);
            response.put("failureResponse", e.getMessage());
        }

        System.out.println(toJson(response));
    }

    private static void getColumns(Connection conn, String schema, String table) throws Exception {
        DatabaseMetaData meta = conn.getMetaData();
        List<Map<String, Object>> columns = new ArrayList<>();
        try (ResultSet rs = meta.getColumns(null, schema, table, null)) {
            while (rs.next()) {
                Map<String, Object> col = new HashMap<>();
                col.put("TABLE_CAT",        rs.getString("TABLE_CAT"));
                col.put("TABLE_SCHEM",      rs.getString("TABLE_SCHEM"));
                col.put("TABLE_NAME",       rs.getString("TABLE_NAME"));
                col.put("COLUMN_NAME",      rs.getString("COLUMN_NAME"));
                col.put("DATA_TYPE",        rs.getInt("DATA_TYPE"));
                col.put("TYPE_NAME",        rs.getString("TYPE_NAME"));
                col.put("COLUMN_SIZE",      rs.getInt("COLUMN_SIZE"));
                col.put("BUFFER_LENGTH",    rs.getInt("BUFFER_LENGTH"));
                col.put("DECIMAL_DIGITS",   rs.getInt("DECIMAL_DIGITS"));
                col.put("NUM_PREC_RADIX",   rs.getInt("NUM_PREC_RADIX"));
                col.put("NULLABLE",         rs.getInt("NULLABLE"));
                col.put("REMARKS",          rs.getString("REMARKS"));
                col.put("COLUMN_DEF",       rs.getString("COLUMN_DEF"));
                col.put("SQL_DATA_TYPE",    rs.getInt("SQL_DATA_TYPE"));
                col.put("SQL_DATETIME_SUB", rs.getInt("SQL_DATETIME_SUB"));
                col.put("CHAR_OCTET_LENGTH",rs.getInt("CHAR_OCTET_LENGTH"));
                col.put("ORDINAL_POSITION", rs.getInt("ORDINAL_POSITION"));
                col.put("IS_NULLABLE",      rs.getString("IS_NULLABLE"));
                columns.add(col);
            }
        }
        System.out.println(toJson(columns));
    }

    // ─── JSON serialisation ───────────────────────────────────────────────────────

    private static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Boolean || obj instanceof Number) {
            return obj.toString();
        }
        if (obj instanceof List) {
            StringBuilder sb = new StringBuilder("[");
            List<?> list = (List<?>) obj;
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof Map) {
            StringBuilder sb = new StringBuilder("{");
            Map<?, ?> map = (Map<?, ?>) obj;
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder(s.length() + 8);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"':  sb.append("\\\""); break;
                case '\b': sb.append("\\b");  break;
                case '\f': sb.append("\\f");  break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    // ─── JSON parsing (minimal but correct for our schema) ────────────────────────
    //
    // Parses a JSON object at the top level (credential envelope) and a JSON array
    // (parameter list). Handles strings, numbers, booleans, null, nested objects and
    // arrays. Handles Unicode escape sequences in string values. Sufficient for the
    // structured payloads produced by JSON.stringify on the Node.js side.

    /** Parse a JSON array string and return a List of Java objects. */
    static List<Object> parseJsonArray(String json) throws Exception {
        if (json == null) json = "";
        String s = json.trim();
        if (s.isEmpty() || s.equals("[]")) return new ArrayList<>();
        if (!s.startsWith("[")) throw new Exception("Expected JSON array, got: " + s.substring(0, Math.min(20, s.length())));
        int[] pos = {0};
        return (List<Object>) parseValue(s, pos);
    }

    /** Parse a JSON object string and return a Map of String -> Object. */
    @SuppressWarnings("unchecked")
    static Map<String, Object> parseJsonObject(String json) throws Exception {
        if (json == null) json = "{}";
        String s = json.trim();
        if (!s.startsWith("{")) throw new Exception("Expected JSON object, got: " + s.substring(0, Math.min(20, s.length())));
        int[] pos = {0};
        return (Map<String, Object>) parseValue(s, pos);
    }

    private static Object parseValue(String s, int[] pos) throws Exception {
        skipWhitespace(s, pos);
        if (pos[0] >= s.length()) throw new Exception("Unexpected end of JSON");
        char c = s.charAt(pos[0]);
        if (c == '"')  return parseString(s, pos);
        if (c == '{')  return parseObject(s, pos);
        if (c == '[')  return parseArray(s, pos);
        if (c == 't')  { pos[0] += 4; return Boolean.TRUE; }
        if (c == 'f')  { pos[0] += 5; return Boolean.FALSE; }
        if (c == 'n')  { pos[0] += 4; return null; }
        if (c == '-' || Character.isDigit(c)) return parseNumber(s, pos);
        throw new Exception("Unexpected character '" + c + "' at position " + pos[0]);
    }

    private static Map<String, Object> parseObject(String s, int[] pos) throws Exception {
        Map<String, Object> map = new HashMap<>();
        pos[0]++; // skip '{'
        skipWhitespace(s, pos);
        if (pos[0] < s.length() && s.charAt(pos[0]) == '}') { pos[0]++; return map; }
        while (pos[0] < s.length()) {
            skipWhitespace(s, pos);
            String key = parseString(s, pos);
            skipWhitespace(s, pos);
            if (pos[0] >= s.length() || s.charAt(pos[0]) != ':') throw new Exception("Expected ':' in object");
            pos[0]++;
            Object val = parseValue(s, pos);
            map.put(key, val);
            skipWhitespace(s, pos);
            if (pos[0] >= s.length()) break;
            char next = s.charAt(pos[0]);
            if (next == '}') { pos[0]++; break; }
            if (next == ',') { pos[0]++; } else { throw new Exception("Expected ',' or '}' in object"); }
        }
        return map;
    }

    private static List<Object> parseArray(String s, int[] pos) throws Exception {
        List<Object> list = new ArrayList<>();
        pos[0]++; // skip '['
        skipWhitespace(s, pos);
        if (pos[0] < s.length() && s.charAt(pos[0]) == ']') { pos[0]++; return list; }
        while (pos[0] < s.length()) {
            list.add(parseValue(s, pos));
            skipWhitespace(s, pos);
            if (pos[0] >= s.length()) break;
            char next = s.charAt(pos[0]);
            if (next == ']') { pos[0]++; break; }
            if (next == ',') { pos[0]++; } else { throw new Exception("Expected ',' or ']' in array"); }
        }
        return list;
    }

    private static String parseString(String s, int[] pos) throws Exception {
        if (s.charAt(pos[0]) != '"') throw new Exception("Expected '\"' at position " + pos[0]);
        pos[0]++;
        StringBuilder sb = new StringBuilder();
        while (pos[0] < s.length()) {
            char c = s.charAt(pos[0]++);
            if (c == '"') return sb.toString();
            if (c == '\\') {
                if (pos[0] >= s.length()) throw new Exception("Unexpected end of string escape");
                char esc = s.charAt(pos[0]++);
                switch (esc) {
                    case '"': sb.append('"'); break;
                    case '\\': sb.append('\\'); break;
                    case '/': sb.append('/'); break;
                    case 'b': sb.append('\b'); break;
                    case 'f': sb.append('\f'); break;
                    case 'n': sb.append('\n'); break;
                    case 'r': sb.append('\r'); break;
                    case 't': sb.append('\t'); break;
                    case 'u':
                        String hex = s.substring(pos[0], Math.min(pos[0] + 4, s.length()));
                        sb.append((char) Integer.parseInt(hex, 16));
                        pos[0] += 4;
                        break;
                    default: sb.append(esc);
                }
            } else {
                sb.append(c);
            }
        }
        throw new Exception("Unterminated string");
    }

    private static Number parseNumber(String s, int[] pos) {
        int start = pos[0];
        if (s.charAt(pos[0]) == '-') pos[0]++;
        while (pos[0] < s.length() && (Character.isDigit(s.charAt(pos[0])) || s.charAt(pos[0]) == '.' || s.charAt(pos[0]) == 'e' || s.charAt(pos[0]) == 'E' || s.charAt(pos[0]) == '+' || s.charAt(pos[0]) == '-')) {
            pos[0]++;
        }
        String num = s.substring(start, pos[0]);
        if (num.contains(".") || num.contains("e") || num.contains("E")) {
            return Double.parseDouble(num);
        }
        return Long.parseLong(num);
    }

    private static void skipWhitespace(String s, int[] pos) {
        while (pos[0] < s.length() && Character.isWhitespace(s.charAt(pos[0]))) pos[0]++;
    }

    private static List<Map<String, Object>> resultSetToListOfMaps(ResultSet rs) throws Exception {
        List<Map<String, Object>> list = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        int colCount = meta.getColumnCount();
        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            for (int i = 1; i <= colCount; i++) {
                String colName = meta.getColumnLabel(i);
                Object val = rs.getObject(i);
                row.put(colName, val);
            }
            list.add(row);
        }
        return list;
    }
}
