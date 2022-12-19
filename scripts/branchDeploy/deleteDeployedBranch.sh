#!/usr/bin/env bash

if [ "$#" -lt 1 ]
  then
    echo "You must supply a jira number to delete"
    exit 1
fi

JIRA=$1

# a small safety check to strip out blank or just /
JIRA_CHECK=`echo "$JIRA" | sed 's|/||g' | tr -d ' '`

# check s3 folder exists
S3_CHECK=`aws s3 ls s3://testing.ag-grid.com/$JIRA | wc -l`

if [[ "$JIRA_CHECK" != "/" && "$JIRA_CHECK" != "" && "$S3_CHECK" -ne 0 ]]
then
  aws s3 rm s3://testing.ag-grid.com/$JIRA --recursive --quiet
else
  echo "Invalid jira number supplied [$JIRA], or deployed branch doesn't exist [s3://testing.ag-grid.com/$JIRA]";
  exit 1;
fi
