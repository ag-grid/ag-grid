const SLACK_POST_MESSAGE_URL = 'https://slack.com/api/chat.postMessage';
const SLACK_POST_EPHEMERAL_URL = 'https://slack.com/api/chat.postEphemeral';

export async function sendSlackMessage({ authToken, isEphemeral, data }) {
    const url = isEphemeral ? SLACK_POST_EPHEMERAL_URL : SLACK_POST_MESSAGE_URL;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Authorization: `Bearer ${authToken}`,
            },
            method: 'POST',
            body: JSON.stringify(data),
        });

        const results = await response.json();

        return results;
    } catch (error) {
        console.error('Error sending Slack message:', error);
        return {
            results: null,
            error: `Failed to send Slack message: ${error.message}`,
        };
    }
}
