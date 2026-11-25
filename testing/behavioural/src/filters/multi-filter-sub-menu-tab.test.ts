import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, LEGACY_FILTER_WARNING_IDS, TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, TextFilterModule, enableDevValidations } from 'ag-grid-community';
import { MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

describe('Multi filter sub-menu keyboard navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, SetFilterModule, MultiFilterModule],
    });

    let agHiddenStyle: HTMLStyleElement;

    beforeAll(() => {
        // give ag-hidden its real meaning in jsdom so hidden inputs are untabbable, as in real browsers
        agHiddenStyle = document.createElement('style');
        agHiddenStyle.textContent = '.ag-hidden { display: none !important; }';
        document.head.appendChild(agHiddenStyle);
    });

    afterAll(() => {
        agHiddenStyle.remove();
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function openTextSubMenu(tabIndex?: number) {
        const api = await gridsManager.createGridAndWait('multiFilterSubMenuTab', {
            tabIndex,
            columnDefs: [
                {
                    field: 'sport',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', display: 'subMenu' },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: [{ sport: 'Swimming' }, { sport: 'Cycling' }],
        });
        api.showColumnFilter('sport');
        const menuItem = await waitFor(() => {
            const item = document.querySelector<HTMLElement>('.ag-multi-filter-menu-item');
            expect(item).not.toBeNull();
            return item!;
        });
        const user = userEvent.setup();
        await user.click(menuItem);
        const subMenu = await waitFor(() => {
            const popup = document.querySelector<HTMLElement>('.ag-menu[role="dialog"]:not(.ag-filter-menu)');
            expect(popup?.querySelector('.ag-filter-body input')).toHaveFocus();
            return popup!;
        });
        const input = subMenu.querySelector<HTMLInputElement>('.ag-filter-body input')!;
        return { menuItem, subMenu, input, user };
    }

    test('Shift+Tab from the first input moves to the operator dropdown and keeps the sub-menu open', async () => {
        const { subMenu, input, user } = await openTextSubMenu();

        await user.tab({ shift: true });

        expect(subMenu).toBeInTheDocument();
        expect(subMenu.querySelector('.ag-filter-select [role="combobox"]')).toHaveFocus();
        expect(input).not.toHaveFocus();
    });

    test('Tab from a typed input reaches the clear button, the AND/OR group and the second condition', async () => {
        const { subMenu, input, user } = await openTextSubMenu();

        await user.type(input, 'sw');
        await user.tab();
        expect(subMenu).toBeInTheDocument();
        expect(subMenu.querySelector('.ag-filter-body button')).toHaveFocus();

        const and = subMenu.querySelector<HTMLInputElement>('.ag-filter-condition-operator-and input')!;
        const secondOperator = subMenu.querySelectorAll<HTMLElement>('.ag-filter-select [role="combobox"]')[1];
        const visited = new Set<Element | null>();
        for (let i = 0; i < 10 && !visited.has(secondOperator); i++) {
            await user.tab();
            expect(subMenu).toBeInTheDocument();
            visited.add(document.activeElement);
        }
        expect(visited).toContain(and);
        expect(visited).toContain(secondOperator);
    });

    test('Shift+Tab from the first control still closes the sub-menu and returns focus to its menu item', async () => {
        const { menuItem, subMenu, user } = await openTextSubMenu();

        await user.tab({ shift: true });
        await user.tab({ shift: true });

        expect(subMenu).not.toBeInTheDocument();
        await waitFor(() => expect(menuItem).toHaveFocus());
    });

    test('Tab from the last control closes the sub-menu and returns focus to its menu item', async () => {
        const { menuItem, subMenu, input, user } = await openTextSubMenu();

        await user.type(input, 'sw');
        for (let i = 0; i < 15 && subMenu.isConnected; i++) {
            await user.tab();
        }

        expect(subMenu).not.toBeInTheDocument();
        await waitFor(() => expect(menuItem).toHaveFocus());
    });

    test('Tab with a positive grid tabIndex stays inside the sub-menu until it closes on its menu item', async () => {
        const { menuItem, subMenu, input, user } = await openTextSubMenu(3);
        const clearButton = subMenu.querySelector('.ag-filter-body button');

        await user.type(input, 'sw');
        const visited = new Set<Element | null>();
        for (let i = 0; i < 15; i++) {
            await user.tab();
            if (!subMenu.isConnected) {
                break;
            }
            visited.add(document.activeElement);
        }

        expect([...visited].every((element) => subMenu.contains(element))).toBe(true);
        expect(visited).toContain(clearButton);
        expect(subMenu).not.toBeInTheDocument();
        await waitFor(() => expect(menuItem).toHaveFocus());
    });
});
