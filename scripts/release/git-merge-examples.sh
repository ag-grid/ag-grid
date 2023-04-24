#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the source branch that you want to merge"
    echo "For example if you're in latest and you call git-merge-examples.sh b23.0.0 then this will merge changes in b23.0.0 into latest"
    exit 1
fi

example_root_dirs=(charts-examples grid-examples)

for example_root_dir in ${example_root_dirs[@]}
do
    example_dirs=$(ls "$example_root_dir")
    for example_dir in ${example_dirs[@]}
    do
        cd "./$example_root_dir/$example_dir"
        ../../scripts/release/git-merge-one-way.sh $1
        cd ../../
    done
done
