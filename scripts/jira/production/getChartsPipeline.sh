echo "Starting Charts" >> pipeline.log

JIRA_CREDENTIALS=$JIRA_CREDENTIALS /home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/getChartsPipeline.js

# Generate the LLM markdown twin from the freshly-downloaded JSON, served at /pipeline.md.
/home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/jiraDataToMarkdown.mjs pipeline /var/www/html/charts/pipeline/pipeline.json /var/www/html/charts/pipeline.md "AG Charts" >> pipeline.log 2>&1
