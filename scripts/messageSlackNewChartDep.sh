#!/usr/bin/env bash

WEBHOOK_URL=$1
LATEST_CHART_DEP=`node ./scripts/getLatestChartDep.js`

./scripts/messageSlack.sh "New Charts Version Available ($LATEST_CHART_DEP). Please run bootstrap." "$WEBHOOK_URL"
