#!/usr/bin/env bash

module_directory=$(pwd)
if [ "$#" -eq 1 ]
then
  module_directory=$1
fi

if [ ! -f "$module_directory/.hash" ]
then
  echo 1;
else
  __dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  hash_now=$("$__dir"/hashDirectory.sh "$module_directory")
  existing_hash=$(cat "$module_directory/.hash");

  if [ "$hash_now" = "$existing_hash" ]
  then
    echo 0;
  else
    echo 1
  fi
fi

