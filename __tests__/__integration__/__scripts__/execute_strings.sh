#!/bin/bash
set -e
zowe db2 execute sql --query "SELECT CAST('hello' AS CHAR(20)) AS C, CAST('world' AS VARCHAR(20)) AS V FROM SYSIBM.SYSDUMMY1" --rfj \
  | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); if(!r.success){process.stderr.write(r.stderr||r.message||'failed'); process.exit(1);} console.log(JSON.stringify(r.data)); })"
