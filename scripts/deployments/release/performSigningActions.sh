#!/usr/bin/env bash

PACKAGE_ROOT="./dist/artifacts"

if [ "$#" -ne 1 ]
then
    echo "You must the GPG public key as the first argument"
    exit 1
fi

if [ -z "$1" ];
then
    echo "The GPG public key supplied is empty"
    exit 1
fi

for directory in 'community-modules' 'packages';
do
  for package in `ls $PACKAGE_ROOT/$directory/*.tgz`;
  do
    gpg --sign --detach-sign --interactive --verbose --digest-algo sha512 -o $package.sig $package
  done
done

echo "$1"  > "$PACKAGE_ROOT/packages/gpg-pub.asc"

