#!/bin/sh


# This script is a temporary measure as a step towards faster recompilation
# Run docs with `AG_NO_CSS=1 npm run docs` then run this file to

cd `dirname "$0"`
command="./node_modules/.bin/node-sass --watch "
srcFolder="../../grid-community-modules/core/src/styles"
patchedSrcFolder=".patched-styles/"
destFolder="../../grid-community-modules/all-modules/dist/styles"
filterString="$1"

mkdir -p $patchedSrcFolder

build_sass() {
    if [[ "$1" == *"$filterString"* ]]
    then
        # patch source file to prepend $ag-compatibility-mode variable
        originalSourceFile="$1"
        originalSourceDir=`dirname "$1"`
        patchedSrcFile="${patchedSrcFolder}"`basename "$originalSourceFile"`
        mkdir -p `dirname "$patchedSrcFile"`
        echo '$ag-compatibility-mode: false;' > "$patchedSrcFile"
        echo '$ag-suppress-all-theme-deprecation-warnings: true;' >> "$patchedSrcFile"
        cat "$originalSourceFile" >> "$patchedSrcFile"
        # build first, because --watch doesn't do an initial build
        ./node_modules/.bin/node-sass --include-path "$originalSourceDir" --source-map true --error-bell --output "$destFolder" "$patchedSrcFile"
        ./node_modules/.bin/node-sass --include-path "$originalSourceDir" --source-map true --error-bell --output "$destFolder" --watch "$patchedSrcFile" & pid=$!
        PID_LIST+=" $pid"
    fi
}

for themeDir in $srcFolder/ag-theme-*
do
    themeName=`basename "$themeDir"`
    source="$srcFolder/$themeName/sass/$themeName.scss"
    if [[ -f "$source" ]]
    then
        build_sass "$source"
    fi
done

for fontFile in $srcFolder/webfont/*.scss
do
    build_sass "$fontFile"
done

build_sass "$srcFolder/ag-grid.scss"

# kill watch processes on Ctrl+C
trap "kill $PID_LIST" SIGINT
wait $PID_LIST
