#!/bin/bash

zowe db2 export schema DEMOUSER.DEMOTABLE
exit $?
