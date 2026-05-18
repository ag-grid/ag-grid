/**
 * Interactive column tests that verify clicking headers, sort buttons,
 * group expand/collapse icons, and column menu interactions.
 */
import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column Interactions', () => {
    beforeAll(() => setupAgTestIds());

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, NumberFilterModule, TextFilterModule, ColumnMenuModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('click header to sort', () => {
        test('clicking sortable column header toggles sort asc', async () => {
            const user = userEvent.setup();
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'name', sortable: true },
                    { field: 'value', sortable: true },
                ],
                rowData: [
                    { name: 'Charlie', value: 3 },
                    { name: 'Alice', value: 1 },
                    { name: 'Bob', value: 2 },
                ],
            });

            await asyncSetTimeout(0);

            await new GridColumns(api, 'initial unsorted').checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── value "Value" width:200
            `);

            // Click the name header to sort ascending
            const gridDiv = getGridElement(api)! as HTMLElement;
            const nameHeader = getByTestId(gridDiv, agTestIdFor.headerCell('name'));
            const label = nameHeader.querySelector('.ag-header-cell-label')!;
            await user.click(label);
            await asyncSetTimeout(1);

            await new GridColumns(api, 'sorted asc').checkColumns(`
                CENTER
                ├── name "Name" width:200 sort:asc sortIndex:0
                └── value "Value" width:200
            `);

            // Rows should be sorted
            await new GridRows(api, 'rows sorted asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 name:"Alice" value:1
                ├── LEAF id:2 name:"Bob" value:2
                └── LEAF id:0 name:"Charlie" value:3
            `);

            // Click again to sort descending
            await user.click(label);
            await asyncSetTimeout(1);

            await new GridColumns(api, 'sorted desc').checkColumns(`
                CENTER
                ├── name "Name" width:200 sort:desc sortIndex:0
                └── value "Value" width:200
            `);
        });

        test('clicking non-sortable column header does not sort', async () => {
            const user = userEvent.setup();
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'name', sortable: false }, { field: 'value' }],
                rowData: [{ name: 'Alice', value: 1 }],
            });

            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const nameHeader = getByTestId(gridDiv, agTestIdFor.headerCell('name'));
            const label = nameHeader.querySelector('.ag-header-cell-label')!;
            await user.click(label);
            await asyncSetTimeout(1);

            // Should remain unsorted
            await new GridColumns(api, 'still unsorted').checkColumns(`
                CENTER
                ├── name "Name" width:200 !sortable
                └── value "Value" width:200
            `);
        });
    });

    describe('column group expand/collapse by click', () => {
        test('clicking group expand icon toggles expansion', async () => {
            const user = userEvent.setup();
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group',
                        openByDefault: true,
                        children: [
                            { colId: 'a' },
                            { colId: 'b', columnGroupShow: 'open' },
                            { colId: 'c', columnGroupShow: 'closed' },
                        ],
                    },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            await asyncSetTimeout(0);

            // Initially open
            await new GridColumns(api, 'open').checkColumns(`
                CENTER
                └─┬ "Group" GROUP open
                  ├── a width:200
                  ├── b width:200 columnGroupShow:open
                  └── c width:200 columnGroupShow:closed hidden
            `);

            // Find and click the expand icon
            const gridDiv = getGridElement(api)! as HTMLElement;
            const expandedIcon = gridDiv.querySelector('.ag-header-expand-icon-expanded');
            if (expandedIcon) {
                await user.click(expandedIcon);
                await asyncSetTimeout(1);

                // Should now be closed
                await new GridColumns(api, 'closed after click').checkColumns(`
                    CENTER
                    └─┬ "Group" GROUP closed
                      ├── a width:200
                      ├── b width:200 columnGroupShow:open hidden
                      └── c width:200 columnGroupShow:closed
                `);
            }
        });

        test('toggling group expansion via API method', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'myGroup',
                        headerName: 'My Group',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            await new GridColumns(api, 'open').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);

            api.setColumnGroupOpened('myGroup', false);

            await new GridColumns(api, 'closed via API').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);

            api.setColumnGroupOpened('myGroup', true);

            await new GridColumns(api, 'reopened via API').checkColumns(`
                CENTER
                └─┬ "My Group" GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
        });
    });

    describe('column visibility via API and verification', () => {
        test('hide and show columns validates DOM and model', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', headerName: 'Alpha' },
                    { colId: 'b', headerName: 'Beta' },
                    { colId: 'c', headerName: 'Gamma' },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            await new GridColumns(api, 'all visible').checkColumns(`
                CENTER
                ├── a "Alpha" width:200
                ├── b "Beta" width:200
                └── c "Gamma" width:200
            `);

            // Hide middle column
            api.setColumnsVisible(['b'], false);

            await new GridColumns(api, 'b hidden').checkColumns(`
                CENTER
                ├── a "Alpha" width:200
                └── c "Gamma" width:200
            `);

            // Verify header cell for b is NOT in DOM
            const gridDiv = getGridElement(api)! as HTMLElement;
            const bHeader = gridDiv.querySelector('[col-id="b"].ag-header-cell');
            expect(bHeader).toBeNull();

            // Show b again
            api.setColumnsVisible(['b'], true);

            await new GridColumns(api, 'b visible again').checkColumns(`
                CENTER
                ├── a "Alpha" width:200
                ├── b "Beta" width:200
                └── c "Gamma" width:200
            `);
        });
    });

    describe('column pinning via API and DOM verification', () => {
        test('pinning column moves it to correct section in DOM', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['c'], 'right');

            await new GridColumns(api, 'pinned').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);

            // Verify header cells are in correct containers
            const gridDiv = getGridElement(api)! as HTMLElement;
            const leftHeader = gridDiv.querySelector('.ag-grid-pinned-left-cells [col-id="a"]');
            const centerHeader = gridDiv.querySelector('.ag-grid-scrolling-cells [col-id="b"]');
            const rightHeader = gridDiv.querySelector('.ag-grid-pinned-right-cells [col-id="c"]');

            expect(leftHeader).not.toBeNull();
            expect(centerHeader).not.toBeNull();
            expect(rightHeader).not.toBeNull();
        });
    });

    describe('sort and filter indicators in DOM', () => {
        test('sorted column has aria-sort attribute on header', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', sort: 'asc' }, { colId: 'b', sort: 'desc' }, { colId: 'c' }],
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const headerA = gridDiv.querySelector('[col-id="a"].ag-header-cell');
            const headerB = gridDiv.querySelector('[col-id="b"].ag-header-cell');
            const headerC = gridDiv.querySelector('[col-id="c"].ag-header-cell');

            expect(headerA?.getAttribute('aria-sort')).toBe('ascending');
            expect(headerB?.getAttribute('aria-sort')).toBe('descending');
            // c has no sort — aria-sort should be 'none' or absent
            const cSort = headerC?.getAttribute('aria-sort');
            expect(cSort === null || cSort === 'none').toBe(true);

            await new GridColumns(api, 'with sort indicators').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                ├── b width:200 sort:desc
                └── c width:200
            `);
        });

        test('filtered column has ag-header-cell-filtered class', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'name', filter: 'agTextColumnFilter' },
                    { field: 'value', filter: 'agNumberColumnFilter' },
                ],
                rowData: [
                    { name: 'Alice', value: 10 },
                    { name: 'Bob', value: 20 },
                ],
            });

            // Apply filter on name
            api.setFilterModel({
                name: { type: 'contains', filter: 'Alice' },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const nameHeader = gridDiv.querySelector('[col-id="name"].ag-header-cell');
            const valueHeader = gridDiv.querySelector('[col-id="value"].ag-header-cell');

            expect(nameHeader?.classList.contains('ag-header-cell-filtered')).toBe(true);
            expect(valueHeader?.classList.contains('ag-header-cell-filtered')).toBe(false);

            await new GridColumns(api, 'with filter').checkColumns(`
                CENTER
                ├── name "Name" width:200 filter
                └── value "Value" width:200
            `);
        });
    });

    describe('multiple sort interactions', () => {
        test('shift-click to add multi-sort', async () => {
            const user = userEvent.setup();
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', sortable: true },
                    { field: 'b', sortable: true },
                ],
                rowData: [{ a: 1, b: 2 }],
            });

            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;

            // Click a to sort asc
            const headerA = getByTestId(gridDiv, agTestIdFor.headerCell('a'));
            await user.click(headerA.querySelector('.ag-header-cell-label')!);
            await asyncSetTimeout(1);

            await new GridColumns(api, 'a sorted').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200
            `);

            // Shift-click b to add multi-sort
            const headerB = getByTestId(gridDiv, agTestIdFor.headerCell('b'));
            await user.keyboard('{Shift>}');
            await user.click(headerB.querySelector('.ag-header-cell-label')!);
            await user.keyboard('{/Shift}');
            await asyncSetTimeout(1);

            await new GridColumns(api, 'multi-sort').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200 sort:asc sortIndex:1
            `);
        });
    });
});
