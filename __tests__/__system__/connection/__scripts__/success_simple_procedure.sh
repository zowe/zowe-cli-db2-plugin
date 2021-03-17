#!/bin/bash
set -e

zowe db2 call procedure PROC_NAME --parameters "PARAM1" "PARAM2"
exit $?
