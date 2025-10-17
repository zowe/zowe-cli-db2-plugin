#!/bin/bash
set -e

zowe db2 execute sql --query "SELECT 1 AS TOTAL FROM SYSIBM.SYSDUMMY1" --rfj
exit $?
