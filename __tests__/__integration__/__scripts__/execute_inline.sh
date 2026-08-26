#!/bin/bash
# Execute a SQL statement passed as $1. Used for setup/teardown.
# Ignores errors (e.g. DROP when proc doesn't exist).
zowe db2 execute sql --query "$1" 2>/dev/null || true
