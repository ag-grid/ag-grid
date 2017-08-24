#!/bin/bash

echo '-------------------------------'
cat $1 | gsed -r -f stylus2sass.sed 
# cat $1 | gsed -r -f stylus2sass.sed | sass --scss --stdin --check
