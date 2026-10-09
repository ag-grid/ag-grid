import type { Logger, Plugin } from 'vite';

import { AI_API_PROXY_PATH, AI_API_STAGING_URL } from '../../ag-shared/scripts/plugin-utils/aiApi';
import { createFirstTimeCheck, isSameOriginRequest, removeCorsHeaders } from '../src/utils/aiApiProxy';

const ORIGIN = 'https://www.ag-grid.com';

interface AgAiApiProxyOptions {
    devToken?: string;
    /** AI API base URL to proxy to instead of staging, e.g. a locally running AG AI API */
    target?: string;
}

/** Dev-server proxy from examples to the staging AG AI API */
export default function agAiApiProxy({ devToken, target }: AgAiApiProxyOptions = {}): Plugin {
    let logger: Logger | undefined;
    const isFirstFromOrigin = createFirstTimeCheck();

    return {
        name: 'ag-ai-api-proxy',
        configResolved(config) {
            logger = config.logger;
        },
        config() {
            return {
                server: {
                    proxy: {
                        // Only touch headers, never the body: Studio streams SSE through this
                        [AI_API_PROXY_PATH]: {
                            // `||` so an empty env var falls back to staging too
                            target: target || AI_API_STAGING_URL,
                            changeOrigin: true,
                            rewrite: (path) => path.slice(AI_API_PROXY_PATH.length),
                            configure(proxy) {
                                proxy.on('proxyReq', (proxyReq, req) => {
                                    proxyReq.setHeader('Origin', ORIGIN);
                                    proxyReq.setHeader('Referer', `${ORIGIN}/`);
                                    proxyReq.setHeader('X-AG-Client', 'local-dev');
                                    if (!devToken) {
                                        return;
                                    }

                                    if (isSameOriginRequest(req.headers)) {
                                        proxyReq.setHeader('Authorization', `Bearer ${devToken}`);
                                        return;
                                    }

                                    const origin = req.headers.origin;
                                    if (isFirstFromOrigin(origin ?? '')) {
                                        const source = origin ? `Request from ${origin}` : 'Request with no origin';
                                        logger?.warn(
                                            `[ag-ai-api-proxy] ${source} sent without AG_AI_API_DEV_TOKEN (only used for requests from this dev server)`,
                                            { timestamp: true }
                                        );
                                    }
                                });
                                // Let the dev server's CORS configuration answer external example sites
                                proxy.on('proxyRes', (proxyRes) => removeCorsHeaders(proxyRes.headers));
                            },
                        },
                    },
                },
            };
        },
    };
}
