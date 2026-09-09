echo "Starting" >> changelog.log

JIRA_CREDENTIALS=$JIRA_CREDENTIALS /home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/getStudioChangelog.js

# Generate the LLM markdown twin from the freshly-downloaded JSON, served at /changelog.md.
/home/ubuntu/.nvm/versions/node/v16.14.0/bin/node /home/ubuntu/jira_reports/jiraDataToMarkdown.mjs changelog /var/www/html/studio/changelog/changelog.json /var/www/html/studio/changelog.md "AG Studio" >> changelog.log 2>&1
