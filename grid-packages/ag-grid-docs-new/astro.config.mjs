import { defineConfig } from 'astro/config';
import dotenvExpand from 'dotenv-expand';
import { loadEnv } from 'vite';

import react from '@astrojs/react';
import svgr from 'vite-plugin-svgr';

const { NODE_ENV } = process.env;

const DEFAULT_BASE_URL = '/';
const dotenv = {
    parsed: loadEnv(NODE_ENV, process.cwd(), ''),
};
const { PORT, PUBLIC_SITE_URL, PUBLIC_BASE_URL = DEFAULT_BASE_URL } = dotenvExpand.expand(dotenv).parsed;

console.log('Astro configuration', JSON.stringify({ NODE_ENV, PORT, PUBLIC_SITE_URL, PUBLIC_BASE_URL }, null, 2));

// https://astro.build/config
export default defineConfig({
    site: PUBLIC_SITE_URL,
    base: PUBLIC_BASE_URL,
    vite: {
        plugins: [svgr()],
    },
    integrations: [react()],
});
