#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the source branch that you want to merge"
    echo "For example git-merge-branch-into-master.sh b19.1.2 will merge changes in b19.1.2 into master"
    exit 1
fi

examples=(ag-grid-angular-cli-example ag-grid-aurelia-example ag-grid-react-example ag-grid-vue-example)

pwd
for example in ${examples[@]}; do
    echo $example
    cd "packages/$example"

    git checkout master
    ../../scripts/git-merge-one-way.sh $1
    cd ../..
done

