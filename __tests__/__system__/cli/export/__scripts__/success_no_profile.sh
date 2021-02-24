#!/bin/bash

HOST=$1
PORT=$2
USER=$3
PASS=$4
DB=$5

zowe db2 export table SYSIBM.SYSDUMMY1 --host $HOST --port $PORT --user $USER --password $PASS --database $DB
exit $?
