#!/bin/bash

zowe db2 export table SYSIBM.SYSDUMMY1 --separator true
exit $?
