import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    TestGridsManager,
    asyncSetTimeout,
    getVisibleTooltips,
    openMenuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import { ClientSideRowModelModule, TooltipModule, getGridElement } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

describe('menu tooltip triggers', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnMenuModule, ContextMenuModule, TooltipModule],
    });
    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    async function openContextMenu(
        tooltipTrigger: 'focus' | 'hover' | 'hoverOrFocus',
        initialTooltip?: string,
        {
            interaction = 'mouse',
            asyncItems = false,
        }: { interaction?: 'mouse' | 'keyboard' | 'api'; asyncItems?: boolean } = {}
    ): Promise<HTMLElement> {
        const api = await gridMgr.createGridAndWait('menu-tooltip-trigger', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'Cell' }],
            tooltipTrigger,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            getContextMenuItems: () => {
                const items = [
                    // Opening the menu focuses this item; keep that separate from hover activation.
                    { name: 'Initial', tooltip: initialTooltip },
                    { name: 'First', tooltip: 'First tooltip' },
                    {
                        name: 'Second',
                        tooltip: 'Second tooltip',
                        subMenu: [{ name: 'Child', tooltip: 'Child tooltip' }],
                    },
                ];
                if (!asyncItems) {
                    return items;
                }
                // Change input mode before resolution to verify the opening interaction is retained.
                document.body.dispatchEvent(
                    interaction === 'keyboard'
                        ? new MouseEvent('mousedown', { bubbles: true })
                        : new KeyboardEvent('keydown', { bubbles: true, key: 'Shift' })
                );
                return Promise.resolve(items);
            },
        });
        restoreOffsetParent = polyfillOffsetParent();
        const cell = document.querySelector<HTMLElement>('.ag-cell')!;
        if (interaction === 'api') {
            api.showContextMenu();
        } else if (interaction === 'mouse') {
            await userEvent.pointer({ keys: '[MouseRight]', target: cell });
        } else {
            cell.focus();
            await userEvent.keyboard('{Shift>}{F10}{/Shift}');
            // happy-dom does not generate the browser's contextmenu event from a keyboard gesture.
            cell.dispatchEvent(
                new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    clientX: 10,
                    clientY: 10,
                })
            );
        }
        return (await openMenuOption('First')).closest<HTMLElement>('.ag-menu-option')!;
    }

    async function expectTooltip(text: string): Promise<void> {
        await waitFor(() => expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual([text]));
    }

    test.each(['focus', 'hoverOrFocus'] as const)(
        'restores the source tooltip after a context menu closes with trigger %s',
        async (tooltipTrigger) => {
            const api = await gridMgr.createGridAndWait('menu-tooltip-restore', {
                columnDefs: [{ field: 'value', tooltip: 'Cell hint' }],
                rowData: [{ value: 'Cell' }],
                tooltipTrigger,
                tooltipShowDelay: 0,
                getContextMenuItems: () => [{ name: 'Action' }],
            });
            restoreOffsetParent = polyfillOffsetParent();
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
            cell.focus();
            await expectTooltip('Cell hint');

            await userEvent.pointer({ keys: '[MouseRight]', target: cell });
            const item = await openMenuOption('Action');
            expect(getVisibleTooltips()).toHaveLength(0);
            await userEvent.click(item);

            expect(cell).toHaveFocus();
            await expectTooltip('Cell hint');
        }
    );

    test.each([false, true])('context menus dismiss fading tooltips (source already left: %s)', async (sourceLeft) => {
        const api = await gridMgr.createGridAndWait('menu-tooltip-no-fade', {
            columnDefs: [{ field: 'value', tooltip: 'Cell hint' }],
            rowData: [{ value: 'Cell' }, { value: 'Other cell' }],
            tooltipShowDelay: 0,
            getContextMenuItems: () => [{ name: 'Action' }],
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
        cell.dispatchEvent(new MouseEvent('mouseenter'));
        await expectTooltip('Cell hint');
        const tooltip = getVisibleTooltips()[0];

        vi.useFakeTimers();
        let menuSource = cell;
        if (sourceLeft) {
            cell.dispatchEvent(new MouseEvent('mouseleave'));
            await vi.advanceTimersByTimeAsync(100);
            menuSource = getGridElement(api)!.querySelector<HTMLElement>('.ag-row[row-index="1"] .ag-cell')!;
        } else {
            cell.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
        }
        expect(tooltip).toHaveClass('ag-tooltip-hiding');
        menuSource.dispatchEvent(new MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
        expect(document.querySelector('[role="menu"]')).toBeVisible();
        expect(tooltip).not.toBeVisible();
    });

    test.each([false, true])(
        'mouse opening suppresses the initial focus tooltip (async items: %s)',
        async (asyncItems) => {
            await openContextMenu('focus', 'Initial tooltip', { asyncItems });
            const initial = (await openMenuOption('Initial')).closest<HTMLElement>('.ag-menu-option')!;
            expect(initial).toHaveFocus();
            await asyncSetTimeout(0);
            expect(getVisibleTooltips()).toHaveLength(0);

            await userEvent.hover(initial);
            await asyncSetTimeout(0);
            expect(getVisibleTooltips()).toHaveLength(0);

            await userEvent.keyboard('{ArrowDown}');
            await expectTooltip('First tooltip');
            await userEvent.keyboard('{ArrowUp}');
            await expectTooltip('Initial tooltip');
        }
    );

    test.each([false, true])(
        'keyboard opening shows the initial focus tooltip (async items: %s)',
        async (asyncItems) => {
            await openContextMenu('focus', 'Initial tooltip', { interaction: 'keyboard', asyncItems });
            await expectTooltip('Initial tooltip');
        }
    );

    test('API opening preserves the initial focus tooltip', async () => {
        await openContextMenu('focus', 'Initial tooltip', { interaction: 'api' });
        await expectTooltip('Initial tooltip');
    });

    test.each(['context', 'column', 'legacy column'])(
        'destroying a grid with an open %s menu tooltip releases Escape handling',
        async (menu) => {
            const getMenuItems = () => [{ name: 'Initial', tooltip: 'Initial tooltip' }];
            const api = await gridMgr.createGridAndWait('menu-tooltip-destroy', {
                columnDefs: [{ field: 'value', menuTabs: ['generalMenuTab'] }],
                rowData: [{ value: 'Cell' }],
                columnMenu: menu === 'legacy column' ? 'legacy' : 'new',
                tooltipTrigger: 'focus',
                getContextMenuItems: getMenuItems,
                getColumnMenuItems: getMenuItems,
            });
            restoreOffsetParent = polyfillOffsetParent();
            if (menu === 'context') {
                api.showContextMenu();
            } else {
                api.showColumnMenu('value');
            }
            await expectTooltip('Initial tooltip');
            gridMgr.reset();

            const button = document.createElement('button');
            const onKeyDown = vi.fn();
            button.addEventListener('keydown', onKeyDown);
            document.body.appendChild(button);
            try {
                button.focus();
                await userEvent.keyboard('{Escape}');
                expect(onKeyDown).toHaveBeenCalledTimes(1);
                expect(button).toHaveFocus();
            } finally {
                button.remove();
            }
        }
    );

    test('combined mode describes the focused item and Escape dismisses only its tooltip', async () => {
        const first = await openContextMenu('hoverOrFocus');
        await userEvent.keyboard('{ArrowDown}');
        expect(first).toHaveFocus();
        expect(first).toHaveAccessibleDescription('First tooltip');
        await expectTooltip('First tooltip');

        await userEvent.keyboard('{Escape}');
        expect(getVisibleTooltips()).toHaveLength(0);
        expect(first).toHaveFocus();
        expect(first).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        expect(first).not.toBeInTheDocument();
    });

    test('focus trigger ignores hover activation but shows tooltips during keyboard navigation', async () => {
        const first = await openContextMenu('focus');

        await userEvent.hover(first);
        expect(first).toHaveFocus();
        // Flush the zero-delay tooltip show scheduled by focusin before checking absence.
        await asyncSetTimeout(0);
        expect(getVisibleTooltips()).toHaveLength(0);

        await userEvent.keyboard('{ArrowDown}');
        await expectTooltip('Second tooltip');

        await userEvent.keyboard('{ArrowUp}');
        await expectTooltip('First tooltip');
    });

    test('focus trigger shows tooltips when entering and leaving a submenu with the keyboard', async () => {
        const first = await openContextMenu('focus');
        await userEvent.hover(first);
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await expectTooltip('Child tooltip');

        await userEvent.keyboard('{ArrowLeft}');
        await expectTooltip('Second tooltip');
    });

    test('focus trigger still shows tooltips on direct focus after hover activation', async () => {
        const first = await openContextMenu('focus');
        await userEvent.hover(first);
        first.blur();
        first.focus();
        await expectTooltip('First tooltip');
    });

    test('focus trigger ignores delayed hover activation while another submenu is open', async () => {
        const first = await openContextMenu('focus');
        await userEvent.hover(first);
        await userEvent.keyboard('{ArrowDown}{ArrowRight}');
        await expectTooltip('Child tooltip');

        first.dispatchEvent(new MouseEvent('mouseenter'));
        await waitFor(() => expect(first).toHaveFocus());
        await asyncSetTimeout(0);
        expect(getVisibleTooltips()).toHaveLength(0);

        await userEvent.keyboard('{ArrowDown}');
        await expectTooltip('Second tooltip');
    });

    test.each(['focus', 'hover', 'hoverOrFocus'] as const)(
        '%s trigger keeps focus on the hovered sibling after leaving a keyboard-focused submenu',
        async (tooltipTrigger) => {
            const user = userEvent.setup();
            await gridMgr.createGridAndWait('menu-tooltip-submenu-return', {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'Cell' }],
                tooltipTrigger,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                getContextMenuItems: () => [
                    { name: 'Log Cell', tooltip: 'Log' },
                    { name: 'Always Disabled', disabled: true, tooltip: 'Very long tooltip' },
                    {
                        name: 'Country',
                        tooltip: 'country',
                        subMenu: [
                            { name: 'Ireland', tooltip: 'ireland' },
                            { name: 'UK', tooltip: 'uk' },
                        ],
                    },
                ],
            });
            restoreOffsetParent = polyfillOffsetParent();
            await user.pointer({ keys: '[MouseRight]', target: document.querySelector('.ag-cell')! });
            const log = (await openMenuOption('Log Cell')).closest<HTMLElement>('.ag-menu-option')!;
            const country = (await openMenuOption('Country')).closest<HTMLElement>('.ag-menu-option')!;

            // Coordinate-less hovers land at (0,0) and read as a stationary pointer, which focus-owned tooltips ignore.
            await user.pointer({ target: country, coords: { clientX: 20, clientY: 100 } });
            await openMenuOption('Ireland');
            await user.keyboard('{ArrowRight}{ArrowDown}');
            const uk = (await openMenuOption('UK')).closest<HTMLElement>('.ag-menu-option')!;
            expect(uk).toHaveFocus();
            if (tooltipTrigger === 'focus') {
                await expectTooltip('uk');
            }

            await user.pointer({ target: log, coords: { clientX: 20, clientY: 40 } });
            await waitFor(() => expect(log).toHaveFocus());
            await asyncSetTimeout(0);
            expect(uk).not.toBeInTheDocument();
            if (tooltipTrigger === 'focus') {
                expect(getVisibleTooltips()).toHaveLength(0);
                await user.keyboard('{ArrowDown}');
                await expectTooltip('Very long tooltip');
                await user.keyboard('{ArrowDown}');
                await expectTooltip('country');
            } else {
                await expectTooltip('Log');
            }
        }
    );

    test('hover trigger ignores keyboard focus but shows tooltips on hover', async () => {
        const first = await openContextMenu('hover', 'Initial tooltip');
        await asyncSetTimeout(0);
        expect(getVisibleTooltips()).toHaveLength(0);

        first.focus();
        await userEvent.keyboard('{ArrowDown}');
        await asyncSetTimeout(0);
        expect(getVisibleTooltips()).toHaveLength(0);

        await userEvent.hover(first);
        await expectTooltip('First tooltip');
    });
});
