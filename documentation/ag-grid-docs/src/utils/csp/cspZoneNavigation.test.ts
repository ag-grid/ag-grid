// @vitest-environment jsdom
/**
 * Guards `public/scripts/csp-zone-navigation.js`: a client-side navigation keeps the CSP of the
 * document it started from, so one that crosses between the grid, charts, studio and campaigns
 * zones has to be cancelled for the router to fall back to a full page load.
 *
 * Runs the shipped script rather than a module, as the script is what the pages load: Astro would
 * otherwise inline a bundled copy, which the site CSP refuses as it is not on the hash list.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { beforeAll, describe, expect, it } from 'vitest';

import { CAMPAIGNS_PATH_REGEXP } from '../htaccess/cspRules';

const ZONE_SCRIPT = fs.readFileSync(path.resolve(__dirname, '../../../public/scripts/csp-zone-navigation.js'), 'utf8');

const origin = 'https://www.ag-grid.com';

// What the ClientRouter does around a navigation: dispatch the event, then run the loader unless it
// was cancelled. A cancelled navigation is loaded as a new document instead. `redirectedTo` is where
// the server sends the router, which it follows without dispatching the event again.
async function isLoadedAsNewDocument(from: string, to: string, redirectedTo?: string) {
    const event = new Event('astro:before-preparation', { cancelable: true });
    Object.assign(event, {
        from: new URL(from, origin),
        to: new URL(to, origin),
        loader: async () => {
            if (redirectedTo) {
                Object.assign(event, { to: new URL(redirectedTo, origin) });
            }
        },
    });

    if (document.dispatchEvent(event)) {
        await (event as Event & { loader: () => Promise<void> }).loader();
    }
    return event.defaultPrevented;
}

describe('csp-zone-navigation script', () => {
    beforeAll(() => {
        vm.runInThisContext(ZONE_SCRIPT);
    });

    it.each`
        from                                        | to
        ${'/'}                                      | ${'/campaigns/bryntum-gantt/'}
        ${'/campaigns/bryntum-gantt/'}              | ${'/'}
        ${'/'}                                      | ${'/archive/36.0.0/campaigns/bryntum-gantt/'}
        ${'/javascript-data-grid/filtering/'}       | ${'/charts/'}
        ${'/javascript-data-grid/filtering/'}       | ${'/charts'}
        ${'/charts/'}                               | ${'/javascript-data-grid/filtering/'}
        ${'/charts/'}                               | ${'/studio/'}
        ${'/charts/'}                               | ${'/studio'}
        ${'/studio/'}                               | ${'/example/'}
        ${'/javascript-data-grid/getting-started/'} | ${'/studio/license-pricing/'}
    `('loads $to as a new document when navigating from $from', async ({ from, to }) => {
        expect(await isLoadedAsNewDocument(from, to)).toBe(true);
    });

    it.each`
        from                           | to
        ${'/'}                         | ${'/javascript-data-grid/getting-started/'}
        ${'/example/'}                 | ${'/javascript-data-grid/getting-started/'}
        ${'/charts/'}                  | ${'/charts/examples/'}
        ${'/studio/'}                  | ${'/studio/license-pricing/'}
        ${'/campaigns/bryntum-gantt/'} | ${'/campaigns/bryntum-scheduler/'}
    `('leaves $from to $to to the router', async ({ from, to }) => {
        expect(await isLoadedAsNewDocument(from, to)).toBe(false);
    });

    it('does not mistake a page that merely starts with a zone name for that zone', async () => {
        expect(await isLoadedAsNewDocument('/', '/chartsmith/')).toBe(false);
        expect(await isLoadedAsNewDocument('/', '/studios/')).toBe(false);
        expect(await isLoadedAsNewDocument('/', '/archive/36.0.0/getting-started/')).toBe(false);
    });

    it.each`
        from                                  | to                                | redirectedTo
        ${'/javascript-data-grid/filtering/'} | ${'/javascript-charts-overview/'} | ${'/charts/javascript-charts/'}
        ${'/studio/'}                         | ${'/studio/old-page/'}            | ${'/javascript-data-grid/'}
    `('loads $to as a new document when it redirects across zones', async ({ from, to, redirectedTo }) => {
        expect(await isLoadedAsNewDocument(from, to, redirectedTo)).toBe(true);
    });

    it('leaves a redirect within the same zone to the router', async () => {
        expect(await isLoadedAsNewDocument('/charts/', '/charts/old-page/', '/charts/new-page/')).toBe(false);
    });

    // Zones are matched here and in cspRules.ts separately, so check the one that is easy to forget
    it.each(['/campaigns/bryntum-gantt/', '/archive/36.0.0/campaigns/bryntum-gantt/'])(
        'puts the campaigns-scope page %s in a zone of its own',
        async (campaignPath) => {
            expect(CAMPAIGNS_PATH_REGEXP.test(campaignPath)).toBe(true);
            expect(await isLoadedAsNewDocument('/', campaignPath)).toBe(true);
        }
    );
});
