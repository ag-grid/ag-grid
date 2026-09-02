import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideDatasource } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('StateService - Find State', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const rowData = [{ value: 'cat' }, { value: 'dog' }, { value: 'car' }, { value: 'cup' }];
    const columnDefs = [{ field: 'value' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createGrid(gridId: string, gridOptions: GridOptions = {}): Promise<GridApi> {
        const api = gridsManager.createGrid(gridId, { columnDefs, rowData, ...gridOptions });
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

        test('should leave the search value alone when find is ignored', async () => {
            const api = await createGrid('set-state-ignores-find');

            api.setGridOption('findSearchValue', 'c');
            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));

            api.setState({}, ['find']);

            await waitFor(() => expect(api.getState().find).toEqual({ searchValue: 'c' }));
            expect(api.getGridOption('findSearchValue')).toBe('c');
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
