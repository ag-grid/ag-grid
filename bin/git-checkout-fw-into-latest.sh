#!/usr/bin/env bash

if [ "$#" -ne 1 ]
  then
    echo "You must supply the framework as the as first parameter  (ie angular, react, polymer etc)"
    exit 1
fi

git-checkout-fw-into-existing-branch.sh latest $1
