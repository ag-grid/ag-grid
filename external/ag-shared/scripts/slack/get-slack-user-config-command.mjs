import { getSlackUserConfig } from './get-slack-user-config.mjs';

const { NOTION_DATA_SOURCE_ID, NOTION_API_TOKEN, NOTION_API_VERSION} = process.env;

if (!NOTION_API_TOKEN || !NOTION_DATA_SOURCE_ID) {
    console.error('Error: NOTION_API_TOKEN or NOTION_DATA_SOURCE_ID environment variable is not set.');
    process.exit(1);
}

(async () => {
    try {
        const { results, error } = await getSlackUserConfig({
            notionApiToken: NOTION_API_TOKEN,
            notionDataSourceId: NOTION_DATA_SOURCE_ID,
            notionApiVersion: NOTION_API_VERSION,
        });

        if (error) {
            console.error('Error fetching Slack user config:', error);
            process.exit(1);
        }

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error fetching Slack user config:', error);
        process.exit(1);
    }
})();
