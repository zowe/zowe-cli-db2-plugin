#!/bin/bash

zowe db2 execute --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 execute -h --rfj
exit $?
