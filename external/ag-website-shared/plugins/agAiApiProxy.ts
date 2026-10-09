import type { Plugin } from 'vite';

import { AI_API_PROXY_PATH, AI_API_STAGING_URL } from '../../ag-shared/scripts/plugin-utils/aiApi';

const ORIGIN = 'https://www.ag-grid.com';

interface AgAiApiProxyOptions {
    devToken?: string;
    /** AI API base URL to proxy to instead of staging, e.g. a locally running AG AI API */
    target?: string;
}

/** Dev-server proxy from examples to the staging AG AI API */
export default function agAiApiProxy({ devToken, target }: AgAiApiProxyOptions = {}): Plugin {
    return {
        name: 'ag-ai-api-proxy',
        config() {
            return {
                server: {
                    proxy: {
                        // Don't touch the response: Studio streams SSE through this
                        [AI_API_PROXY_PATH]: {
                            // `||` so an empty env var falls back to staging too
                            target: target || AI_API_STAGING_URL,
                            changeOrigin: true,
                            rewrite: (path) => path.slice(AI_API_PROXY_PATH.length),
                            configure(proxy) {
                                proxy.on('proxyReq', (proxyReq) => {
                                    proxyReq.setHeader('Origin', ORIGIN);
                                    proxyReq.setHeader('Referer', `${ORIGIN}/`);
                                    proxyReq.setHeader('X-AG-Client', 'local-dev');
                                    if (devToken) {
                                        proxyReq.setHeader('Authorization', `Bearer ${devToken}`);
                                    }
                                });
                            },
                        },
                    },
                },
            };
        },
    };
}
