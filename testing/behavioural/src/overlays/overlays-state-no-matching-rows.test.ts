import { waitFor } from '@testing-library/dom';

import type { AdvancedFilterModel } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlays no matching rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, AdvancedFilterModule],
    });
    const columnDefs = [
        { field: 'athlete', filter: true },
        { field: 'sport', filter: true },
        { field: 'age', filter: true },
    ];

    function hasLoadingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    function hasNoMatchingRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-matching-rows-center'));
    }

    function hasLoadingOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-loading-wrapper');
    }

    function hasNoRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-rows-wrapper');
    }
    function hasNoMatchingRowsOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-no-matching-rows-wrapper');
    }

    function hasCustomOverlayWrapper() {
        return isAgHtmlElementVisible('.ag-overlay-modal-wrapper');
    }

    function getOverlayWrapperPadding(): number {
        const wrapper = document.querySelector<HTMLElement>('.ag-overlay-wrapper');
        if (!wrapper) {
            return 0;
        }
        const padding = wrapper.style.getPropertyValue('padding-top');
        return padding ? Number.parseFloat(padding) : 0;
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        expect(hasNoRowsOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasLoadingOverlayWrapper()).toBeFalsy();
        expect(hasNoMatchingRowsOverlayWrapper()).toBeFalsy();
        expect(hasCustomOverlayWrapper()).toBeFalsy();
    });

    describe('no matching rows overlay', () => {
        test('should not show when there are no rows', () => {
            gridsManager.createGrid('myGrid', { columnDefs, rowData: [] });
            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeTruthy();
        });

        test('should not show when there are rows but no filters', () => {
            gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23 }],
            });
            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('should show when there are rows but filter matches no results', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            api.setFilterModel({
                athlete: {
                    filterType: 'text',
                    type: 'startsWith',
                    filter: 'Test',
                },
            });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('should hide when filter is removed', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();

            api.setFilterModel(null);

            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('should hide when filter is cleared to show matching results', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();

            await api.setColumnFilterModel('athlete', { type: 'contains', filter: 'Michael' });

            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('should show when rows are removed due to transaction that results in empty filtered set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { id: '1', athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { id: '2', athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
                getRowId: (params) => params.data.id,
            });

            api.setFilterModel({ sport: { type: 'contains', filter: 'Swimming' } });

            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();

            // Remove the only row that matches the filter
            api.applyTransaction({
                remove: [{ id: '1', athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' }],
            });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
        });

        test('loading overlay has higher priority than no matching rows overlay', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
                loading: false,
            });

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();

            api.setGridOption('loading', true);

            await waitFor(() => expect(hasLoadingOverlay()).toBeTruthy());
            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
        });

        test('loading overlay takes precedence over no matching rows when loading is set initially', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' }],
                loading: true,
                suppressOverlays: ['noRows'],
            });

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasLoadingOverlay()).toBeTruthy();
            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
        });

        test('no matching rows overlay is not shown when suppressOverlays has noMatchingRows', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
                suppressOverlays: ['noMatchingRows'],
            });

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('no matching rows overlay applies header padding when shown', async () => {
            const headerHeight = 64;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
                headerHeight,
            });

            expect(getOverlayWrapperPadding()).toBe(0);

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            await waitFor(() => expect(getOverlayWrapperPadding()).toBe(headerHeight), { timeout: 1000 });
        });

        test('no matching rows overlay transitions from loading overlay correctly', async () => {
            const headerHeight = 72;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
                loading: true,
                headerHeight,
            });

            await waitFor(() => expect(hasLoadingOverlay()).toBeTruthy());
            expect(getOverlayWrapperPadding()).toBe(0);

            api.setFilterModel({ athlete: { type: 'contains', filter: 'Nonexistent' } });
            await waitFor(() => expect(hasLoadingOverlay()).toBeTruthy());
            expect(getOverlayWrapperPadding()).toBe(0);

            api.setGridOption('loading', false);

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasLoadingOverlay()).toBeFalsy();
            await waitFor(() => expect(getOverlayWrapperPadding()).toBe(headerHeight), { timeout: 1000 });
        });

        test('multiple columns can be filtered simultaneously with no matching rows', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            api.setFilterModel({
                athlete: { type: 'contains', filter: 'Nonexistent' },
                sport: { type: 'contains', filter: 'Nonexistent' },
            });

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });

        test('no matching rows overlay shows with advanced filter', async () => {
            const initialAdvancedFilterModel: AdvancedFilterModel = {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    {
                        filterType: 'text',
                        colId: 'country',
                        type: 'contains',
                        filter: 'Nonexistent',
                    },
                ],
            };

            gridsManager.createGrid('myGrid', {
                enableAdvancedFilter: true,
                initialState: {
                    filter: {
                        advancedFilterModel: initialAdvancedFilterModel,
                    },
                },
                columnDefs: [...columnDefs, { field: 'country', filter: true }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
        });

        test('no matching rows overlay shows with quick filter', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [...columnDefs, { field: 'country' }],
                rowData: [
                    { athlete: 'Michael Phelps', sport: 'Swimming', age: 23, country: 'USA' },
                    { athlete: 'Emma Thompson', sport: 'Tennis', age: 25, country: 'UK' },
                ],
            });

            api.setGridOption('quickFilterText', 'Nonexistent');

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasLoadingOverlay()).toBeFalsy();
        });
    });

    // If the user has called api.showNoRowsOverlay(), we respect that choice and do not show the provided overlays until
    // the user calls api.hideOverlay()
    describe('user shows no rows overlay manually', () => {
        test('no matching rows does not override manual showNoRowsOverlay but shows after', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23 }],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('quickFilterText', 'Nonexistent');

            expect(hasNoRowsOverlay()).toBeTruthy();

            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasNoMatchingRowsOverlay()).toBeTruthy();
        });

        test('no matching rows does not override manual showNoRowsOverlay and does not show if suppressed', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23 }],
                suppressOverlays: ['noMatchingRows'],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.showNoRowsOverlay();
            expect(hasNoRowsOverlay()).toBeTruthy();

            api.setGridOption('quickFilterText', 'Nonexistent');

            expect(hasNoRowsOverlay()).toBeTruthy();

            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasNoMatchingRowsOverlay()).toBeFalsy();
        });

        test('hiding no matching rows does not work via api.hideOverlay and logs warning', () => {
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ athlete: 'Michael Phelps', sport: 'Swimming', age: 23 }],
            });
            expect(hasLoadingOverlay()).toBeFalsy();
            expect(hasNoRowsOverlay()).toBeFalsy();

            api.setGridOption('quickFilterText', 'Nonexistent');

            expect(hasNoMatchingRowsOverlay()).toBeTruthy();

            api.hideOverlay();
            expect(hasNoRowsOverlay()).toBeFalsy();
            expect(hasNoMatchingRowsOverlay()).toBeTruthy();

            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

            consoleWarnSpy.mockRestore();
        });
    });
});
