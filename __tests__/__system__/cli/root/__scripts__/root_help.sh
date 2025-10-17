#!/bin/bash
set -e

zowe db2 --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 -h --rfj
exit $?
