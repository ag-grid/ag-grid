#!/usr/bin/env bash

CHARTS_VERSION=`node scripts/getLatestChartDep.js`

node scripts/setChartsDepVersions.js $CHARTS_VERSION
npm run bootstrap

