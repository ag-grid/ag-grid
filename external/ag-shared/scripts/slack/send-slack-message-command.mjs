import { sendSlackMessage } from './send-slack-message.mjs';

const SLACK_BOT_OAUTH_TOKEN = process.env.SLACK_BOT_OAUTH_TOKEN;
const SLACK_MESSAGE_BLOCKS = process.env.SLACK_MESSAGE_BLOCKS;

if (!SLACK_BOT_OAUTH_TOKEN) {
    console.error('Error: SLACK_BOT_OAUTH_TOKEN environment variable is not set.');
    process.exit(1);
}

(async () => {
    const data = JSON.parse(SLACK_MESSAGE_BLOCKS);
    const results = await sendSlackMessage({
        authToken: SLACK_BOT_OAUTH_TOKEN,
        data,
    });

    if (results.error) {
        console.error('Error sending Slack message:', results.error);
        process.exit(1);
    } else {
        console.log('Slack message sent successfully:', results.results);
    }
})();
