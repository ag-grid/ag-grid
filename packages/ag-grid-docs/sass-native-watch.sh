#!/bin/sh

# This script is a temporary measure as a step towards faster recompilation
# Run docs with `AG_NO_CSS=1 npm run docs` then run this file to 

command="./node_modules/.bin/sass --watch "

for themeDir in ../../community-modules/grid-core/src/styles/ag-theme-*
do
    themeName=`basename "$themeDir"`

    source="../../community-modules/grid-core/src/styles/$themeName/sass/$themeName.scss"
    dest="../../community-modules/grid-all-modules/dist/styles/$themeName.css"
    if [ -f "$source" ]
    then
        command="$command $source:$dest"
    fi
done

$command
