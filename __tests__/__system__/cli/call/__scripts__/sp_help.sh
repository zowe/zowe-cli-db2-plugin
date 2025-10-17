#!/bin/bash

zowe db2 call procedure --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 call sp -h --rfj
exit $?
