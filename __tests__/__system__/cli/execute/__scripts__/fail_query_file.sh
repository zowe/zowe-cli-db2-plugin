#!/bin/bash
set -e

zowe db2 execute sql --query "SELECT 1 FROM SYSIBM.SYSDUMMY1" --file backup.sql
exit $?
