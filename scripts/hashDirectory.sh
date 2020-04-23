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

find "$working_directory" -type f \( -path $working_directory/.hash \) -prune -o -type d \( -path $working_directory/umd -o -path $working_directory/lib -o -path $working_directory/node_modules -o -path $working_directory/.git -o -path $working_directory/dist -o -path $working_directory/.idea \) -prune -o -type f -print0 | sort -z | xargs -0 $SHASUM | $SHASUM
