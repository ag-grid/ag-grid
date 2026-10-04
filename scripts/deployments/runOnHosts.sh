#!/usr/bin/env bash

##########################################################################################
## Runs a deployment script once per production host, in parallel, and fails if any run fails.
##
## Usage: DEPLOY_HOSTS="<host> [<host>...]" ./scripts/deployments/runOnHosts.sh <script> [args...]
##
## For each host in the space-separated $DEPLOY_HOSTS this runs `<script> [args...] <host>`, e.g.
##   DEPLOY_HOSTS="$HOST $HOST_2" ./scripts/deployments/runOnHosts.sh ./scripts/deployments/release/uploadReleaseZip.sh 35.0.0
## runs `uploadReleaseZip.sh 35.0.0 $HOST` and `uploadReleaseZip.sh 35.0.0 $HOST_2` at the same time.
##
## The host is always passed as the LAST argument. That fits uploadReleaseZip.sh, archiveCurrentRelease.sh,
## prepareNewDeployment.sh, switchRelease.sh, downloadChangelog.sh, uploadAndUnzipArchive.sh and
## createArchiveAndUpload.sh. It does NOT fit patchUncachedArchives.sh, which takes the host third, before
## its optional set|clear action: it can only be run through here without an action (i.e. the default "set").
##
## Uses GNU parallel with the same options the TeamCity deploy steps use, prints the job log, and exits
## with parallel's status (the number of failed jobs, or non-zero if parallel itself failed).
##########################################################################################

set -euo pipefail

if [ "$#" -lt 1 ]
then
    echo "You must supply a script to run on each host (with any arguments to pass before the host)"
    echo "For example: DEPLOY_HOSTS=\"user@host1 user@host2\" ./scripts/deployments/runOnHosts.sh ./scripts/deployments/release/uploadReleaseZip.sh 35.0.0"
    exit 1
fi

read -r -a HOSTS <<< "${DEPLOY_HOSTS:-}"

if [ "${#HOSTS[@]}" -eq 0 ]
then
    echo "\$DEPLOY_HOSTS is not set or is empty - it must be a space-separated list of hosts, e.g. DEPLOY_HOSTS=\"user@host1 user@host2\""
    exit 1
fi

JOBLOG="$(mktemp)"
trap 'rm -f "$JOBLOG"' EXIT

STATUS=0
parallel --will-cite --tagstring '[{}]' --timeout 900 --joblog "$JOBLOG" "$@" {} ::: "${HOSTS[@]}" || STATUS=$?

cat "$JOBLOG"

exit $STATUS
