#!/bin/zsh 
ag 'gridOptions' src/*/*/main.js \
    | grep -v new.agGrid \
    | grep -v 'var gridOptions' \
    | grep -v 'let gridOptions' \
    | grep -v 'const gridOptions' \
    | grep -v gridOptions.api \
    | grep -v gridOptions.columnApi \
    | cut -d: -f 1 | uniq \
    | grep -v angularjs \
    | grep -v tutorials \
    | grep -v value-cache \
    | grep -v rtl-complex \
    > examples-to-check.txt;

cat examples-to-check.txt
