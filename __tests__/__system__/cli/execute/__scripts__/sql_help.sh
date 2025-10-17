#!/bin/bash

zowe db2 execute sql --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 execute sql -h --rfj
exit $?
