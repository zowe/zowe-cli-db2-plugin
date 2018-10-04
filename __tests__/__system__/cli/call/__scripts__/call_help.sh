#!/bin/bash

zowe db2 call --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 call -h --rfj
exit $?
