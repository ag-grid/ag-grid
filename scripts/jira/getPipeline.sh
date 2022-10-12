echo "Starting" >> pipeline.log
source /home/aggrid/.bash_profile

JIRA_CREDENTIALS=$JIRA_CREDENTIALS /opt/cpanel/ea-nodejs10/bin/node /home/aggrid/jira_reports/getPipeline.js

