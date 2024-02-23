#!/bin/bash

function forEachDirectory {
  local directories=("$@")

  for directory in "${directories[@]}";
  do
      module_dirs=$(ls "$PWD/$directory")
      for module_dir in ${module_dirs[@]}
      do
        if [ ! -d "$PWD/$directory/$module_dir/dist" ] && [ "$PWD/$directory/$module_dir" != "$PWD/$directory/styles" ]
        then
          echo "$PWD/$directory/$module_dir/dist doesn't exist"
        fi
      done
  done
}

MODULE_ROOTS=("community-modules" "enterprise-modules")


forEachDirectory "${MODULE_ROOTS[@]}"
