echo "Starting" >> pipeline.log

JIRA_CREDENTIALS=$JIRA_CREDENTIALS /home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/getPipeline.js

# Generate the LLM markdown twin from the freshly-downloaded JSON, served at /pipeline.md.
/home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/jiraDataToMarkdown.mjs pipeline /var/www/html/pipeline/pipeline.json /var/www/html/pipeline.md >> pipeline.log 2>&1
