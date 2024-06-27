#!/usr/bin/env bash

WEBHOOK_URL=$1
LATEST_CHART_DEP=`node ./scripts/getLatestChartDep.js`

./scripts/messageSlack.sh "New Charts Version Available ($LATEST_CHART_DEP). You'll need to run bootstrap after you update." "$WEBHOOK_URL"
