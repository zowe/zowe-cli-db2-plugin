#!/bin/bash
set -e
zowe db2 call procedure "TYPESMAP" \
  --parameters \
    '{"ParamType":"INPUT","Data":"hello","DataType":1}' \
    '{"ParamType":"INPUT","Data":"world","DataType":12}' \
    '{"ParamType":"INPUT","Data":0,"DataType":5}' \
    '{"ParamType":"INPUT","Data":0,"DataType":4}' \
    '{"ParamType":"INPUT","Data":0,"DataType":-5}' \
    '{"ParamType":"INPUT","Data":0,"DataType":3}' \
    '{"ParamType":"INPUT","Data":0,"DataType":7}' \
    '{"ParamType":"INPUT","Data":0,"DataType":8}' \
    '{"ParamType":"INPUT","Data":"2000-01-01","DataType":91}' \
    '{"ParamType":"INPUT","Data":"00:00:00","DataType":92}' \
    '{"ParamType":"INPUT","Data":"2000-01-01 00:00:00","DataType":93}' \
    '{"ParamType":"OUTPUT","Data":null,"DataType":1}' \
    '{"ParamType":"OUTPUT","Data":null,"DataType":12}' \
  --rfj \
  | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); if(!r.success){process.stderr.write(r.stderr||r.message||'failed'); process.exit(1);} console.log(JSON.stringify(r.data)); })"
