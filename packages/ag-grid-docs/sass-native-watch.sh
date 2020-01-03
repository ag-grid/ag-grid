#!/bin/sh

# This script is a temporary measure as a step towards faster recompilation
# Run docs with `AG_NO_CSS=1 npm run docs` then run this file to 

command="./node_modules/.bin/node-sass --watch "
srcFolder="../../community-modules/core/src/styles"
destFolder="../../community-modules/all-modules/dist/styles"
specificFile="$1"

build_sass() {
    # build first, because --watch doesn't do an initial build
    ./node_modules/.bin/node-sass --source-map true --error-bell --output "$destFolder" "$1"
    ./node_modules/.bin/node-sass --source-map true --error-bell --output "$destFolder" --watch "$1" & pid=$!
    PID_LIST+=" $pid"
}

if [ "$specificFile" = "" ]
then

    for themeDir in $srcFolder/ag-theme-*
    do
        themeName=`basename "$themeDir"`

        source="$srcFolder/$themeName/sass/$themeName.scss"
        dest=
        if [ -f "$source" ]
        then
            build_sass "$source"
        fi
    done

    build_sass "$srcFolder/ag-grid.scss"

else

    build_sass "$specificFile";

fi

# kill watch processes on Ctrl+C
trap "kill $PID_LIST" SIGINT
wait $PID_LIST
