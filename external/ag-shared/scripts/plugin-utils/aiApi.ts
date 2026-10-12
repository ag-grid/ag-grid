export const AI_API_URL = 'https://ai-api.ag-grid.com/api/openai/v1';
export const AI_API_STAGING_URL = 'https://ai-api-staging.ag-grid.com/api/openai/v1';
export const AI_API_PROXY_PATH = '/ai-api-proxy';

/** URL baked into examples: the dev-server proxy when generating for dev, production otherwise. */
export function getAiApiExampleUrl(isDev: boolean): string {
    return isDev ? AI_API_PROXY_PATH : AI_API_URL;
}
