echo "Starting" >> pipeline.log

JIRA_CREDENTIALS=$JIRA_CREDENTIALS /home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/getPipeline.js
