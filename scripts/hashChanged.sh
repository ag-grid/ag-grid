#!/usr/bin/env bash

module_directory=$(pwd)
if [ ! -z "$1" ]
then
  module_directory=$1
fi

hash_filename="$module_directory/.hash"
if [ ! -z "$2" ]
then
  hash_filename="$module_directory/$2"
fi

if [ ! -f  $hash_filename ]
then
  echo 1;
else
  __dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  hash_now=$("$__dir"/hashDirectory.sh "$module_directory")
  existing_hash=$(cat $hash_filename);

  if [ "$hash_now" = "$existing_hash" ]
  then
    echo 0;
  else
    echo 1
  fi
fi

