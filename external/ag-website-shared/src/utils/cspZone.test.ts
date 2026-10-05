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
    // What the ClientRouter dispatches before it fetches the next page. Cancelling it makes the router
    // load the page as a new document instead.
    function beforePreparation(from: string, to: string) {
        const event = new Event('astro:before-preparation', { cancelable: true });
        const origin = 'https://www.ag-grid.com';
        Object.assign(event, { from: new URL(from, origin), to: new URL(to, origin) });
        document.dispatchEvent(event);
        return event;
    }

    beforeAll(() => {
        initFullReloadAcrossCspZones();
    });

    test.each`
        from                                  | to
        ${'/'}                                | ${'/campaigns/bryntum-gantt/'}
        ${'/campaigns/bryntum-gantt/'}        | ${'/'}
        ${'/javascript-data-grid/filtering/'} | ${'/charts/'}
        ${'/charts/'}                         | ${'/javascript-data-grid/filtering/'}
        ${'/charts/'}                         | ${'/studio/'}
        ${'/studio/'}                         | ${'/example/'}
    `('loads $to as a new document when navigating from $from', ({ from, to }) => {
        expect(beforePreparation(from, to).defaultPrevented).toBe(true);
    });

    test.each`
        from                           | to
        ${'/'}                         | ${'/javascript-data-grid/getting-started/'}
        ${'/charts/'}                  | ${'/charts/examples/'}
        ${'/studio/'}                  | ${'/studio/license-pricing/'}
        ${'/campaigns/bryntum-gantt/'} | ${'/campaigns/bryntum-scheduler/'}
    `('leaves $from to $to to the router', ({ from, to }) => {
        expect(beforePreparation(from, to).defaultPrevented).toBe(false);
    });
});
