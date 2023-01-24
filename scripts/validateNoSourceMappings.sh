COMMUNITY_ROOTS=("grid-community-modules" "charts-community-modules")
ENTERPRISE_ROOTS=("grid-enterprise-modules")
PACKAGES_ROOTS=("grid-packages")

function forEachDirectory {
  local directories=("$@")

  for directory in "${directories[@]}";
  do
    for subDirectory in $(ls "$directory" | grep -v 'angular\|react\|vue\|styles\|solid')
    do
      RELATIVE_PATH=$directory/$subDirectory/dist
      # if the directory (with dist) doesn't exist it's probably a framework or styles and can be ignored
      if [[ -d "$RELATIVE_PATH" ]]; then
        echo "Checking $RELATIVE_PATH..."

        # exclude bundles (umd, umd etc)
        COUNT=`grep -R sourceMappingURL "$RELATIVE_PATH" | grep -Ev 'ag-grid-community|ag-grid-enterprise' | wc -l`
        if [ "$COUNT" -ne "0" ]; then
          echo "**************************************************************"
          echo "$RELATIVE_PATH has references to sourceMappingURL";
          echo "**************************************************************"
          exit 1;
        fi

        COUNT=`find "$RELATIVE_PATH" -name *.map | wc -l`
        if [ "$COUNT" -ne "0" ]; then
          echo "**************************************************************"
          echo ".map files found in $RELATIVE_PATH";
          echo "**************************************************************"
          exit 1;
        fi
      fi
    done
  done
}

forEachDirectory "${COMMUNITY_ROOTS[@]}"
forEachDirectory "${ENTERPRISE_ROOTS[@]}"
forEachDirectory "${PACKAGES_ROOTS[@]}"

echo "No references to sourceMappingURL found, no mappings file sound."
