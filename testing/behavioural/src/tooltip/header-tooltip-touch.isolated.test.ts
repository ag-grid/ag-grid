import '@testing-library/jest-dom/vitest';
import { _isIOSUserAgent } from 'ag-stack';
import { TestGridsManager, getVisibleTooltips } from 'ag-test-utils';

import { AllCommunityModule, getGridElement } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

vi.mock(import('ag-stack'), async (importOriginal) => ({
    ...(await importOriginal()),
    _isIOSUserAgent: vi.fn(() => false),
}));

describe.each([false, true])('header tooltip long press (iOS: %s)', (isIOS) => {
    const gridMgr = new TestGridsManager({ modules: [AllCommunityModule] });

    beforeEach(() => {
        vi.mocked(_isIOSUserAgent).mockReturnValue(isIOS);
    });

    afterEach(() => {
        gridMgr.reset();
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

    test.each([
        { target: 'cell', nativeFirst: true },
        { target: 'header', nativeFirst: true },
        { target: 'cell', nativeFirst: false },
        { target: 'header', nativeFirst: false },
        { target: 'legacy header', nativeFirst: true },
        { target: 'legacy header', nativeFirst: false },
    ])('opens one menu on a $target (native event first: $nativeFirst)', async ({ target, nativeFirst }) => {
        const menuOpened = vi.fn();
        const api = await gridMgr.createGridAndWait(
            'native-touch-menu',
            {
                columnDefs: [{ field: 'value', tooltip: true, headerTooltip: true, filter: true }],
                rowData: [{ value: 'First' }],
                columnMenu: target === 'legacy header' ? 'legacy' : 'new',
                tooltipShowDelay: 0,
                getContextMenuItems: () => [{ name: 'Action' }],
                onContextMenuVisibleChanged: (event) => {
                    if (event.visible) {
                        menuOpened();
                    }
                },
                onColumnMenuVisibleChanged: (event) => {
                    if (event.visible) {
                        menuOpened();
                    }
                },
            },
            { modules: [ColumnMenuModule, ContextMenuModule] }
        );
        const element = getGridElement(api)!.querySelector<HTMLElement>(
            target === 'cell' ? '.ag-cell' : '.ag-header-cell-text'
        )!;
        const touch = new Touch({ identifier: 1, target: element, clientX: 5, clientY: 5 });
        vi.useFakeTimers();
        element.dispatchEvent(
            new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [touch],
                changedTouches: [touch],
            })
        );
        if (!nativeFirst) {
            await vi.advanceTimersByTimeAsync(600);
        }
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        await vi.advanceTimersByTimeAsync(600);
        expect(document.querySelectorAll('.ag-menu')).toHaveLength(1);
        expect(menuOpened).toHaveBeenCalledTimes(1);
        expect(getVisibleTooltips()).toHaveLength(0);
        const end = new TouchEvent('touchend', { bubbles: true, cancelable: true, changedTouches: [touch] });
        element.dispatchEvent(end);
        expect(end.defaultPrevented).toBe(true);
    });
});
