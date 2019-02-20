#!/bin/bash

HOST=$1
PORT=$2
DB=$3

zowe db2 export table SYSIBM.SYSROLES --host $HOST --port $PORT --database $DB
exit $?
