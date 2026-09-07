import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideDatasource, Toolbar } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('StateService - Find State', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [{ value: 'cat' }, { value: 'dog' }, { value: 'car' }, { value: 'cup' }];
    const columnDefs = [{ field: 'value' }];
    // Find only takes part in grid state when the Quick Access Toolbar owns an input for it.
    const toolbar: Toolbar = { items: ['agFindToolbarItem'] };

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(gridId: string, gridOptions: GridOptions = {}): Promise<GridApi> {
        const api = gridsManager.createGrid(gridId, { columnDefs, rowData, toolbar, ...gridOptions });
        await new GridRows(api, `${gridId} setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"cat"
            ├── LEAF id:1 value:"dog"
            ├── LEAF id:2 value:"car"
            └── LEAF id:3 value:"cup"
        `);
        return api;
    }

    describe('capture', () => {
        test('should not capture a find section when there is no search value', async () => {
            const api = await createGrid('no-search-value');

            await waitFor(() => expect(api.getState().find).toBeUndefined());
        });

        test('should capture the search value', async () => {
            const api = await createGrid('capture-search-value');

            api.setGridOption('findSearchValue', 'c');

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));
        });

        test('should capture the active match', async () => {
            const api = await createGrid('capture-active-match');

            api.setGridOption('findSearchValue', 'c');
            api.findNext();
            api.findNext();

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c', activeMatch: 2 }));
        });

        test('should drop the find section once the search value is cleared', async () => {
            const api = await createGrid('clear-search-value');

            api.setGridOption('findSearchValue', 'c');
            api.findNext();
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c', activeMatch: 1 }));

            api.setGridOption('findSearchValue', '');

            await waitFor(() => expect(api.getState().find).toBeUndefined());
        });

        test('should not capture a find section for the Server-Side Row Model', async () => {
            const api = await gridsManager.createGridAndWait('ssrm-no-find', {
                columnDefs,
                toolbar,
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params) => params.success({ rowData, rowCount: rowData.length }),
                } as IServerSideDatasource,
            });

            api.setGridOption('findSearchValue', 'c');

            await waitFor(() => expect(api.getState().find).toBeUndefined());
        });
    });

    describe('restore via initialState', () => {
        test('should restore the search value', async () => {
            const api = await createGrid('initial-search-value', {
                initialState: { find: { searchValue: 'c' } },
            });

            await waitFor(() => {
                expect(api.getGridOption('findSearchValue')).toBe('c');
                expect(api.findGetTotalMatches()).toBe(3);
            });
            expect(api.findGetActiveMatch()).toBeUndefined();
        });

        test('should restore the active match', async () => {
            const api = await createGrid('initial-active-match', {
                initialState: { find: { searchValue: 'c', activeMatch: 3 } },
            });

            await waitFor(() => expect(api.findGetActiveMatch()?.numOverall).toBe(3));
            // 'cup' is the third match
            expect(api.findGetActiveMatch()?.node.rowIndex).toBe(3);
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c', activeMatch: 3 }));
        });

        test('should restore an active match in the centre container past pinned top matches', async () => {
            const api = await gridsManager.createGridAndWait('initial-active-match-pinned', {
                columnDefs,
                rowData,
                toolbar,
                pinnedTopRowData: [{ value: 'cog' }],
                pinnedBottomRowData: [{ value: 'cab' }],
                initialState: { find: { searchValue: 'c', activeMatch: 2 } },
            });

            await waitFor(() => expect(api.findGetTotalMatches()).toBe(5));
            // match 1 is the pinned top 'cog', so match 2 is the first centre match, 'cat'
            await waitFor(() => expect(api.findGetActiveMatch()?.numOverall).toBe(2));
            expect(api.findGetActiveMatch()?.node.data.value).toBe('cat');
        });

        test('should restore an active match in the pinned bottom container', async () => {
            const api = await gridsManager.createGridAndWait('initial-active-match-pinned-bottom', {
                columnDefs,
                rowData,
                toolbar,
                pinnedTopRowData: [{ value: 'cog' }],
                pinnedBottomRowData: [{ value: 'cab' }],
                initialState: { find: { searchValue: 'c', activeMatch: 5 } },
            });

            await waitFor(() => expect(api.findGetActiveMatch()?.numOverall).toBe(5));
            expect(api.findGetActiveMatch()?.node.data.value).toBe('cab');
            expect(api.findGetActiveMatch()?.node.rowPinned).toBe('bottom');
        });

        test('should leave find alone when the initial state has no find section', async () => {
            const api = await createGrid('initial-no-find', {
                findSearchValue: 'c',
                initialState: { pagination: { page: 0 } },
            });

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));
        });
    });

    describe('restore via api.setState', () => {
        test('should restore the search value and active match', async () => {
            const api = await createGrid('set-state-find');

            api.setState({ find: { searchValue: 'c', activeMatch: 2 } });

            await waitFor(() => {
                expect(api.getGridOption('findSearchValue')).toBe('c');
                expect(api.findGetActiveMatch()?.numOverall).toBe(2);
            });
        });

        test('should clear the search value when the state has no find section', async () => {
            const api = await createGrid('set-state-clears-find');

            api.setGridOption('findSearchValue', 'c');
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));

            api.setState({});

            await waitFor(() => {
                expect(api.getGridOption('findSearchValue')).toBe('');
                expect(api.getState().find).toBeUndefined();
            });
        });

        test('should keep the saved page when going to the active match pages away from it', async () => {
            // Pagination is restored before Find, and going to a match on another page moves off it.
            const api = gridsManager.createGrid('set-state-find-pagination', {
                columnDefs,
                rowData,
                toolbar,
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: false,
            });
            // The state service starts caching Find at firstDataRendered, so let the grid get there.
            await waitForEvent('firstDataRendered', api);

            api.setGridOption('findSearchValue', 'c');
            api.findNext();
            await waitFor(() => expect(api.findGetActiveMatch()?.numOverall).toBe(1));

            // The user leaves the match's page before saving.
            api.paginationGoToPage(1);
            const state = await waitFor(() => {
                expect(api.getState().pagination?.page).toBe(1);
                expect(api.getState().find).toEqual({ searchValue: 'c', activeMatch: 1 });
                return api.getState();
            });

            api.setState(state);

            await waitFor(() => {
                expect(api.paginationGetCurrentPage()).toBe(1);
                expect(api.findGetActiveMatch()?.numOverall).toBe(1);
            });
        });

        test('should keep the saved page as the rendered one, not just the reported one', async () => {
            // The initialisation path only assigns the page number, so a restore has to navigate.
            const api = gridsManager.createGrid('initial-state-find-pagination', {
                columnDefs,
                rowData,
                toolbar,
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: false,
                initialState: {
                    find: { searchValue: 'c', activeMatch: 1 },
                    pagination: { page: 1, pageSize: 2 },
                },
            });
            await waitForEvent('firstDataRendered', api);

            // The reported page and the displayed rows must agree: match 1 lives on page 0, and the
            // initialisation path would leave the bounds there while reporting page 1.
            await waitFor(() => {
                expect(api.paginationGetCurrentPage()).toBe(1);
                expect(api.getFirstDisplayedRowIndex()).toBe(2);
                expect(api.getLastDisplayedRowIndex()).toBe(3);
            });
        });

        test('should clear an active match the restored state omits', async () => {
            const api = await createGrid('set-state-clears-active-match');

            api.setGridOption('findSearchValue', 'c');
            const state = await waitFor(() => {
                expect(api.getState().find).toEqual({ searchValue: 'c' });
                return api.getState();
            });

            api.findNext();
            await waitFor(() => expect(api.findGetActiveMatch()?.numOverall).toBe(1));

            // The search value is unchanged, so the option write is a no-op and cannot clear it.
            api.setState(state);

            await waitFor(() => {
                expect(api.findGetActiveMatch()).toBeUndefined();
                expect(api.getState().find).toEqual({ searchValue: 'c' });
            });
        });

        test('should leave the search value alone when find is ignored', async () => {
            const api = await createGrid('set-state-ignores-find');

            api.setGridOption('findSearchValue', 'c');
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));

            api.setState({}, ['find']);

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));
            expect(api.getGridOption('findSearchValue')).toBe('c');
        });
    });

    describe('without the toolbar item', () => {
        test('should not capture a find section', async () => {
            const api = await createGrid('no-toolbar-item-capture', { toolbar: undefined });

            api.setGridOption('findSearchValue', 'c');

            await waitFor(() => expect(api.findGetTotalMatches()).toBe(3));
            expect(api.getState().find).toBeUndefined();
        });

        test('should leave the grid option as the only source', async () => {
            const api = await createGrid('no-toolbar-item-restore', {
                toolbar: undefined,
                findSearchValue: 'dog',
                initialState: { find: { searchValue: 'c' } },
            });

            // The state section is ignored in both directions, so the grid option stands.
            await waitFor(() => {
                expect(api.findGetTotalMatches()).toBe(1);
                expect(api.getState().find).toBeUndefined();
            });
            expect(api.getGridOption('findSearchValue')).toBe('dog');
        });

        test('should capture once the toolbar gains the find item', async () => {
            const api = await createGrid('toolbar-item-added', { toolbar: undefined });

            api.setGridOption('findSearchValue', 'c');
            await waitFor(() => expect(api.findGetTotalMatches()).toBe(3));
            expect(api.getState().find).toBeUndefined();

            // Ownership changes without any Find event of its own.
            api.setGridOption('toolbar', { items: ['agFindToolbarItem'] });

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));
        });

        test('should drop the captured section once the toolbar loses the find item', async () => {
            const api = await createGrid('toolbar-item-removed');

            api.setGridOption('findSearchValue', 'c');
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));

            api.setGridOption('toolbar', undefined);

            await waitFor(() => expect(api.getState().find).toBeUndefined());
        });

        test('should not clear the grid option on setState', async () => {
            const api = await createGrid('no-toolbar-item-set-state', { toolbar: undefined, findSearchValue: 'c' });

            api.setState({});

            await waitFor(() => expect(api.getGridOption('findSearchValue')).toBe('c'));
            expect(api.findGetTotalMatches()).toBe(3);
        });
    });

    test('should round-trip through getState and setState', async () => {
        const api = await createGrid('round-trip');

        api.setGridOption('findSearchValue', 'c');
        api.findNext();
        const state = await waitFor(() => {
            const find = api.getState().find;
            expect(find).toEqual({ searchValue: 'c', activeMatch: 1 });
            return api.getState();
        });

        api.setGridOption('findSearchValue', '');
        await waitFor(() => expect(api.getState().find).toBeUndefined());

        api.setState(state);

        await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c', activeMatch: 1 }));
    });
});
