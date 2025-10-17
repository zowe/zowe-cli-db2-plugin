#!/bin/bash

# Generate random table name
TABLE_NAME=`cat /dev/urandom | tr -dc '[:upper:]' | fold -w 15 | head -n 1`
TABLE_NAME="T${TABLE_NAME}"

zowe db2 export table IBMUSER.${TABLE_NAME}
exit $?
