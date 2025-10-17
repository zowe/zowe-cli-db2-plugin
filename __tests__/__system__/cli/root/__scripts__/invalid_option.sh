#!/bin/bash
set -e

zowe db2 --command "-D DDF"
exit $?
