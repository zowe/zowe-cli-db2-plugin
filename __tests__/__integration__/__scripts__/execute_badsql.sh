#!/bin/bash
zowe db2 execute sql --query "SELEKT 1 FROM SYSIBM.SYSDUMMY1"
exit $?
