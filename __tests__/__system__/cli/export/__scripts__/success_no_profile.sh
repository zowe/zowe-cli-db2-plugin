#!/bin/bash

HOST=$1
PORT=$2
USER=$3
PASS=$4
DB=$5

zowe db2 export table SYSIBM.SYSROLES --hostname $HOST --port $PORT --username $USER --password $PASS --database $DB
exit $?
