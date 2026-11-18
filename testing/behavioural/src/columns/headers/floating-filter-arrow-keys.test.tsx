import '@testing-library/jest-dom/vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { TestGridsManager } from 'ag-test-utils';
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, IFloatingFilterComp } from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { dispatchKeyDown } from '../../navigation/navigation-test-utils';

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const BUTTON_SELECTOR = '.ag-floating-filter-button-button';
const INPUT_SELECTOR = '.ag-floating-filter-input input';

const columnDefs: ColDef[] = [{ field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true }];
const rowData = [{ athlete: 'Michael Phelps' }];
const modules = [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule];

const numberColumnDefs: ColDef[] = [{ field: 'age', filter: 'agNumberColumnFilter', floatingFilter: true }];

class FormInputsFloatingFilter implements IFloatingFilterComp {
    private readonly eGui = document.createElement('div');

    public init(): void {
        this.eGui.innerHTML = '<input type="checkbox"><input type="radio" name="floating-filter-radio">';
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public onParentModelChanged(): void {}
}

const formInputsColumnDefs: ColDef[] = [
    {
        field: 'athlete',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: FormInputsFloatingFilter,
    },
];

function focusElement(root: ParentNode, selector: string): void {
    const element = root.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    element!.focus();
    expect(element).toHaveFocus();
}

describe('floating filter arrow keys do not scroll the grid viewport', () => {
    const gridsManager = new TestGridsManager({ modules });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(gridColumnDefs: ColDef[] = columnDefs): Promise<HTMLElement> {
        const api: GridApi = await gridsManager.createGridAndWait('floating-filter-arrows', {
            columnDefs: gridColumnDefs,
            rowData,
        });
        return TestGridsManager.getHTMLElement(api)!;
    }

    test.each(ARROW_KEYS)('%s on the floating filter button prevents the default scroll', async (key) => {
        const eGridDiv = await createGrid();

        focusElement(eGridDiv, BUTTON_SELECTOR);
        expect(dispatchKeyDown(key).defaultPrevented).toBe(true);
    });

    test.each(ARROW_KEYS)('%s in the floating filter input keeps its default behaviour', async (key) => {
        const eGridDiv = await createGrid();

        focusElement(eGridDiv, INPUT_SELECTOR);
        expect(dispatchKeyDown(key).defaultPrevented).toBe(false);
    });

    test.each(ARROW_KEYS)('%s on a custom floating filter checkbox prevents the default scroll', async (key) => {
        const eGridDiv = await createGrid(formInputsColumnDefs);

        focusElement(eGridDiv, 'input[type="checkbox"]');
        expect(dispatchKeyDown(key).defaultPrevented).toBe(true);
    });

    test.each(ARROW_KEYS)('%s on a custom floating filter radio keeps its default behaviour', async (key) => {
        const eGridDiv = await createGrid(formInputsColumnDefs);

        focusElement(eGridDiv, 'input[type="radio"]');
        expect(dispatchKeyDown(key).defaultPrevented).toBe(false);
    });

    test.each(['ArrowUp', 'ArrowDown'])('%s in the number floating filter input keeps value stepping', async (key) => {
        const eGridDiv = await createGrid(numberColumnDefs);

        focusElement(eGridDiv, 'input[type="number"]');
        expect(dispatchKeyDown(key).defaultPrevented).toBe(false);
    });
});

describe('React floating filter arrow keys do not scroll the grid viewport', () => {
    afterEach(() => cleanup());

    async function renderGrid(): Promise<HTMLElement> {
        const { container } = render(
            <div style={{ height: 400, width: 600 }}>
                <AgGridReact columnDefs={columnDefs} rowData={rowData} modules={modules} />
            </div>
        );
        await waitFor(() => expect(container.querySelector(BUTTON_SELECTOR)).not.toBeNull());
        return container;
    }

    test.each(ARROW_KEYS)('%s on the floating filter button prevents the default scroll', async (key) => {
        const container = await renderGrid();

        focusElement(container, BUTTON_SELECTOR);
        expect(dispatchKeyDown(key).defaultPrevented).toBe(true);
    });

    test.each(ARROW_KEYS)('%s in the floating filter input keeps its default behaviour', async (key) => {
        const container = await renderGrid();

        focusElement(container, INPUT_SELECTOR);
        expect(dispatchKeyDown(key).defaultPrevented).toBe(false);
    });
});
