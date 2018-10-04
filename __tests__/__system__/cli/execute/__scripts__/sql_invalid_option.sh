#!/bin/bash
set -e

zowe db2 execute sql --commit "SELECT 1 FROM SYSIBM.SYSDUMMY1"
exit $?
