#!/bin/bash
set -e

zowe db2 execute command "-D DDF"
exit $?
