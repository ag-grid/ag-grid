import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import dotenvExpand from 'dotenv-expand';
import { loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import svgr from 'vite-plugin-svgr';

import agHotModuleReload from './plugins/agHotModuleReload';

const { NODE_ENV } = process.env;
const DEFAULT_BASE_URL = '/';
const dotenv = {
    parsed: loadEnv(NODE_ENV, process.cwd(), ''),
};
const {
    PORT,
    PUBLIC_SITE_URL,
    PUBLIC_BASE_URL = DEFAULT_BASE_URL,
    USE_PACKAGES,
    PUBLIC_HTTPS_SERVER = '1',
    ENABLE_GENERATE_DEBUG_PAGES = '1',
    SHOW_DEBUG_LOGS,

    // Speed up builds by only building comma separated pages
    QUICK_BUILD_PAGES,
} = dotenvExpand.expand(dotenv).parsed;
console.log(
    'Astro configuration',
    JSON.stringify(
        {
            NODE_ENV,
            PORT,
            PUBLIC_SITE_URL,
            PUBLIC_BASE_URL,
            USE_PACKAGES,
            ENABLE_GENERATE_DEBUG_PAGES,
            SHOW_DEBUG_LOGS,
            QUICK_BUILD_PAGES,
        },
        null,
        2
    )
);

// https://astro.build/config
export default defineConfig({
    site: PUBLIC_SITE_URL,
    base: PUBLIC_BASE_URL,
    vite: {
        plugins: [mkcert(), svgr(), agHotModuleReload()],
        server: {
            https: !['0', 'false'].includes(PUBLIC_HTTPS_SERVER),
        },
    },
    integrations: [react(), markdoc()],
});
