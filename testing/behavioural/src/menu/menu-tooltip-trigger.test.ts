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

import { ClientSideRowModelModule, TooltipModule } from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

describe('menu tooltip triggers', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, ContextMenuModule, TooltipModule] });
    let restoreOffsetParent: (() => void) | undefined;

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    async function openContextMenu(tooltipTrigger: 'focus' | 'hover', initialTooltip?: string): Promise<HTMLElement> {
        await gridMgr.createGridAndWait('menu-tooltip-trigger', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'Cell' }],
            tooltipTrigger,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            getContextMenuItems: () => [
                // Opening the menu focuses this item; keep that separate from hover activation.
                { name: 'Initial', tooltip: initialTooltip },
                { name: 'First', tooltip: 'First tooltip' },
                {
                    name: 'Second',
                    tooltip: 'Second tooltip',
                    subMenu: [{ name: 'Child', tooltip: 'Child tooltip' }],
                },
            ],
        });
        restoreOffsetParent = polyfillOffsetParent();
        document.querySelector('.ag-cell')!.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );
        return (await openMenuOption('First')).closest<HTMLElement>('.ag-menu-option')!;
    }

    async function expectTooltip(text: string): Promise<void> {
        await waitFor(() => expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual([text]));
    }

    test('focus trigger shows the initially focused item tooltip when the menu opens', async () => {
        await openContextMenu('focus', 'Initial tooltip');
        await expectTooltip('Initial tooltip');
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
