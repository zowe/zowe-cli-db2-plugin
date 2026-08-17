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
 * Outputs JSON results to stdout.
 */
public class Db2JdbcRunner {

    public static void main(String[] args) {
        if (args.length < 4) {
            System.err.println("Usage: java Db2JdbcRunner <action> <url> <user> <password> [args...]");
            System.exit(1);
        }

        String action = args[0];
        String url = args[1];
        String user = args[2];
        String password = args[3];

        try {
            // Register DB2 JDBC driver
            try {
                Class.forName("com.ibm.db2.jcc.DB2Driver");
            } catch (ClassNotFoundException e) {
                // Fallback driver name if needed
                Class.forName("com.ibm.db2.jdbc.app.DB2Driver");
            }

            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                switch (action.toLowerCase()) {
                    case "execute":
                        if (args.length < 5) {
                            throw new IllegalArgumentException("SQL query required for execute action");
                        }
                        executeSql(conn, args[4]);
                        break;

                    case "call":
                        if (args.length < 5) {
                            throw new IllegalArgumentException("Routine name required for call action");
                        }
                        String routineName = args[4];
                        String paramsJson = args.length > 5 ? args[5] : "[]";
                        callProcedure(conn, routineName, paramsJson);
                        break;

                    case "getcolumns":
                        if (args.length < 6) {
                            throw new IllegalArgumentException("Schema and Table required for getColumns action");
                        }
                        getColumns(conn, args[4], args[5]);
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
        // Simple call procedure runner
        List<Object> paramList = parseSimpleJsonArray(paramsJson);
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
            int outCount = 0;
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
                if (paramType == 1) { // INPUT
                    cstmt.setObject(paramIndex, data);
                } else if (paramType == 2) { // OUTPUT
                    cstmt.registerOutParameter(paramIndex, Types.VARCHAR);
                    outCount++;
                } else if (paramType == 3) { // INOUT
                    cstmt.setObject(paramIndex, data);
                    cstmt.registerOutParameter(paramIndex, Types.VARCHAR);
                    outCount++;
                }
            }

            boolean isResultSet = cstmt.execute();

            // Collect OUT parameters
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
                col.put("TABLE_CAT", rs.getString("TABLE_CAT"));
                col.put("TABLE_SCHEM", rs.getString("TABLE_SCHEM"));
                col.put("TABLE_NAME", rs.getString("TABLE_NAME"));
                col.put("COLUMN_NAME", rs.getString("COLUMN_NAME"));
                col.put("DATA_TYPE", rs.getInt("DATA_TYPE"));
                col.put("TYPE_NAME", rs.getString("TYPE_NAME"));
                col.put("COLUMN_SIZE", rs.getInt("COLUMN_SIZE"));
                col.put("BUFFER_LENGTH", rs.getInt("BUFFER_LENGTH"));
                col.put("DECIMAL_DIGITS", rs.getInt("DECIMAL_DIGITS"));
                col.put("NUM_PREC_RADIX", rs.getInt("NUM_PREC_RADIX"));
                col.put("NULLABLE", rs.getInt("NULLABLE"));
                col.put("REMARKS", rs.getString("REMARKS"));
                col.put("COLUMN_DEF", rs.getString("COLUMN_DEF"));
                col.put("SQL_DATA_TYPE", rs.getInt("SQL_DATA_TYPE"));
                col.put("SQL_DATETIME_SUB", rs.getInt("SQL_DATETIME_SUB"));
                col.put("CHAR_OCTET_LENGTH", rs.getInt("CHAR_OCTET_LENGTH"));
                col.put("ORDINAL_POSITION", rs.getInt("ORDINAL_POSITION"));
                col.put("IS_NULLABLE", rs.getString("IS_NULLABLE"));
                columns.add(col);
            }
        }
        System.out.println(toJson(columns));
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

    private static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
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
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static List<Object> parseSimpleJsonArray(String json) {
        List<Object> list = new ArrayList<>();
        if (json == null || json.trim().isEmpty() || json.equals("[]")) {
            return list;
        }
        String trimmed = json.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
            if (!trimmed.isEmpty()) {
                String[] parts = trimmed.split(",");
                for (String part : parts) {
                    part = part.trim();
                    if (part.startsWith("\"") && part.endsWith("\"")) {
                        list.add(part.substring(1, part.length() - 1));
                    } else if ("true".equalsIgnoreCase(part) || "false".equalsIgnoreCase(part)) {
                        list.add(Boolean.parseBoolean(part));
                    } else {
                        try {
                            list.add(Integer.parseInt(part));
                        } catch (NumberFormatException e) {
                            list.add(part);
                        }
                    }
                }
            }
        }
        return list;
    }
}
