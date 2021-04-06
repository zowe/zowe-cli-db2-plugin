#!/bin/bash
set -e

zowe db2 call sp "admin_info_sysparm (NULL,NULL,NULL)"
exit $?
