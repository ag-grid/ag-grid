#!/bin/zsh

for file in `cat changes-in-latest`
    if [[ -a "$file" ]]; then 
        ;
    else
        echo "$file does not exist!";
    fi
