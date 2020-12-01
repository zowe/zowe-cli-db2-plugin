#!/bin/bash
set -e

zowe db2 execute sql --query "SELECT * FROM SYSIBM.SYSDUMMY1"
exit $?
