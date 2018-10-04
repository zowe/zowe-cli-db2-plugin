#!/bin/bash

zowe db2 export --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 export -h --rfj
exit $?
