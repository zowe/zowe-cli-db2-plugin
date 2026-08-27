#!/bin/bash
set -e
zowe db2 execute sql --query "SELECT CAST(1 AS SMALLINT) AS SI, CAST(42 AS INTEGER) AS I, CAST(9999999999 AS BIGINT) AS BI, CAST(3.14 AS DECIMAL(5,2)) AS D, CAST(2.5 AS REAL) AS R, CAST(1.23456789 AS DOUBLE) AS DB FROM SYSIBM.SYSDUMMY1" --rfj \
  | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); if(!r.success){process.stderr.write(r.stderr||r.message||'failed'); process.exit(1);} console.log(JSON.stringify(r.data)); })"
