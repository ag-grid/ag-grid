import { cleanup, render, waitFor } from '@testing-library/react';
import { TestGridsManager } from 'ag-test-utils';
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const BUTTON_SELECTOR = '.ag-floating-filter-button-button';
const INPUT_SELECTOR = '.ag-floating-filter-input input';

const columnDefs: ColDef[] = [{ field: 'athlete', filter: 'agTextColumnFilter', floatingFilter: true }];
const rowData = [{ athlete: 'Michael Phelps' }];
const modules = [ClientSideRowModelModule, TextFilterModule];

function pressKey(element: HTMLElement, key: string): KeyboardEvent {
    element.focus();
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event;
}

function getElement(root: ParentNode, selector: string): HTMLElement {
    const element = root.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    return element!;
}

describe('floating filter arrow keys do not scroll the grid viewport', () => {
    const gridsManager = new TestGridsManager({ modules });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(): Promise<HTMLElement> {
        const api: GridApi = await gridsManager.createGridAndWait('floating-filter-arrows', { columnDefs, rowData });
        return TestGridsManager.getHTMLElement(api)!;
    }

    test.each(ARROW_KEYS)('%s on the floating filter button prevents the default scroll', async (key) => {
        const eGridDiv = await createGrid();

        expect(pressKey(getElement(eGridDiv, BUTTON_SELECTOR), key).defaultPrevented).toBe(true);
    });

    test.each(ARROW_KEYS)('%s in the floating filter input keeps its default behaviour', async (key) => {
        const eGridDiv = await createGrid();

        expect(pressKey(getElement(eGridDiv, INPUT_SELECTOR), key).defaultPrevented).toBe(false);
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

        expect(pressKey(getElement(container, BUTTON_SELECTOR), key).defaultPrevented).toBe(true);
    });

    test.each(ARROW_KEYS)('%s in the floating filter input keeps its default behaviour', async (key) => {
        const container = await renderGrid();

        expect(pressKey(getElement(container, INPUT_SELECTOR), key).defaultPrevented).toBe(false);
    });
});
