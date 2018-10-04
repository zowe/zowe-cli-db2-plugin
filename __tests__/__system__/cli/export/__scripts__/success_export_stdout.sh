#!/bin/bash

zowe db2 export table SYSIBM.SYSROLES
exit $?
