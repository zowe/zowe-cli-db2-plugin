#!/bin/bash

zowe db2 export table --outfile backup.sql
exit $?
