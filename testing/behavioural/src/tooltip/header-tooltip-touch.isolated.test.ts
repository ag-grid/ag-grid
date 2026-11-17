import '@testing-library/jest-dom/vitest';
import { _isIOSUserAgent } from 'ag-stack';
import { TestGridsManager, getVisibleTooltips, polyfillOffsetParent } from 'ag-test-utils';

import { AllCommunityModule, getGridElement } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

vi.mock(import('ag-stack'), async (importOriginal) => ({
    ...(await importOriginal()),
    _isIOSUserAgent: vi.fn(() => false),
}));

describe.each([false, true])('header tooltip long press (iOS: %s)', (isIOS) => {
    const gridMgr = new TestGridsManager({ modules: [AllCommunityModule] });
    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        vi.mocked(_isIOSUserAgent).mockReturnValue(isIOS);
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    async function longPressHeader(grid: Element): Promise<void> {
        const header = grid.querySelector<HTMLElement>('.ag-header-cell-text')!;
        const touch = new Touch({ identifier: 1, target: header, clientX: 5, clientY: 5 });
        vi.useFakeTimers();
        header.dispatchEvent(
            new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [touch],
                targetTouches: [touch],
                changedTouches: [touch],
            })
        );
        await vi.advanceTimersByTimeAsync(600);
        header.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [touch] }));
    }

    test.each([false, true])(
        'shows the tooltip without opening a Community filter popup (filter: %s)',
        async (filter) => {
            const api = await gridMgr.createGridAndWait('community-header-tooltip', {
                columnDefs: [
                    { field: 'athlete', tooltip: true, headerTooltip: 'adfva', minWidth: 150, filter },
                    { field: 'age', maxWidth: 90 },
                    { field: 'country', minWidth: 150 },
                ],
                rowData: [{ athlete: 'Athlete', age: 25, country: 'Ireland' }],
                tooltipShowDelay: 2000,
            });

            await longPressHeader(getGridElement(api)!);

            expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['adfva']);
            expect(document.querySelector('.ag-menu')).toBeNull();
            expect(api.getColumn('athlete')?.getSort()).toBeNull();
        }
    );

    test.each([false, true])(
        'respects Enterprise header menu availability (suppressed: %s)',
        async (suppressHeaderContextMenu) => {
            const api = await gridMgr.createGridAndWait(
                'enterprise-header-tooltip',
                {
                    columnDefs: [{ field: 'athlete', headerTooltip: 'adfva', suppressHeaderContextMenu }],
                    rowData: [{ athlete: 'Athlete' }],
                    tooltipShowDelay: 2000,
                },
                { modules: [ColumnMenuModule] }
            );

            await longPressHeader(getGridElement(api)!);

            if (suppressHeaderContextMenu) {
                expect(document.querySelector('.ag-menu')).toBeNull();
                expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['adfva']);
            } else {
                expect(document.querySelector('.ag-menu')).not.toBeNull();
                expect(getVisibleTooltips()).toHaveLength(0);
            }
        }
    );

    test('preserves long press for an enabled legacy filter menu', async () => {
        const api = await gridMgr.createGridAndWait('legacy-header-tooltip', {
            columnDefs: [{ field: 'athlete', headerTooltip: 'adfva', filter: true }],
            rowData: [{ athlete: 'Athlete' }],
            columnMenu: 'legacy',
        });

        await longPressHeader(getGridElement(api)!);

        expect(document.querySelector('.ag-menu .ag-filter')).not.toBeNull();
        expect(getVisibleTooltips()).toHaveLength(0);
    });
});
