#!/usr/bin/env bash

# a MASSIVE allowable increase...due to the new alpine theme
TOLERANCE_PCT=20

command='stat'
arguments=' -f%z ' # osx
if [[ "$OSTYPE" -ne "darwin" ]]
then
        arguments=' --printf="%s" '
fi

function compareOldVsNew {
  files=$1
  project=$2

  for file in $files
  do
    existing_file_size=$(eval $command$arguments$file)
    new_file="../node_modules/$project/dist/$file"
    new_file_size=$(eval $command$arguments$new_file)

    difference=$((new_file_size - existing_file_size))

    if [[ $difference -gt 0 ]]
    then
      percentage_raw=`bc <<< "scale=2;$difference/$existing_file_size*100"`
      percentage=${percentage_raw/.*/}
      if [[ $percentage -gt $TOLERANCE_PCT ]]
      then
        echo "$file has grown by $percentage%, which is more than the allowed $TOLERANCE_PCT%. Old size: $existing_file_size, New Size: $new_file_size."
      fi
    fi
  done
}

compareOldVsNew "*community*.js" "@ag-grid-community/all-modules"
compareOldVsNew "*enterprise*.js" "@ag-grid-enterprise/all-modules"
