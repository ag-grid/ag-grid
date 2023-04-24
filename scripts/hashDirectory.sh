#!/usr/bin/env bash

working_directory=$(pwd)
if [ "$#" -eq 1 ]
then
  working_directory=$1
fi

SHASUM='shasum'
if [[ `uname -s` == MINGW* ]]; then
  SHASUM='/usr/bin/core_perl/shasum'
fi

find "$working_directory" -type d \( -path $working_directory/cypress/videos -o -path $working_directory/umd -o -path $working_directory/lib -o -path $working_directory/node_modules -o -path $working_directory/.git -o -path $working_directory/dist -o -path $working_directory/.idea \) -prune -o -type f -print | grep -Ev "$working_directory/.hash|$working_directory/.examplesHash" | sort -z | tr '\n' '\0' |  xargs -0 $SHASUM | $SHASUM
