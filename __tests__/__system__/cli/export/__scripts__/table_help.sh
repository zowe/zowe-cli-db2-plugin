#!/bin/bash

zowe db2 export table --help
if [ $? -gt 0 ]
then
    exit $?
fi

zowe db2 export table -h --rfj
exit $?
