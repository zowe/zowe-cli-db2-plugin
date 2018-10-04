#!/bin/bash
set -e

zowe db2 execute sql --file not-existing-file.sql
exit $?
