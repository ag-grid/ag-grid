import { defineConfig } from 'astro/config';
import dotenvExpand from 'dotenv-expand';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import mkcert from 'vite-plugin-mkcert';
import svgr from 'vite-plugin-svgr';
import markdoc from "@astrojs/markdoc";
import agHotModuleReload from './plugins/agHotModuleReload';

const {
  NODE_ENV
} = process.env;
const DEFAULT_BASE_URL = '/';
const dotenv = {
  parsed: loadEnv(NODE_ENV, process.cwd(), '')
};
const {
  PORT,
  PUBLIC_SITE_URL,
  PUBLIC_BASE_URL = DEFAULT_BASE_URL,
  PUBLIC_HTTPS_SERVER = '1'
} = dotenvExpand.expand(dotenv).parsed;
console.log('Astro configuration', JSON.stringify({
  NODE_ENV,
  PORT,
  PUBLIC_SITE_URL,
  PUBLIC_BASE_URL
}, null, 2));


// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL,
  base: PUBLIC_BASE_URL,
  vite: {
    plugins: [mkcert(), svgr(), agHotModuleReload()],
    server: {
      https: !['0', 'false'].includes(PUBLIC_HTTPS_SERVER)
    }
  },
  integrations: [react(), markdoc()]
});
