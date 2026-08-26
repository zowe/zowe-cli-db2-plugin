#!/bin/bash
set -e
zowe db2 execute sql --query "SELECT * FROM SYSIBM.SYSTABLES WHERE NAME='ZZZNOMATCH_XYZ'" --rfj \
  | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); if(!r.success){process.stderr.write(r.stderr||r.message||'failed'); process.exit(1);} console.log(JSON.stringify(r.data)); })"
