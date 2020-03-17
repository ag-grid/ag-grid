#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the source branch that you want to merge"
    echo "For example git-merge-branch-into-master.sh b19.1.2 will merge changes in b19.1.2 into master"
    exit 1
fi

example_root_dirs=(examples-charts examples-grid)

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

