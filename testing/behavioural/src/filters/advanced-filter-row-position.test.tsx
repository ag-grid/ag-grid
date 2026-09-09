import { waitFor } from '@testing-library/dom';
import { cleanup, render } from '@testing-library/react';
import { TestGridsManager } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const modules = [ClientSideRowModelModule, TextFilterModule, AdvancedFilterModule];

interface Athlete {
    athlete: string;
    age: number;
}

const columnDefs: ColDef<Athlete>[] = [{ field: 'athlete' }, { field: 'age' }];
const rowData: Athlete[] = [
    { athlete: 'Michael Phelps', age: 23 },
    { athlete: 'Usain Bolt', age: 25 },
];

/**
 * The advanced filter bar is absolutely positioned inside the top section (`.ag-grid-pinned-top-rows`),
 * so the only thing stopping the first row rendering behind it is the height the top section reserves
 * for it (`--ag-top-rows-height`). If that stays 0 the bar overlaps the first row.
 */
const expectTopSectionToReserveAdvancedFilterHeight = async () => {
    // The bar and the header cells are both mounted by the time the grid's layout has settled.
    await waitFor(() => {
        expect(document.querySelector('.ag-advanced-filter-header')).not.toBeNull();
        expect(document.querySelectorAll('.ag-header-cell').length).toBe(columnDefs.length);
    });

    const advancedFilterBar = document.querySelector<HTMLElement>('.ag-advanced-filter-header')!;
    const topSection = document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows')!;

    const advancedFilterHeight = Number.parseFloat(advancedFilterBar.style.height);
    const reservedHeight = Number.parseFloat(topSection.style.getPropertyValue('--ag-top-rows-height'));

    expect(advancedFilterHeight).toBeGreaterThan(0);
    expect(reservedHeight).toBe(advancedFilterHeight);
};

describe('Advanced Filter row position', () => {
    beforeAll(() => {
        mockGridLayout.init();
        ModuleRegistry.registerModules(modules);
    });

    const gridsManager = new TestGridsManager({ modules });

    afterEach(() => {
        gridsManager.reset();
        cleanup();
    });

    // Row data arriving after mount is the common shape (the docs examples fetch it), and it is the
    // case where nothing else re-runs the top section layout, so a missed measurement sticks.
    test('vanilla reserves space for the advanced filter bar when row data arrives after mount', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            enableAdvancedFilter: true,
        });

        await expectTopSectionToReserveAdvancedFilterHeight();

        api.setGridOption('rowData', rowData);

        await expectTopSectionToReserveAdvancedFilterHeight();
    });

    test('React reserves space for the advanced filter bar when row data arrives after mount', async () => {
        const rendered = render(<AgGridReact columnDefs={columnDefs} enableAdvancedFilter={true} />);

        await expectTopSectionToReserveAdvancedFilterHeight();

        rendered.rerender(<AgGridReact columnDefs={columnDefs} rowData={rowData} enableAdvancedFilter={true} />);

        await expectTopSectionToReserveAdvancedFilterHeight();
    });
});
