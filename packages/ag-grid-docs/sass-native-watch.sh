#!/bin/sh

# This script is a temporary measure as a step towards faster recompilation
# Run docs with `AG_NO_CSS=1 npm run docs` then run this file to 

command="./node_modules/.bin/node-sass --watch "


for themeDir in ../../community-modules/core/src/styles/ag-theme-*
do
    themeName=`basename "$themeDir"`

    source="../../community-modules/core/src/styles/$themeName/sass/$themeName.scss"
    dest="../../community-modules/all-modules/dist/styles"
    if [ -f "$source" ]
    then
        # build first, because --watch doesn't do an initial build
        ./node_modules/.bin/node-sass --source-map true --error-bell --output "$dest" "$source"
        ./node_modules/.bin/node-sass --source-map true --error-bell --output "$dest" --watch "$source" & pid=$!
        PID_LIST+=" $pid"
    fi
done

# kill watch processes on Ctrl+C
trap "kill $PID_LIST" SIGINT
wait $PID_LIST
