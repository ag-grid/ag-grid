import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { IFilterComp } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, TextFilterModule } from 'ag-grid-community';
import { MultiFilterModule } from 'ag-grid-enterprise';

function createInput(className: string): HTMLInputElement {
    const input = document.createElement('input');
    input.className = className;
    return input;
}

/** A focusable but not tabbable element, reachable only programmatically (not part of the Tab flow). */
function createStaticPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'test-static-panel';
    panel.tabIndex = -1;
    panel.textContent = 'static panel';
    return panel;
}

abstract class StaticPanelFilter implements IFilterComp {
    private eGui!: HTMLElement;

    protected abstract createChildren(): HTMLElement[];

    public init(): void {
        this.eGui = document.createElement('div');
        this.eGui.append(...this.createChildren());
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public doesFilterPass(): boolean {
        return true;
    }

    public isFilterActive(): boolean {
        return false;
    }

    public getModel(): unknown {
        return null;
    }

    public setModel(): void {}
}

class PanelAfterInputFilter extends StaticPanelFilter {
    protected override createChildren(): HTMLElement[] {
        return [createInput('test-filter-input'), createStaticPanel()];
    }
}

class PanelBetweenInputsFilter extends StaticPanelFilter {
    protected override createChildren(): HTMLElement[] {
        return [createInput('test-first-input'), createStaticPanel(), createInput('test-second-input')];
    }
}

class PanelBeforeInputFilter extends StaticPanelFilter {
    protected override createChildren(): HTMLElement[] {
        return [createStaticPanel(), createInput('test-filter-input')];
    }
}

class NativeControlsFilter extends StaticPanelFilter {
    protected override createChildren(): HTMLElement[] {
        const button = document.createElement('button');
        button.tabIndex = 0;
        button.textContent = 'Action';
        return [createInput('test-filter-input'), button];
    }
}

class PositiveTabIndexFilter extends NativeControlsFilter {
    protected override createChildren(): HTMLElement[] {
        const children = super.createChildren();
        children[0].tabIndex = 3;
        return [...children, createStaticPanel()];
    }
}

class RadioGroupFirstFilter extends StaticPanelFilter {
    protected override createChildren(): HTMLElement[] {
        const [unchecked, checked] = [createInput('test-unchecked'), createInput('test-checked')];
        for (const radio of [unchecked, checked]) {
            radio.type = 'radio';
            radio.name = 'choice';
        }
        checked.checked = true;
        return [unchecked, checked, createInput('test-filter-input')];
    }
}

describe('Filter menu focus trap', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each([0, 3, -1])('custom filter traps native controls with grid tabIndex %s', async (tabIndex) => {
        const api = await gridsManager.createGridAndWait('nativeFilterTabOrder', {
            tabIndex,
            columnDefs: [{ field: 'a', filter: NativeControlsFilter }],
            rowData: [{ a: 1 }],
        });
        api.showColumnFilter('a');
        const input = await waitFor(() => {
            const input = document.querySelector<HTMLInputElement>('.ag-filter-menu .test-filter-input');
            expect(input).not.toBeNull();
            return input!;
        });
        const button = document.querySelector<HTMLButtonElement>('.ag-filter-menu button')!;
        const user = userEvent.setup();
        input.focus();
        await user.tab();
        expect(button).toHaveFocus();
        await user.tab();
        expect(input).toHaveFocus();
        await user.tab({ shift: true });
        expect(button).toHaveFocus();
        await user.tab({ shift: true });
        expect(input).toHaveFocus();
    });

    test.each([false, true])('wraps past an unchecked radio group as one stop (backwards: %s)', async (backwards) => {
        const api = await gridsManager.createGridAndWait('uncheckedRadioFilter', {
            columnDefs: [{ field: 'a', filter: RadioGroupFirstFilter }],
            rowData: [{ a: 1 }],
        });
        api.showColumnFilter('a');
        const input = await waitFor(() => {
            const input = document.querySelector<HTMLInputElement>('.ag-filter-menu .test-filter-input');
            expect(input).not.toBeNull();
            return input!;
        });
        const radios = input.parentElement!.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios[1].checked = false;
        if (!backwards) {
            input.parentElement!.prepend(input);
        }
        const user = userEvent.setup();
        input.focus();
        await user.tab({ shift: backwards });
        expect(radios[backwards ? 1 : 0]).toHaveFocus();
        await user.tab({ shift: backwards });
        expect(input).toHaveFocus();
        expect(radios[0]).not.toBeChecked();
        expect(radios[1]).not.toBeChecked();
    });

    test('popup preserves custom tab order when controls are inserted, updated and removed', async () => {
        const api = await gridsManager.createGridAndWait('localFilterTabOrder', {
            columnDefs: [{ field: 'a', filter: PositiveTabIndexFilter }],
            rowData: [{ a: 1 }],
        });
        api.showColumnFilter('a');
        const input = await waitFor(() => {
            const input = document.querySelector<HTMLInputElement>('.ag-filter-menu .test-filter-input');
            expect(input).toHaveAttribute('tabindex', '3');
            return input!;
        });
        const container = input.parentElement!;
        expect(container.querySelector('.test-static-panel')).toHaveAttribute('tabindex', '-1');

        const added = createInput('test-added-input');
        added.tabIndex = 5;
        container.appendChild(added);
        const button = container.querySelector('button')!;
        const user = userEvent.setup();
        input.focus();
        await user.tab();
        expect(added).toHaveFocus();
        await user.tab();
        expect(button).toHaveFocus();
        await user.tab();
        expect(input).toHaveFocus();
        await user.tab({ shift: true });
        expect(button).toHaveFocus();
        await user.tab({ shift: true });
        expect(added).toHaveFocus();

        added.tabIndex = 1;
        await user.tab();
        expect(input).toHaveFocus();
        await user.tab({ shift: true });
        expect(added).toHaveFocus();
        await user.tab({ shift: true });
        expect(button).toHaveFocus();
        added.remove();
        await user.tab();
        expect(input).toHaveFocus();

        api.hideColumnFilter();
        expect(input).toHaveAttribute('tabindex', '3');
        expect(added).toHaveAttribute('tabindex', '1');
    });

    async function openFilterMenu(colId: 'a' | 'b' | 'c'): Promise<HTMLElement> {
        const api = await gridsManager.createGridAndWait('filterFocusTrapGrid', {
            columnDefs: [
                { field: 'a', filter: PanelAfterInputFilter },
                { field: 'b', filter: PanelBetweenInputsFilter },
                { field: 'c', filter: PanelBeforeInputFilter },
            ],
            rowData: [{ a: 1, b: 2, c: 3 }],
        });

        api.showColumnFilter(colId);

        return await waitFor(() => {
            const menu = document.querySelector<HTMLElement>('.ag-menu');
            expect(menu).not.toBeNull();
            expect(menu!.querySelector('input')).not.toBeNull();
            return menu!;
        });
    }

    test('Tab and Shift+Tab stay trapped when the only tabbable element is followed by a tabindex="-1" element', async () => {
        const menu = await openFilterMenu('a');
        const user = userEvent.setup();
        const input = menu.querySelector<HTMLInputElement>('.test-filter-input')!;

        input.focus();

        // nothing tabbable after the input: the trap must wrap instead of letting focus escape the menu
        await user.tab();
        expect(input).toHaveFocus();

        // the panel is not part of the Tab flow: wrapping backwards must not land on it
        await user.tab({ shift: true });
        expect(input).toHaveFocus();
    });

    test('Tab from a focused tabindex="-1" element wraps back into the menu', async () => {
        const menu = await openFilterMenu('a');
        const user = userEvent.setup();
        const input = menu.querySelector<HTMLInputElement>('.test-filter-input')!;
        const panel = menu.querySelector<HTMLElement>('.test-static-panel')!;

        panel.focus();
        expect(panel).toHaveFocus();

        // nothing tabbable after the panel: native Tab would escape the menu, so the trap must wrap
        await user.tab();
        expect(input).toHaveFocus();
    });

    test('the tab flow moves around a tabindex="-1" element between tabbable elements', async () => {
        const menu = await openFilterMenu('b');
        const user = userEvent.setup();
        const firstInput = menu.querySelector<HTMLInputElement>('.test-first-input')!;
        const secondInput = menu.querySelector<HTMLInputElement>('.test-second-input')!;
        const panel = menu.querySelector<HTMLElement>('.test-static-panel')!;

        // Shift+Tab from the panel goes to the previous tabbable element, not to a wrap target
        panel.focus();
        await user.tab({ shift: true });
        expect(firstInput).toHaveFocus();

        // Tab from the last tabbable element wraps to the first, skipping the panel
        secondInput.focus();
        await user.tab();
        expect(firstInput).toHaveFocus();
    });

    test('Shift+Tab from a tabindex="-1" element before all tabbable elements wraps to the last tabbable', async () => {
        const menu = await openFilterMenu('c');
        const user = userEvent.setup();
        const input = menu.querySelector<HTMLInputElement>('.test-filter-input')!;
        const panel = menu.querySelector<HTMLElement>('.test-static-panel')!;

        panel.focus();

        // native Shift+Tab would escape the menu: the trap must intercept and wrap to the last tabbable
        await user.tab({ shift: true });
        expect(input).toHaveFocus();
    });
});

describe('Simple filter AND/OR join operator keyboard navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('provided controls wrap in both directions with a positive grid tabIndex', async () => {
        const api = await gridsManager.createGridAndWait('providedFilterTabOrder', {
            tabIndex: 3,
            suppressInputClearButton: true,
            columnDefs: [{ field: 'a', filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } }],
            rowData: [{ a: 'x' }],
        });
        api.showColumnFilter('a');
        const select = await waitFor(() => {
            const select = document.querySelector<HTMLElement>('.ag-filter-menu [role="combobox"]');
            expect(select).toHaveAttribute('tabindex', '3');
            return select!;
        });
        const menu = document.querySelector<HTMLElement>('.ag-filter-menu')!;
        const input = menu.querySelector<HTMLInputElement>('input')!;
        const apply = menu.querySelector<HTMLButtonElement>('.ag-filter-apply-panel button')!;
        const user = userEvent.setup();
        select.focus();
        await user.tab({ shift: true });
        expect(apply).toHaveFocus();
        await user.tab();
        expect(select).toHaveFocus();

        await user.type(input, 'x');
        await waitFor(() => expect(menu.querySelectorAll('[role="combobox"]')).toHaveLength(2));
        const lastInput = menu.querySelectorAll<HTMLInputElement>('.ag-filter-body input')[1];
        expect(lastInput).toHaveAttribute('tabindex', '3');
        apply.focus();
        await user.tab();
        expect(select).toHaveFocus();
        await user.tab({ shift: true });
        expect(apply).toHaveFocus();
    });

    async function openFilter() {
        const api = await gridsManager.createGridAndWait('joinOperatorKeyboardGrid', {
            columnDefs: [{ field: 'a', filter: 'agTextColumnFilter', filterParams: { numAlwaysVisibleConditions: 2 } }],
            rowData: [{ a: 'x' }],
        });

        api.showColumnFilter('a');

        const menu = await waitFor(() => {
            const menu = document.querySelector<HTMLElement>('.ag-menu');
            expect(menu?.querySelector('.ag-filter-condition-operator-or input')).toBeTruthy();
            return menu!;
        });

        // the join operator is disabled until the first condition is complete
        await userEvent.type(menu.querySelector<HTMLInputElement>('.ag-filter-body input')!, 'x');

        const and = menu.querySelector<HTMLInputElement>('.ag-filter-condition-operator-and input')!;
        const or = menu.querySelector<HTMLInputElement>('.ag-filter-condition-operator-or input')!;
        const joinPanel = and.closest<HTMLElement>('.ag-filter-condition')!;
        await waitFor(() => expect(and).toBeEnabled());

        return { and, or, joinPanel };
    }

    test('Tab and Shift+Tab treat the radio group as a single stop on the checked radio', async () => {
        const { and, or, joinPanel } = await openFilter();
        const user = userEvent.setup();

        expect(and).toBeChecked();
        and.focus();

        await user.tab();
        expect(or).not.toHaveFocus();
        expect(joinPanel).not.toContainElement(document.activeElement as HTMLElement);

        await user.tab({ shift: true });
        expect(and).toHaveFocus();

        await user.tab({ shift: true });
        expect(joinPanel).not.toContainElement(document.activeElement as HTMLElement);
    });

    test('arrow keys move between AND and OR, and Tab then returns to the newly checked radio', async () => {
        const { and, or, joinPanel } = await openFilter();
        const user = userEvent.setup();

        and.focus();
        await user.keyboard('{ArrowRight}');
        expect(or).toHaveFocus();
        expect(or).toBeChecked();

        await user.tab({ shift: true });
        expect(joinPanel).not.toContainElement(document.activeElement as HTMLElement);

        await user.tab();
        expect(or).toHaveFocus();

        await user.keyboard('{ArrowLeft}');
        expect(and).toHaveFocus();
        expect(and).toBeChecked();
    });

    test.each([false, true])('an unchecked group is a single Tab stop (backwards: %s)', async (backwards) => {
        const { and, or, joinPanel } = await openFilter();
        const user = userEvent.setup();
        and.checked = false;
        (backwards ? or : and).focus();

        await user.tab({ shift: backwards });
        expect(joinPanel).not.toContainElement(document.activeElement as HTMLElement);

        await user.tab({ shift: !backwards });
        expect(backwards ? and : or).toHaveFocus();
        expect(and).not.toBeChecked();
        expect(or).not.toBeChecked();
    });
});

describe('Multi filter radio group entry', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule, TextFilterModule, MultiFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('entering through the top tab guard lands on the checked radio of a leading group', async () => {
        const api = await gridsManager.createGridAndWait('multiFilterRadioGrid', {
            columnDefs: [
                {
                    field: 'a',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: RadioGroupFirstFilter }, { filter: 'agTextColumnFilter' }] },
                },
            ],
            rowData: [{ a: 1 }],
        });

        api.showColumnFilter('a');

        const multiFilter = await waitFor(() => {
            const element = document.querySelector<HTMLElement>('.ag-menu .ag-multi-filter');
            expect(element?.querySelector('.test-checked')).toBeTruthy();
            return element!;
        });

        (document.activeElement as HTMLElement | null)?.blur();
        multiFilter.querySelector<HTMLElement>(':scope > .ag-tab-guard-top')!.focus();

        expect(multiFilter.querySelector('.test-checked')).toHaveFocus();
    });
});
