#!/bin/bash
set -e

# Prepare SQL file
SQLFILE=$(mktemp)
cat > ${SQLFILE} <<EOF
SELECT 1 AS TOTAL FROM SYSIBM.SYSDUMMY1;
SELECT 'TEXT' AS DATA FROM SYSIBM.SYSDUMMY1;
EOF

zowe db2 execute sql --file ${SQLFILE}

rm ${SQLFILE}
