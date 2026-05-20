import { getSlackUserConfig } from './get-slack-user-config.mjs';
import { sendSlackMessage } from './send-slack-message.mjs';
import {
    getChangesData,
    getEmoji,
    getGitChanges,
    getRunUrl,
    getStagingUrl,
    ghaError,
    ghaWarning,
} from './_ci-notification-utils.mjs';

const {
    SLACK_BOT_OAUTH_TOKEN,
    NOTION_API_TOKEN,
    NOTION_DATA_SOURCE_ID,
    NOTION_API_VERSION,
    AG_PROJECT,
    RUN_ID,
    CURRENT_SHA,
    LAST_SUCCESSFUL_SHA,
    WEBSITE_STATUS_CHANNEL,
    DEPLOY_TO_STAGING,
} = process.env;

if (DEPLOY_TO_STAGING !== 'true') {
    console.log('DEPLOY_TO_STAGING is not true; skipping staging deploy notification.');
    process.exit(0);
}

// WEBSITE_STATUS_CHANNEL is optional — when unset we skip the shared-channel
// post but still send opt-in DMs.
const required = { SLACK_BOT_OAUTH_TOKEN, NOTION_API_TOKEN, NOTION_DATA_SOURCE_ID, AG_PROJECT, RUN_ID, CURRENT_SHA, LAST_SUCCESSFUL_SHA };
for (const [name, value] of Object.entries(required)) {
    if (!value) {
        ghaError(`${name} environment variable is not set.`, { title: 'Staging deploy notification: missing config' });
        process.exit(1);
    }
}

(async () => {
    const { results: users, error } = await getSlackUserConfig({
        notionApiToken: NOTION_API_TOKEN,
        notionDataSourceId: NOTION_DATA_SOURCE_ID,
        notionApiVersion: NOTION_API_VERSION,
    });
    if (error) {
        ghaError(`Error fetching Slack user config from Notion: ${error}`, {
            title: 'Staging deploy notification: Notion fetch failed',
        });
        process.exit(1);
    }

    const changes = getGitChanges(CURRENT_SHA, LAST_SUCCESSFUL_SHA, users);
    const buildChangesData = (userDisplayTypeSetting) =>
        getChangesData({
            currentSha: CURRENT_SHA,
            lastSuccessfulSha: LAST_SUCCESSFUL_SHA,
            project: AG_PROJECT,
            gitChanges: changes,
            userDisplayTypeSetting,
            users,
        });

    const webUrl = getRunUrl(AG_PROJECT, RUN_ID);
    const stagingUrl = getStagingUrl(AG_PROJECT);
    const emoji = getEmoji(AG_PROJECT);

    // Post to shared #website-status channel using author names (no slack mentions)
    // so the channel post doesn't ping contributors. Skip when no channel is configured.
    if (WEBSITE_STATUS_CHANNEL) {
        const { changesText: channelChangesText } = buildChangesData('name');
        const channelText = `:rocket: ${emoji} ${AG_PROJECT} changes were deployed to ${stagingUrl} (<${webUrl}|#${RUN_ID}>)\n${channelChangesText}`;
        await sendSlackMessage({
            authToken: SLACK_BOT_OAUTH_TOKEN,
            data: { channel: WEBSITE_STATUS_CHANNEL, text: channelText, unfurl_links: false },
        });
    } else {
        ghaWarning('WEBSITE_STATUS_CHANNEL is not set; skipping shared-channel post (opt-in DMs will still be sent).', {
            title: 'Staging deploy notification: no shared channel',
        });
    }

    // DM each opt-in user whose changes are in this deploy. The DM keeps slack
    // mentions so co-contributors in the change list are linked.
    const { uniqueUsers, changesText: dmChangesText } = buildChangesData('slack');
    const optInUsers = users.filter((u) => u.stagingNotification === true);
    const changedSlackIds = new Set(
        uniqueUsers.map((github) => users.find((u) => u.github === github)?.slackId).filter(Boolean)
    );

    const dmText = `:rocket: ${emoji} Your recent changes were deployed to ${stagingUrl} (<${webUrl}|#${RUN_ID}>)\n${dmChangesText}`;
    await Promise.all(
        optInUsers
            .filter((u) => changedSlackIds.has(u.slackId))
            .map((u) =>
                sendSlackMessage({
                    authToken: SLACK_BOT_OAUTH_TOKEN,
                    data: { channel: u.slackId, text: dmText, unfurl_links: false },
                })
            )
    );
})();
