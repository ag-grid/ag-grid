#!/bin/bash

GRID_VERSION=$1
CHART_VERSION=$2

INSTANCES=`node scripts/sanityCheckPackages.js $GRID_VERSION "~$GRID_VERSION" $CHART_VERSION "~$CHART_VERSION" | wc -l`

if [ $INSTANCES -ne 0 ]
then
  echo "Grid/Chart Versions not as expected, or not all AG deps are symlinks"
  node scripts/sanityCheckPackages.js $GRID_VERSION "~$GRID_VERSION" $CHART_VERSION "~$CHART_VERSION"
  exit 1
fi

exit 0
