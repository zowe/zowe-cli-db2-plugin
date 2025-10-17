#!/bin/bash
set -e

zowe db2 drop DEMOUSER.DEMOTABLE
exit $?
