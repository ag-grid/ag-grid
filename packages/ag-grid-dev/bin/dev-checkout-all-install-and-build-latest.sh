#!/usr/bin/env bash

set -e

git-checkout-all-into-latest.sh
cd latest
dev-npm-install-all.sh
dev-build-and-install-once.sh
