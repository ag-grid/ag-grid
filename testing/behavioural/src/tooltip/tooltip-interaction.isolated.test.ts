import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { _isIOSUserAgent } from 'ag-stack';
import { TestGridsManager, getVisibleTooltips } from 'ag-test-utils';

import {
    AllCommunityModule,
    RenderApiModule,
    TooltipModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridOptions, ITooltipComp, ITooltipParams, Module, TooltipCallbackParams } from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

vi.mock(import('ag-stack'), async (importOriginal) => {
    const original = await importOriginal();
    return { ...original, _isIOSUserAgent: vi.fn(original._isIOSUserAgent) };
});

// Kept in its own file because the interactive tooltip lock and timing transitions are shared by
// tooltip instances within a grid.
describe('Tooltip interaction', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const visibleTooltip = () => getTooltips().find((t) => !t.classList.contains('ag-tooltip-hiding'));

    class InteractiveTooltip implements ITooltipComp {
        private readonly eGui = document.createElement('div');

        public init(params: ITooltipParams): void {
            const input = document.createElement('input');
            const button = document.createElement('button');
            button.textContent = String(params.value);
            this.eGui.append(input, button);
        }

        public getGui(): HTMLElement {
            return this.eGui;
        }
    }

    test('AG-17885 re-hovering a cell whose tooltip is fading re-opens it with tooltipInteraction', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' }, // empty cell, so leaving it has no tooltip to interact with
                { field: 'age', tooltip: () => 'Age tooltip' },
            ],
            rowData: [{ athlete: '', age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: 200,
            tooltipHideDelay: 2000,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-fade', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const athleteCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete')));
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        vi.useFakeTimers();
        try {
            const user = userEvent.setup({ delay: null });
            // show the AGE tooltip
            await user.hover(ageCell);
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleTooltip()?.textContent).toContain('Age tooltip');

            // leave AGE: after the 100ms interactive lock, the tooltip starts fading out (1s fade window)
            await user.unhover(ageCell);
            await vi.advanceTimersByTimeAsync(100);
            expect(getTooltips().some((t) => t.classList.contains('ag-tooltip-hiding'))).toBe(true);
            expect(visibleTooltip()).toBeUndefined();

            // quick detour onto the empty ATHLETE cell, dwelling just under the 100ms interactive lock window
            await user.hover(athleteCell);
            await vi.advanceTimersByTimeAsync(99);
            await user.unhover(athleteCell);

            // move straight back to AGE while its tooltip is still fading: it re-opens within the show delay
            await user.hover(ageCell);
            await vi.advanceTimersByTimeAsync(200);
            expect(visibleTooltip()?.textContent).toContain('Age tooltip');
        } finally {
            gridMgr.reset();
            vi.useRealTimers();
        }
    });

    test('AG-17885 moving cursor cell -> tooltip -> cell keeps the interactive tooltip open', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'age', tooltip: () => 'Age tooltip' }],
            rowData: [{ age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: 200,
            tooltipHideDelay: 5000,
            tooltipSwitchShowDelay: 200,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-keep-open', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        vi.useFakeTimers();
        try {
            const user = userEvent.setup({ delay: null });
            // show the AGE tooltip
            await user.hover(ageCell);
            await vi.advanceTimersByTimeAsync(200);
            const tooltip = visibleTooltip()!;
            expect(tooltip?.textContent).toContain('Age tooltip');

            // travel cell -> tooltip -> cell within the interactive lock window; the tooltip must stay open
            await user.unhover(ageCell);
            await user.hover(tooltip);
            await user.unhover(tooltip);
            await user.hover(ageCell);

            // past the 100ms INTERACTIVE_HIDE_DELAY, where a spurious hide would already have landed
            await vi.advanceTimersByTimeAsync(150);
            expect(visibleTooltip()?.textContent).toContain('Age tooltip');
        } finally {
            gridMgr.reset();
            vi.useRealTimers();
        }
    });

    test('AG-17885 leaving a cell with no tooltip showing does not lock the next tooltip', async () => {
        // The interactive lock (100ms INTERACTIVE_HIDE_DELAY) exists so the cursor can travel from a
        // cell onto its own tooltip. Leaving a cell that has nothing showing must NOT take that lock —
        // otherwise the next cell's tooltip is needlessly delayed by 100ms while it waits it out.
        const SHOW_DELAY = 200;

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' }, // empty cell, so leaving it has no tooltip to interact with
                { field: 'age', tooltip: () => 'Age tooltip' },
            ],
            rowData: [{ athlete: '', age: 19 }],
            tooltipInteraction: true,
            tooltipShowDelay: SHOW_DELAY,
            tooltipHideDelay: 2000,
        };

        const api = await gridMgr.createGridAndWait('myGrid-tooltip-interaction-no-lock', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const athleteCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete')));
        const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

        vi.useFakeTimers();
        try {
            const user = userEvent.setup({ delay: null });
            // hover then leave the empty ATHLETE cell — nothing was showing, so no lock should be taken
            await user.hover(athleteCell);
            await user.unhover(athleteCell);

            // move straight to AGE: shown after SHOW_DELAY, where a spurious lock would add INTERACTIVE_HIDE_DELAY
            await user.hover(ageCell);
            await vi.advanceTimersByTimeAsync(SHOW_DELAY);
            expect(visibleTooltip()?.textContent).toContain('Age tooltip');
        } finally {
            gridMgr.reset();
            vi.useRealTimers();
        }
    });

    test.each([true, () => true])(
        'supports keyboard entry and dismissal with tooltipInteraction: %s',
        async (interaction) => {
            const api = await gridMgr.createGridAndWait('tooltip-interaction-keyboard', {
                columnDefs: [{ field: 'age', tooltip: true, tooltipComponent: InteractiveTooltip }],
                rowData: [{ age: 19 }],
                tooltipInteraction: interaction,
                tooltipTrigger: 'focus',
                tooltipShowDelay: 0,
            });
            const gridDiv = getGridElement(api)! as HTMLElement;
            const ageCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'age')));

            ageCell.focus();
            const tooltip = await waitFor(() => {
                const current = visibleTooltip();
                expect(current).toBeDefined();
                return current!;
            });
            const input = tooltip.querySelector('input')!;
            const button = tooltip.querySelector('button')!;
            expect(tooltip).toHaveAttribute('role', 'dialog');
            expect(ageCell).toHaveAccessibleDescription('19');

            await userEvent.keyboard('{Tab}');
            expect(input).toHaveFocus();

            await userEvent.keyboard('{Tab}');
            expect(button).toHaveFocus();
            expect(visibleTooltip()).toBe(tooltip);

            await userEvent.keyboard('{Escape}');
            await waitFor(() => expect(visibleTooltip()).toBeUndefined());
            expect(ageCell).toHaveFocus();
            expect(ageCell).toHaveAccessibleDescription('19');
            ageCell.blur();
            expect(ageCell).not.toHaveAttribute('aria-describedby');
        }
    );

    test.each([
        { enabled: true, callback: false },
        { enabled: false, callback: false },
        { enabled: true, callback: true },
        { enabled: false, callback: true },
    ])(
        'respects interaction=$enabled (callback: $callback) when clicking before the hover delay expires',
        async ({ enabled, callback }) => {
            const tooltip = vi.fn(() => 'Age tooltip');
            const api = await gridMgr.createGridAndWait('tooltip-interaction-pending', {
                columnDefs: [{ field: 'age', tooltip }],
                rowData: [{ age: 19 }],
                tooltipShowDelay: 20,
                tooltipInteraction: callback ? () => enabled : enabled,
            });
            const grid = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(grid, agTestIdFor.cell('0', 'age')));

            vi.useFakeTimers();
            try {
                cell.dispatchEvent(new MouseEvent('mouseenter'));
                cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                expect(tooltip).toHaveBeenCalledTimes(callback ? 1 : 0);
                await vi.advanceTimersByTimeAsync(20);
                expect(!!visibleTooltip()).toBe(enabled);
            } finally {
                gridMgr.reset();
                vi.useRealTimers();
            }
        }
    );

    test.each([undefined, null, ''])('does not resolve interaction for empty tooltip content: %s', async (value) => {
        const interaction = vi.fn(() => true);
        const api = await gridMgr.createGridAndWait('tooltip-interaction-empty', {
            columnDefs: [{ field: 'age', tooltip: () => value }],
            rowData: [{ age: 19 }],
            tooltipShowDelay: 20,
            tooltipInteraction: interaction,
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;

        vi.useFakeTimers();
        try {
            cell.dispatchEvent(new MouseEvent('mouseenter'));
            cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await vi.advanceTimersByTimeAsync(20);
            expect(interaction).not.toHaveBeenCalled();
            expect(visibleTooltip()).toBeUndefined();
        } finally {
            gridMgr.reset();
            vi.useRealTimers();
        }
    });

    test('does not show a source tooltip when its getter opens a context menu', async () => {
        const onTooltipShow = vi.fn();
        const api = await gridMgr.createGridAndWait(
            'tooltip-content-opens-menu',
            {
                columnDefs: [
                    {
                        field: 'age',
                        tooltip: ({ api }) => {
                            api.showContextMenu();
                            return 'Age tooltip';
                        },
                    },
                ],
                rowData: [{ age: 19 }],
                tooltipShowDelay: 20,
                getContextMenuItems: () => [{ name: 'Action', tooltip: 'Menu hint' }],
                onTooltipShow,
            },
            { modules: [ContextMenuModule] }
        );
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;

        vi.useFakeTimers();
        try {
            cell.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(20);
            const menuItem = document.querySelector<HTMLElement>('[role="menuitem"]')!;
            expect(menuItem).toHaveTextContent('Action');
            expect(visibleTooltip()).toBeUndefined();
            expect(onTooltipShow).not.toHaveBeenCalled();

            menuItem.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(20);
            expect(visibleTooltip()).toHaveTextContent('Menu hint');
        } finally {
            gridMgr.reset();
            vi.useRealTimers();
        }
    });

    test('resolves interaction per source and uses current values when a tooltip reopens', async () => {
        const interaction = vi.fn(
            (params: TooltipCallbackParams) =>
                params.location === 'cell' && params.column === params.api.getColumn('age') && params.value >= 18
        );
        const data = { age: 19, plain: 7 };
        const context = { test: 'interaction' };
        const api = await gridMgr.createGridAndWait('tooltip-interaction-callback', {
            columnDefs: [{ field: 'plain' }, { field: 'age', headerName: 'Age', headerTooltip: 'Age explanation' }],
            defaultColDef: {
                cellDataType: false,
                tooltip: ({ value }) => `Details: ${value}`,
                valueFormatter: ({ value }) => `Formatted: ${value}`,
                tooltipComponent: InteractiveTooltip,
            },
            rowData: [data],
            context,
            tooltipTrigger: 'focus',
            tooltipShowDelay: 0,
            tooltipInteraction: interaction,
        });
        const grid = getGridElement(api)! as HTMLElement;
        const plainCell = await waitFor(() => getByTestId(grid, agTestIdFor.cell('0', 'plain')));
        const ageCell = await waitFor(() => getByTestId(grid, agTestIdFor.cell('0', 'age')));
        const header = grid.querySelector<HTMLElement>('.ag-header-cell[col-id="age"]')!;

        for (const [source, role, value] of [
            [plainCell, 'tooltip', 7],
            [ageCell, 'dialog', 19],
            [header, 'tooltip', 'Age'],
        ] as const) {
            interaction.mockClear();
            source.focus();
            await waitFor(() => expect(visibleTooltip()).toHaveAttribute('role', role));
            expect(interaction).toHaveBeenCalledTimes(1);
            expect(interaction).toHaveBeenCalledWith(expect.objectContaining({ api, context, value }));
            if (source === ageCell) {
                expect(interaction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data,
                        node: api.getDisplayedRowAtIndex(0),
                        valueFormatted: 'Formatted: 19',
                    })
                );
            }
            await userEvent.keyboard('{Escape}');
            await waitFor(() => expect(visibleTooltip()).toBeUndefined());
            source.blur();
        }

        api.getDisplayedRowAtIndex(0)!.setDataValue('age', 17);
        ageCell.focus();
        await waitFor(() => expect(visibleTooltip()).toHaveAttribute('role', 'tooltip'));
        expect(interaction).toHaveBeenLastCalledWith(expect.objectContaining({ value: 17 }));
    });
});

describe('Tooltip interaction on iOS', () => {
    const gridMgr = new TestGridsManager({ modules: [AllCommunityModule] });

    beforeEach(() => {
        vi.mocked(_isIOSUserAgent).mockReturnValue(true);
    });

    afterEach(() => {
        gridMgr.reset();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.mocked(_isIOSUserAgent).mockReset();
    });

    function startCellTouch(cell: HTMLElement): Touch {
        const touch = new Touch({ identifier: 1, target: cell, clientX: 5, clientY: 5 });
        cell.dispatchEvent(
            new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [touch],
                targetTouches: [touch],
                changedTouches: [touch],
            })
        );
        return touch;
    }

    async function longPressCell(cell: HTMLElement): Promise<TouchEvent> {
        const touch = startCellTouch(cell);
        await vi.advanceTimersByTimeAsync(600);
        const touchEnd = new TouchEvent('touchend', { bubbles: true, cancelable: true, changedTouches: [touch] });
        cell.dispatchEvent(touchEnd);
        return touchEnd;
    }

    test.each(['touchend', 'touchmove', 'touchcancel'] as const)(
        'does not deliver a long-press callback after an early %s',
        async (type) => {
            const onCellContextMenu = vi.fn();
            const api = await gridMgr.createGridAndWait('cancelled-cell-long-press', {
                columnDefs: [{ field: 'athlete', tooltip: true }],
                rowData: [{ athlete: 'Athlete' }],
                suppressContextMenu: true,
                onCellContextMenu,
            });
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
            vi.useFakeTimers();
            startCellTouch(cell);
            const touch = new Touch({ identifier: 1, target: cell, clientX: 20, clientY: 20 });
            cell.dispatchEvent(
                new TouchEvent(type, {
                    bubbles: true,
                    touches: type === 'touchmove' ? [touch] : [],
                    changedTouches: [touch],
                })
            );
            await vi.advanceTimersByTimeAsync(600);

            expect(onCellContextMenu).not.toHaveBeenCalled();
            expect(getVisibleTooltips()).toHaveLength(0);
        }
    );

    describe.each([false, true])('cell tooltips: %s', (tooltip) => {
        test.each([
            { enterprise: false, suppressContextMenu: false },
            { enterprise: false, suppressContextMenu: true },
            { enterprise: true, suppressContextMenu: true },
            { enterprise: true, suppressContextMenu: false },
        ])(
            'respects context menu availability (enterprise: $enterprise, suppressed: $suppressContextMenu)',
            async ({ enterprise, suppressContextMenu }) => {
                const onCellContextMenu = vi.fn().mockName('grid callback');
                const onColumnCellContextMenu = vi.fn().mockName('column callback');
                const contextMenuListener = vi.fn().mockName('API listener');
                const api = await gridMgr.createGridAndWait(
                    'cell-tooltip',
                    {
                        columnDefs: [{ field: 'athlete', tooltip, onCellContextMenu: onColumnCellContextMenu }],
                        rowData: [{ athlete: 'Athlete' }],
                        suppressContextMenu,
                        onCellContextMenu,
                        tooltipShowDelay: 2000,
                        ...(enterprise ? { getContextMenuItems: () => [{ name: 'Cell action' }] } : {}),
                    },
                    { modules: enterprise ? [ContextMenuModule] : [] }
                );

                api.addEventListener('cellContextMenu', contextMenuListener);
                const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
                vi.useFakeTimers();
                const touchEnd = await longPressCell(cell);
                expect(touchEnd.defaultPrevented).toBe(true);

                for (const listener of [onCellContextMenu, onColumnCellContextMenu, contextMenuListener]) {
                    expect(listener).toHaveBeenCalledTimes(1);
                    expect(listener).toHaveBeenCalledWith(
                        expect.objectContaining({
                            type: 'cellContextMenu',
                            value: 'Athlete',
                            event: expect.any(TouchEvent),
                        })
                    );
                }

                if (enterprise && !suppressContextMenu) {
                    expect(document.querySelector('.ag-menu')).toHaveTextContent('Cell action');
                    expect(getVisibleTooltips()).toHaveLength(0);

                    api.hidePopupMenu();
                    api.setGridOption('suppressContextMenu', true);
                    await longPressCell(cell);
                    for (const listener of [onCellContextMenu, onColumnCellContextMenu, contextMenuListener]) {
                        expect(listener).toHaveBeenCalledTimes(2);
                    }
                }

                expect(document.querySelector('.ag-menu')).toBeNull();
                expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(tooltip ? ['Athlete'] : []);
            }
        );
    });
});
