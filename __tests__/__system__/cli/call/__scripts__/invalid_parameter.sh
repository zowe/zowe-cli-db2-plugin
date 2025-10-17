#!/bin/bash
set -e

zowe db2 call routine DEMOUSER.DEMOSP1
exit $?
