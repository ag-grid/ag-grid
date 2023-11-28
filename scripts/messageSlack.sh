#!/usr/bin/env bash

MESSAGE=$1
WEBHOOK_URL=$2

curl -X POST -H 'Content-type: application/json' --data '{"text": "'"$MESSAGE"'"}' "$2"
