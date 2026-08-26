#!/bin/bash
set -e
zowe db2 call stored-proc "TYPESMAP" \
  --parameters '[
    {"ParamType":"INPUT","Data":"","DataType":1},
    {"ParamType":"INPUT","Data":"","DataType":12},
    {"ParamType":"INPUT","Data":1,"DataType":5},
    {"ParamType":"INPUT","Data":42,"DataType":4},
    {"ParamType":"INPUT","Data":9999999999,"DataType":-5},
    {"ParamType":"INPUT","Data":3.14,"DataType":3},
    {"ParamType":"INPUT","Data":2.5,"DataType":7},
    {"ParamType":"INPUT","Data":1.23456789,"DataType":8},
    {"ParamType":"INPUT","Data":"2000-01-01","DataType":91},
    {"ParamType":"INPUT","Data":"00:00:00","DataType":92},
    {"ParamType":"INPUT","Data":"2000-01-01 00:00:00","DataType":93},
    {"ParamType":"OUTPUT","Data":null,"DataType":1},
    {"ParamType":"OUTPUT","Data":null,"DataType":12},
    {"ParamType":"OUTPUT","Data":null,"DataType":5},
    {"ParamType":"OUTPUT","Data":null,"DataType":4},
    {"ParamType":"OUTPUT","Data":null,"DataType":-5},
    {"ParamType":"OUTPUT","Data":null,"DataType":3},
    {"ParamType":"OUTPUT","Data":null,"DataType":7},
    {"ParamType":"OUTPUT","Data":null,"DataType":8}
  ]' --rfj \
  | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const r=JSON.parse(d); if(!r.success){process.stderr.write(r.stderr||r.message||'failed'); process.exit(1);} console.log(JSON.stringify(r.data)); })"
