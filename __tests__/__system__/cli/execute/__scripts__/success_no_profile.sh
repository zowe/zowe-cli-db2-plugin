#!/usr/bin/env bash
set -e # fail the script if we get a non zero exit code

HOST=$1
PORT=$2
USER=$3
PASS=$4
DB=$5

zowe db2 execute sql --query "SELECT 1 AS TOTAL FROM SYSIBM.SYSDUMMY1" --hostname $HOST --port $PORT --username $USER --password $PASS --database $DB
exit $?
