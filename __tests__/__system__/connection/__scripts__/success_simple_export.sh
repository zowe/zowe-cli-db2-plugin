#!/bin/bash
set -e

zowe db2 export table SYSIBM.SYSDUMMY1 --sep true
exit $?
