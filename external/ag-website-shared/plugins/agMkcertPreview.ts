import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Matches vite-plugin-mkcert's PLUGIN_DATA_DIR and default key/cert filenames
// (see node_modules/vite-plugin-mkcert/dist/mkcert.mjs).
const MKCERT_DIR = path.join(os.homedir(), '.vite-plugin-mkcert');
const MKCERT_KEY = path.join(MKCERT_DIR, 'dev.pem');
const MKCERT_CERT = path.join(MKCERT_DIR, 'cert.pem');

interface Options {
    /** Set to false to skip HTTPS wiring entirely (mirrors PUBLIC_HTTPS_SERVER=0). */
    enabled?: boolean;
}

/**
 * Wires the mkcert-generated local certificates into `vite.preview.https` so `astro preview`
 * serves HTTPS on the same origin as `astro dev`. `astro preview` uses Vite's preview server and
 * strips user plugins from its config (see core/preview/static-preview-server.js), so
 * vite-plugin-mkcert cannot run there — we read the certs from disk and inject them via the
 * `astro:config:setup` hook's `updateConfig` instead.
 */
export default function agMkcertPreview({ enabled = true }: Options = {}): AstroIntegration {
    return {
        name: 'ag-mkcert-preview',
        hooks: {
            'astro:config:setup': ({ command, updateConfig }) => {
                if (!enabled) return;

                if (fs.existsSync(MKCERT_KEY) && fs.existsSync(MKCERT_CERT)) {
                    updateConfig({
                        vite: {
                            preview: {
                                https: {
                                    key: fs.readFileSync(MKCERT_KEY),
                                    cert: fs.readFileSync(MKCERT_CERT),
                                },
                            },
                        },
                    });
                    return;
                }

                // dev regenerates certs via vite-plugin-mkcert on first run; build/sync don't
                // serve HTTPS. Only preview is stuck — fail fast there with a clear message.
                if (command === 'preview') {
                    throw new Error(
                        `[ag-mkcert-preview] vite-plugin-mkcert certificates not found at ${MKCERT_DIR}. ` +
                            `Run 'nx dev' once to generate them, then re-run preview.`
                    );
                }
            },
        },
    };
}
