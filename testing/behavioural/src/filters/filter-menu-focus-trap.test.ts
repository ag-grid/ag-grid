import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { IFilterComp } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule } from 'ag-grid-community';

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

describe('Filter menu focus trap', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
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
