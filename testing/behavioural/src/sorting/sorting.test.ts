import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Sorting', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    test('user comparator returning undefined falls back to next column', async () => {
        const api = gridMgr.createGrid('comparator-undefined', {
            columnDefs: [
                {
                    colId: 'primary',
                    field: 'primary',
                    comparator: (a: string, b: string) => {
                        const firstCharA = a?.[0];
                        const firstCharB = b?.[0];
                        if (firstCharA === firstCharB) {
                            return undefined as any;
                        }
                        return firstCharA > firstCharB ? 1 : -1;
                    },
                },
                { field: 'secondary' },
            ],
            rowData: [
                { id: 'cmp-u-1', primary: 'ax', secondary: 'b' },
                { id: 'cmp-u-2', primary: 'ay', secondary: 'a' },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'primary', sort: 'asc' },
                { colId: 'secondary', sort: 'asc' },
            ],
        });

        await new GridRows(api, 'comparator undefined fallback').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:cmp-u-2 primary:"ay" secondary:"a"
            └── LEAF id:cmp-u-1 primary:"ax" secondary:"b"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── primary "Primary" width:200 sort:asc
            └── secondary "Secondary" width:200 sort:asc
        `);
    });

    beforeAll(() => setupAgTestIds());

    afterEach(() => {
        gridMgr.reset();
    });

    test('the sort-order index badge shows only in a multi-column sort', async () => {
        const api = await gridMgr.createGridAndWait('sort-order-badge', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 2 }],
        });
        await asyncSetTimeout(0);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const sortOrderEl = (colId: string) =>
            getByTestId(gridDiv, agTestIdFor.headerCell(colId)).querySelector('.ag-sort-order');

        // Single-column sort: no ordinal badge (the lone sorted column needs no priority number).
        api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }], defaultState: { sort: null } });
        await asyncSetTimeout(1);
        expect(sortOrderEl('a')?.classList.contains('ag-hidden')).toBe(true);

        // Multi-column sort: every sorted column shows its 1-based priority.
        api.applyColumnState({
            state: [
                { colId: 'a', sort: 'asc', sortIndex: 0 },
                { colId: 'b', sort: 'asc', sortIndex: 1 },
            ],
        });
        await asyncSetTimeout(1);
        expect(sortOrderEl('a')?.classList.contains('ag-hidden')).toBe(false);
        expect(sortOrderEl('a')?.textContent).toBe('1');
        expect(sortOrderEl('b')?.textContent).toBe('2');
    });

    const columnDefs = [{ field: 'sport', sortable: false }, { field: 'year' }, { field: 'amount' }, { field: 'day' }];
    const rowData = [
        { sport: 'football', year: 2021, amount: 43, day: 'monday' },
        { sport: 'rugby', year: 2020, amount: 102, day: 'sunday' },
        { sport: 'tennis', year: 2018, amount: 235, day: 'thursday' },
        { sport: 'cricket', year: 2003, amount: 11, day: 'friday' },
        { sport: 'golf', year: 2021, amount: 7, day: 'monday' },
        { sport: 'swimming', year: 2020, amount: 93, day: 'tuesday' },
        { sport: 'rowing', year: 2019, amount: 32, day: 'saturday' },
    ];

    test('Cannot sort when sortable: false', async () => {
        const userSession = userEvent.setup();
        const listener = vitest.fn();

        const api = await gridMgr.createGridAndWait('grid1', {
            columnDefs,
            rowData,
            onSortChanged: listener,
        });

        // wait for test ids to attach
        await asyncSetTimeout(0);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const header = getByTestId(gridDiv, agTestIdFor.headerCell('sport'));

        await userSession.click(header.querySelector('.ag-header-cell-label')!);
        await asyncSetTimeout(1);

        expect(listener).not.toHaveBeenCalled();

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── sport "Sport" width:200 !sortable
            ├── year "Year" width:200
            ├── amount "Amount" width:200
            └── day "Day" width:200
        `);
    });

    test('GridRows snapshot changes after column sort', async () => {
        const api = gridMgr.createGrid('gridRowsSnapshot', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data?.sport,
        });

        await new GridRows(api, 'initial order').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:football sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:rugby sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:tennis sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:cricket sport:"cricket" year:2003 amount:11 day:"friday"
            ├── LEAF id:golf sport:"golf" year:2021 amount:7 day:"monday"
            ├── LEAF id:swimming sport:"swimming" year:2020 amount:93 day:"tuesday"
            └── LEAF id:rowing sport:"rowing" year:2019 amount:32 day:"saturday"
        `);

        api.applyColumnState({
            state: [{ colId: 'amount', sort: 'desc' }],
        });

        await new GridRows(api, 'amount desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:tennis sport:"tennis" year:2018 amount:235 day:"thursday"
            ├── LEAF id:rugby sport:"rugby" year:2020 amount:102 day:"sunday"
            ├── LEAF id:swimming sport:"swimming" year:2020 amount:93 day:"tuesday"
            ├── LEAF id:football sport:"football" year:2021 amount:43 day:"monday"
            ├── LEAF id:rowing sport:"rowing" year:2019 amount:32 day:"saturday"
            ├── LEAF id:cricket sport:"cricket" year:2003 amount:11 day:"friday"
            └── LEAF id:golf sport:"golf" year:2021 amount:7 day:"monday"
        `);
    });

    test('sorts numeric values ascending and descending', async () => {
        const api = gridMgr.createGrid('numericSort', {
            columnDefs: [{ field: 'value' }],
            rowData: [
                { id: 'x', value: 17 },
                { id: 'y', value: -4 },
                { id: 'z', value: 9 },
            ],
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'numeric initial').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x value:17
            ├── LEAF id:y value:-4
            └── LEAF id:z value:9
        `);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'numeric asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:y value:-4
            ├── LEAF id:z value:9
            └── LEAF id:x value:17
        `);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await new GridRows(api, 'numeric desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:x value:17
            ├── LEAF id:z value:9
            └── LEAF id:y value:-4
        `);
    });

    test('sorts bigint values ascending, descending, and absolute', async () => {
        const api = gridMgr.createGrid('bigintSort', {
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: 'bigint',
                    valueFormatter: (params) => (params.value == null ? '' : `${params.value}n`),
                },
            ],
            rowData: [
                { id: 'a', value: 9007199254740993n },
                { id: 'b', value: -5n },
                { id: 'c', value: 10n },
            ],
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'bigint initial').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a value:"9007199254740993n"
            ├── LEAF id:b value:"-5n"
            └── LEAF id:c value:"10n"
        `);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'bigint asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:b value:"-5n"
            ├── LEAF id:c value:"10n"
            └── LEAF id:a value:"9007199254740993n"
        `);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await new GridRows(api, 'bigint desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:a value:"9007199254740993n"
            ├── LEAF id:c value:"10n"
            └── LEAF id:b value:"-5n"
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc', sortIndex: 0, sortType: 'absolute' }],
        });

        await new GridRows(api, 'bigint absolute asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:b value:"-5n"
            ├── LEAF id:c value:"10n"
            └── LEAF id:a value:"9007199254740993n"
        `);
    });

    test('accentedSort toggles locale aware ordering', async () => {
        const namesRowData = [
            { id: 'accent-1', name: 'Zorro' },
            { id: 'accent-2', name: 'Álvaro' },
            { id: 'accent-3', name: 'Ana' },
        ];

        const plainApi = gridMgr.createGrid('accented-off', {
            columnDefs: [{ field: 'name' }],
            rowData: namesRowData,
            getRowId: (params) => params.data?.id,
        });

        plainApi.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });

        await new GridRows(plainApi, 'accentedSort false').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:accent-3 name:"Ana"
            ├── LEAF id:accent-1 name:"Zorro"
            └── LEAF id:accent-2 name:"Álvaro"
        `);

        const accentedApi = gridMgr.createGrid('accented-on', {
            columnDefs: [{ field: 'name' }],
            accentedSort: true,
            rowData: namesRowData,
            getRowId: (params) => params.data?.id,
        });

        accentedApi.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });

        await new GridRows(accentedApi, 'accentedSort true').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:accent-2 name:"Álvaro"
            ├── LEAF id:accent-3 name:"Ana"
            └── LEAF id:accent-1 name:"Zorro"
        `);
    });

    test('sort honours custom valueGetter output', async () => {
        const api = gridMgr.createGrid('valueGetterSort', {
            columnDefs: [
                {
                    colId: 'alias',
                    headerName: 'Alias',
                    valueGetter: (params) => {
                        const data = params.data;
                        return data ? `${data.priority}-${data.city}` : '';
                    },
                },
                { field: 'city' },
            ],
            rowData: [
                { id: 'vg-1', city: 'Oslo', priority: 2 },
                { id: 'vg-2', city: 'Berlin', priority: 1 },
                { id: 'vg-3', city: 'Zurich', priority: 3 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'alias', sort: 'asc' }] });

        await new GridRows(api, 'valueGetter asc').check(`
            ROOT id:ROOT_NODE_ID alias:""
            ├── LEAF id:vg-2 alias:"1-Berlin" city:"Berlin"
            ├── LEAF id:vg-1 alias:"2-Oslo" city:"Oslo"
            └── LEAF id:vg-3 alias:"3-Zurich" city:"Zurich"
        `);

        api.applyColumnState({ state: [{ colId: 'alias', sort: 'desc' }] });

        await new GridRows(api, 'valueGetter desc').check(`
            ROOT id:ROOT_NODE_ID alias:""
            ├── LEAF id:vg-3 alias:"3-Zurich" city:"Zurich"
            ├── LEAF id:vg-1 alias:"2-Oslo" city:"Oslo"
            └── LEAF id:vg-2 alias:"1-Berlin" city:"Berlin"
        `);
    });

    test('custom comparator sorts by string length', async () => {
        const api = gridMgr.createGrid('comparatorSort', {
            columnDefs: [
                {
                    field: 'product',
                    comparator: (a, b) => a.length - b.length || a.localeCompare(b),
                },
            ],
            rowData: [
                { id: 'cmp-1', product: 'Pineapple' },
                { id: 'cmp-2', product: 'Kiwi' },
                { id: 'cmp-3', product: 'Apple' },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'product', sort: 'asc' }] });

        await new GridRows(api, 'comparator asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:cmp-2 product:"Kiwi"
            ├── LEAF id:cmp-3 product:"Apple"
            └── LEAF id:cmp-1 product:"Pineapple"
        `);

        api.applyColumnState({ state: [{ colId: 'product', sort: 'desc' }] });

        await new GridRows(api, 'comparator desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:cmp-1 product:"Pineapple"
            ├── LEAF id:cmp-3 product:"Apple"
            └── LEAF id:cmp-2 product:"Kiwi"
        `);
    });

    test('missing values are grouped at sort edges', async () => {
        const api = gridMgr.createGrid('missingSort', {
            columnDefs: [{ field: 'value' }],
            rowData: [
                { id: 'missing-null', value: null },
                { id: 'positive', value: 5 },
                { id: 'negative', value: -7 },
                { id: 'zero', value: 0 },
                { id: 'missing-undefined', value: undefined },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'missing asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:missing-null value:null
            ├── LEAF id:missing-undefined
            ├── LEAF id:negative value:-7
            ├── LEAF id:zero value:0
            └── LEAF id:positive value:5
        `);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await new GridRows(api, 'missing desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:positive value:5
            ├── LEAF id:zero value:0
            ├── LEAF id:negative value:-7
            ├── LEAF id:missing-null value:null
            └── LEAF id:missing-undefined
        `);
    });

    test('absolute sort orders by magnitude', async () => {
        const api = gridMgr.createGrid('absoluteSort', {
            columnDefs: [{ field: 'amount', sortIndex: 0 }],
            rowData: [
                { id: 'abs-a', amount: -20 },
                { id: 'abs-b', amount: 5 },
                { id: 'abs-c', amount: -3 },
                { id: 'abs-d', amount: 1 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'asc', sortType: 'absolute' }] });

        await new GridRows(api, 'absolute asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:abs-d amount:1
            ├── LEAF id:abs-c amount:-3
            ├── LEAF id:abs-b amount:5
            └── LEAF id:abs-a amount:-20
        `);

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'desc', sortType: 'absolute' }] });

        await new GridRows(api, 'absolute desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:abs-a amount:-20
            ├── LEAF id:abs-b amount:5
            ├── LEAF id:abs-c amount:-3
            └── LEAF id:abs-d amount:1
        `);
    });

    test('comparator dictionary selects the entry matching the sort type', async () => {
        const api = gridMgr.createGrid('comparatorDict', {
            columnDefs: [
                {
                    field: 'amount',
                    comparator: {
                        default: (a: number, b: number) => b - a, // reverse signed
                        absolute: (a: number, b: number) => Math.abs(b) - Math.abs(a), // reverse magnitude
                    },
                },
            ],
            rowData: [
                { id: 'c-a', amount: -20 },
                { id: 'c-b', amount: 5 },
                { id: 'c-c', amount: -3 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'asc' }] });
        await new GridRows(api, 'comparator dict: default entry').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:c-b amount:5
            ├── LEAF id:c-c amount:-3
            └── LEAF id:c-a amount:-20
        `);

        api.applyColumnState({ state: [{ colId: 'amount', sort: 'asc', sortType: 'absolute' }] });
        await new GridRows(api, 'comparator dict: absolute entry').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:c-a amount:-20
            ├── LEAF id:c-b amount:5
            └── LEAF id:c-c amount:-3
        `);
    });

    describe('coupled group sort via row group panel chip', () => {
        const groupGridMgr = new TestGridsManager({
            modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule],
        });

        afterEach(() => groupGridMgr.reset());

        test('clearing the group column sort via the country chip clears its sort-order badge', async () => {
            const api = await groupGridMgr.createGridAndWait('coupled-group-chip-sort', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, sortable: true },
                    { field: 'year', sortable: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowGroupPanelShow: 'always',
                rowData: [
                    { country: 'Ireland', year: 2000 },
                    { country: 'Ireland', year: 2004 },
                    { country: 'Spain', year: 2008 },
                ],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const groupSortOrderEl = () =>
                gridDiv.querySelector('.ag-header-cell[col-id="ag-Grid-AutoColumn"] .ag-sort-order');
            const groupHeaderLabel = () =>
                gridDiv.querySelector(
                    '.ag-header-cell[col-id="ag-Grid-AutoColumn"] .ag-header-cell-label'
                ) as HTMLElement;
            const countryChip = () => {
                const chip = gridDiv.querySelector(
                    '.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell'
                ) as HTMLElement | null;
                if (!chip) {
                    throw new Error('country chip not found in the row group panel');
                }
                return chip;
            };
            const shiftClick = (el: HTMLElement) =>
                el.dispatchEvent(new MouseEvent('click', { shiftKey: true, bubbles: true, cancelable: true }));
            const shown = (el: Element | null | undefined) => !!el && !el.classList.contains('ag-hidden');
            const groupArrowShown = () => {
                const header = gridDiv.querySelector('.ag-header-cell[col-id="ag-Grid-AutoColumn"]');
                return (
                    shown(header?.querySelector('.ag-sort-ascending-icon')) ||
                    shown(header?.querySelector('.ag-sort-descending-icon')) ||
                    shown(header?.querySelector('.ag-sort-mixed-icon'))
                );
            };
            const yearSort = () => api.getColumnState().find((s) => s.colId === 'year')?.sort ?? null;

            // Sort year (single), then shift-add the group column via its header → multi-sort; the group
            // column joins the sort and shows an ordinal badge + a sort arrow.
            api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }], defaultState: { sort: null } });
            await asyncSetTimeout(1);
            shiftClick(groupHeaderLabel());
            await asyncSetTimeout(1);
            expect(shown(groupSortOrderEl())).toBe(true);
            expect(groupSortOrderEl()?.textContent).toMatch(/^\d+$/);
            expect(groupArrowShown()).toBe(true);

            // Shift-click the country chip once: cycles the group column's sort asc → desc; still sorted, still badged.
            shiftClick(countryChip());
            await asyncSetTimeout(1);
            expect(shown(groupSortOrderEl())).toBe(true);
            expect(groupSortOrderEl()?.textContent).toMatch(/^\d+$/);

            // Shift-click again: cycles desc → none. With the group column's sort cleared, its header must show
            // neither the sort-order index badge (AC1) nor a sort arrow (AC2), while year stays sorted.
            shiftClick(countryChip());
            await asyncSetTimeout(1);
            expect(shown(groupSortOrderEl())).toBe(false);
            expect(groupArrowShown()).toBe(false);
            expect(yearSort()).toBe('asc');
        });

        test('single-sort clearing one source chip leaves no stale group sort when a sibling source was still sorted', async () => {
            const api = await groupGridMgr.createGridAndWait('coupled-multi-source-chip-clear', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, sortable: true },
                    { field: 'sport', rowGroup: true, hide: true, sortable: true },
                    { field: 'year', sortable: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowGroupPanelShow: 'always',
                rowData: [
                    { country: 'Ireland', sport: 'Rowing', year: 2000 },
                    { country: 'Spain', sport: 'Swimming', year: 2004 },
                ],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const groupHeaderLabel = () =>
                gridDiv.querySelector(
                    '.ag-header-cell[col-id="ag-Grid-AutoColumn"] .ag-header-cell-label'
                ) as HTMLElement;
            const chipByText = (re: RegExp) => {
                const chips = Array.from(
                    gridDiv.querySelectorAll('.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell')
                ) as HTMLElement[];
                const chip = chips.find((c) => re.test(c.textContent ?? ''));
                if (!chip) {
                    throw new Error(`row group panel chip matching ${re} not found`);
                }
                return chip;
            };
            const click = (el: HTMLElement) =>
                el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            const groupCol = () => api.getColumn('ag-Grid-AutoColumn')!;

            // Single-sort the coupled group column to 'desc' via its header (two clicks). Both source
            // columns (country, sport) and the display column end up sorted 'desc'.
            click(groupHeaderLabel());
            await asyncSetTimeout(1);
            click(groupHeaderLabel());
            await asyncSetTimeout(1);
            expect(groupCol().getSort()).toBe('desc');
            expect(api.getColumn('country')!.getSort()).toBe('desc');
            expect(api.getColumn('sport')!.getSort()).toBe('desc');

            // Single-click the country chip: cycles country 'desc' → none. In single-sort mode this also
            // clears the still-sorted sibling 'sport'. With every source now unsorted, the group column
            // must not read the about-to-be-cleared 'sport' sort — its own sort/index must clear too.
            click(chipByText(/country/i));
            await asyncSetTimeout(1);
            expect(api.getColumn('country')!.getSort()).toBeFalsy();
            expect(api.getColumn('sport')!.getSort()).toBeFalsy();
            expect(groupCol().getSort()).toBeFalsy();
            expect(groupCol().getSortIndex()).toBeFalsy();
        });

        test('multi-sort clearing one source chip leaves the group column sorted while a sibling source stays sorted', async () => {
            const api = await groupGridMgr.createGridAndWait('coupled-multi-source-chip-multi-sort', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, sortable: true },
                    { field: 'sport', rowGroup: true, hide: true, sortable: true },
                    { field: 'year', sortable: true },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowGroupPanelShow: 'always',
                rowData: [
                    { country: 'Ireland', sport: 'Rowing', year: 2000 },
                    { country: 'Spain', sport: 'Swimming', year: 2004 },
                ],
            });
            await asyncSetTimeout(0);

            const gridDiv = getGridElement(api)! as HTMLElement;
            const chipByText = (re: RegExp) => {
                const chips = Array.from(
                    gridDiv.querySelectorAll('.ag-column-drop-horizontal-rowgroup .ag-column-drop-cell')
                ) as HTMLElement[];
                const chip = chips.find((c) => re.test(c.textContent ?? ''));
                if (!chip) {
                    throw new Error(`row group panel chip matching ${re} not found`);
                }
                return chip;
            };
            const shiftClick = (el: HTMLElement) =>
                el.dispatchEvent(new MouseEvent('click', { shiftKey: true, bubbles: true, cancelable: true }));
            const groupCol = () => api.getColumn('ag-Grid-AutoColumn')!;

            // Multi-sort both group sources via their chips: country asc, then sport asc (shift-add). Both
            // sources and the coupled display column are sorted.
            shiftClick(chipByText(/country/i));
            await asyncSetTimeout(1);
            shiftClick(chipByText(/sport/i));
            await asyncSetTimeout(1);
            expect(api.getColumn('country')!.getSort()).toBe('asc');
            expect(api.getColumn('sport')!.getSort()).toBe('asc');
            expect(groupCol().getSort()).toBe('asc');

            // Shift-click the country chip twice: cycles country asc → desc → none, clearing only that source
            // (multi-sort leaves siblings alone). country is the FIRST source, so the display column must skip
            // it and read the still-sorted sport sibling — staying sorted rather than clearing.
            shiftClick(chipByText(/country/i));
            await asyncSetTimeout(1);
            shiftClick(chipByText(/country/i));
            await asyncSetTimeout(1);
            expect(api.getColumn('country')!.getSort()).toBeFalsy();
            expect(api.getColumn('sport')!.getSort()).toBe('asc');
            expect(groupCol().getSort()).toBe('asc');
        });
    });
});
