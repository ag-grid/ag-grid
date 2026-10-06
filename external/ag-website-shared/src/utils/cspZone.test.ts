// @vitest-environment jsdom
import { getCspZone, initFullReloadAcrossCspZones } from './cspZone';

describe('getCspZone', () => {
    test.each`
        pathname                                      | zone
        ${'/'}                                        | ${'grid'}
        ${'/javascript-data-grid/getting-started/'}   | ${'grid'}
        ${'/example/'}                                | ${'grid'}
        ${'/campaigns/bryntum-gantt/'}                | ${'campaigns'}
        ${'/archive/36.0.0/campaigns/bryntum-gantt/'} | ${'campaigns'}
        ${'/charts/'}                                 | ${'charts'}
        ${'/charts/examples/'}                        | ${'charts'}
        ${'/studio/'}                                 | ${'studio'}
        ${'/studio/license-pricing/'}                 | ${'studio'}
    `('puts $pathname in the $zone zone', ({ pathname, zone }) => {
        expect(getCspZone(pathname)).toBe(zone);
    });

    test('does not mistake a page that merely starts with a zone name for that zone', () => {
        expect(getCspZone('/chartsmith/')).toBe('grid');
        expect(getCspZone('/studios/')).toBe('grid');
        expect(getCspZone('/archive/36.0.0/getting-started/')).toBe('grid');
    });
});

describe('initFullReloadAcrossCspZones', () => {
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

    beforeAll(() => {
        initFullReloadAcrossCspZones();
    });

    test.each`
        from                                  | to
        ${'/'}                                | ${'/campaigns/bryntum-gantt/'}
        ${'/campaigns/bryntum-gantt/'}        | ${'/'}
        ${'/javascript-data-grid/filtering/'} | ${'/charts/'}
        ${'/javascript-data-grid/filtering/'} | ${'/charts'}
        ${'/charts/'}                         | ${'/javascript-data-grid/filtering/'}
        ${'/charts/'}                         | ${'/studio/'}
        ${'/charts/'}                         | ${'/studio'}
        ${'/studio/'}                         | ${'/example/'}
    `('loads $to as a new document when navigating from $from', async ({ from, to }) => {
        expect(await isLoadedAsNewDocument(from, to)).toBe(true);
    });

    test.each`
        from                           | to
        ${'/'}                         | ${'/javascript-data-grid/getting-started/'}
        ${'/charts/'}                  | ${'/charts/examples/'}
        ${'/studio/'}                  | ${'/studio/license-pricing/'}
        ${'/campaigns/bryntum-gantt/'} | ${'/campaigns/bryntum-scheduler/'}
    `('leaves $from to $to to the router', async ({ from, to }) => {
        expect(await isLoadedAsNewDocument(from, to)).toBe(false);
    });

    test.each`
        from                                  | to                                | redirectedTo
        ${'/javascript-data-grid/filtering/'} | ${'/javascript-charts-overview/'} | ${'/charts/javascript-charts/'}
        ${'/studio/'}                         | ${'/studio/old-page/'}            | ${'/javascript-data-grid/'}
    `('loads $to as a new document when it redirects across zones', async ({ from, to, redirectedTo }) => {
        expect(await isLoadedAsNewDocument(from, to, redirectedTo)).toBe(true);
    });

    test('leaves a redirect within the same zone to the router', async () => {
        expect(await isLoadedAsNewDocument('/charts/', '/charts/old-page/', '/charts/new-page/')).toBe(false);
    });
});
