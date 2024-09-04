#!/usr/bin/env bash

CHARTS_VERSION=`node scripts/getLatestChartDep.js`

node ./scripts/deployments/setChartsDepVersions.js $CHARTS_VERSION
