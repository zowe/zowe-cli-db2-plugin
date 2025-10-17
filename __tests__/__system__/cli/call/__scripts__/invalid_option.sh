#!/bin/bash
set -e

zowe db2 call --sp "DEMOUSER.DEMOSP1(1, 2, 3)"
exit $?
