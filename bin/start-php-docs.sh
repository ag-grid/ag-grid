#/usr/bin/env bash

php -S localhost:8080 -t ag-grid-docs/src & 
sh -c 'cd ag-grid-dev && gulp'
