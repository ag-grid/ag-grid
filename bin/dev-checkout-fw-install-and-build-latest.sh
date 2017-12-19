#!/usr/bin/env bash

set -e

git-checkout-fw-into-latest.sh $1
cd latest
dev-npm-install-all.sh
dev-build-and-install-once.sh
