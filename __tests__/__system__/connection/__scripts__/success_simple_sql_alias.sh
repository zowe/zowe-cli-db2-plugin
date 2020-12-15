#!/bin/bash
set -e

zowe db2 execute sql -q "SELECT COUNT(*) AS TOTAL FROM SYSIBM.SYSDUMMY1"
exit $?
