import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { vi } from 'vitest';

import { BUILD_USER_AGENT } from '../constants';
import { getConsumedSitemapRecordPath } from './consumedSitemapRecord';
import { getSitemapXml } from './getSitemapXml';

const SITEMAP_URL = 'https://www.ag-grid.com/sitemap-0.xml';
const SITEMAP_XML = '<urlset><url><loc>https://www.ag-grid.com/</loc></url></urlset>';
// A cache folder that does not exist, so every case here takes the "fetch from the live site" path
// — the one a production build hits after `--clean-cache=true`.
const MISSING_CACHE_DIR = '.astro/cache/sitemap-does-not-exist';

const logger = { info: vi.fn(), warn: vi.fn(), log: vi.fn() };

const fetchSitemap = () =>
    getSitemapXml({ cacheDir: MISSING_CACHE_DIR, sitemapUrl: SITEMAP_URL, logger, gitHash: 'test-hash' });

describe('getSitemapXml', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('identifies the build in the User-Agent', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => SITEMAP_XML });
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchSitemap()).resolves.toBe(SITEMAP_XML);

        expect(fetchMock).toHaveBeenCalledWith(SITEMAP_URL, { headers: { 'User-Agent': BUILD_USER_AGENT } });
    });

    test('throws on a failed request rather than using the error page as the sitemap', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                text: async () => '<html><h1>ERROR</h1></html>',
            })
        );

        await expect(fetchSitemap()).rejects.toThrow(`Failed to fetch sitemap ${SITEMAP_URL}: 503 Service Unavailable`);
    });

    describe('recording which sitemap was used', () => {
        let tempDir: string;

        const readRecord = async (recordDir: string) =>
            JSON.parse(await fs.readFile(getConsumedSitemapRecordPath(recordDir), 'utf8'));

        beforeEach(async () => {
            tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ag-sitemap-'));
        });

        afterEach(async () => {
            await fs.rm(tempDir, { recursive: true, force: true });
        });

        test('records a sitemap fetched from the live site', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => SITEMAP_XML }));
            const recordDir = path.join(tempDir, 'sitemap-build');

            await getSitemapXml({
                cacheDir: MISSING_CACHE_DIR,
                sitemapUrl: SITEMAP_URL,
                logger,
                gitHash: 'test-hash',
                recordDir,
            });

            expect(await readRecord(recordDir)).toEqual({
                source: 'live',
                sitemapUrl: SITEMAP_URL,
                locs: ['https://www.ag-grid.com/'],
            });
        });

        test('records a sitemap read from the cache', async () => {
            const cacheDir = path.join(tempDir, 'sitemap');
            const recordDir = path.join(tempDir, 'sitemap-build');
            await fs.mkdir(path.join(cacheDir, 'debug'), { recursive: true });
            await fs.writeFile(path.join(cacheDir, 'sitemap-0.xml'), SITEMAP_XML, 'utf8');
            await fs.writeFile(
                path.join(cacheDir, 'debug', 'meta.json'),
                JSON.stringify({ git: { hash: 'test-hash' } }),
                'utf8'
            );

            await getSitemapXml({ cacheDir, sitemapUrl: SITEMAP_URL, logger, gitHash: 'test-hash', recordDir });

            expect(await readRecord(recordDir)).toEqual({ source: 'cache', locs: ['https://www.ag-grid.com/'] });
        });

        test('records nothing when no record folder is given', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => SITEMAP_XML }));

            await fetchSitemap();

            await expect(fs.readdir(tempDir)).resolves.toEqual([]);
        });
    });
});
