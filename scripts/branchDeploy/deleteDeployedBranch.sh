#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a jira number to delete"
    exit 1
fi

JIRA=$1

# a small safety check to strip out blank or just /
CHECK=`echo "$JIRA" | sed 's|/||g' | tr -d ' '`
if [[ "$CHECK" != "/" && "$CHECK" != "" ]]
then
  echo "All good"
else
  echo "Invalid jira number supplied [$JIRA]";
  exit 1;
fi
