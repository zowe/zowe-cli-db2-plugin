#!/usr/bin/expect

set timeout 20

set addr [lindex $argv 0]

set usr [lindex $argv 1]

set pword [lindex $argv 2]

spawn telnet $addr

expect "Username: "

send "$usr\r"

expect "Password: "

send "$pword\r"

interact
