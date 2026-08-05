import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type { AgColumn, ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, canvasPolyfill } from '../test-utils';

/**
 * A renamed header name is stored as an override on the column entity (and the group-id-keyed group
 * map), so it flows through the same display-name resolver the header tooltip and the row-group
 * machinery consume. These tests lock in two behaviours not covered by editable-header-name.test.ts:
 * the header tooltip reflecting a rename, and a leaf rename surviving a row-group/ungroup cycle.
 */
describe('Editable header name — tooltips', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [{ athlete: 'Michael Phelps' }];

    async function createGrid(
        columnDefs: ColDef[],
        extraOptions?: Record<string, any>
    ): Promise<{ api: GridApi; gridDiv: HTMLElement }> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
            tooltipShowDelay: 200,
            ...extraOptions,
        });
        return { api, gridDiv: getGridElement(api)! as HTMLElement };
    }

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });

    async function hoverHeader(): Promise<void> {
        const headerCell = await waitFor(
            () => document.querySelector('.ag-header-cell[col-id="athlete"]') as HTMLElement
        );
        await userEvent.hover(headerCell);
    }

    async function unhoverHeader(): Promise<void> {
        const headerCell = document.querySelector('.ag-header-cell[col-id="athlete"]') as HTMLElement;
        await userEvent.unhover(headerCell);
        await waitForTooltips(0);
    }

    test('the header tooltip reflects the edited name after a rename', async () => {
        // headerTooltipValueGetter reads valueFormatted, which the tooltip service resolves from the
        // display name on each read, so a rename underneath the header must surface in the tooltip.
        const { api } = await createGrid([
            {
                field: 'athlete',
                headerNameEditable: true,
                headerTooltipValueGetter: (params) => params.valueFormatted ?? '',
            },
        ]);

        await hoverHeader();
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Athlete');
        await unhoverHeader();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() =>
            expect(document.querySelector('.ag-header-cell[col-id="athlete"] .ag-header-cell-text')?.textContent).toBe(
                'Renamed'
            )
        );

        await hoverHeader();
        await waitFor(
            () => {
                expect(getTooltips().length).toBe(1);
                expect(getTooltips()[0]).toHaveTextContent('Renamed');
            },
            { timeout: 2000 }
        );
    });

    test('a static headerTooltip string is unaffected by a rename', async () => {
        // headerTooltip is a fixed string independent of the display name, so a rename does not touch it.
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true, headerTooltip: 'Static tip' }]);

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        const column = api.getColumn('athlete') as unknown as AgColumn;
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));

        await hoverHeader();
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Static tip');
    });
});

/**
 * Each HeaderLocation surface resolves the name through the same getHeaderName override short-circuit,
 * so an edited name must appear wherever the column is rendered — not just in the header cell. Each test
 * renders the surface and asserts the edited name in its real output. `headerValueGetter` is present so
 * the assertions also prove the override wins over it. The 'chart' location is covered separately (it
 * needs the AG Charts module and canvas polyfill); 'model' is SSRM-internal metadata and not rendered.
 */
describe('Editable header name — rendered header locations', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [
        { athlete: 'Michael Phelps', country: 'United States', age: 23 },
        { athlete: 'Ian Thorpe', country: 'Australia', age: 24 },
    ];

    const RENAMED = 'Renamed';
    const editedAthlete = (extra: Partial<ColDef> = {}): ColDef => ({
        field: 'athlete',
        headerNameEditable: true,
        headerValueGetter: () => 'From Getter',
        ...extra,
    });
    const initialRename = {
        columnHeaderName: { columnHeaderNames: [{ colId: 'athlete', headerName: RENAMED }] },
    };

    const panelText = (selector: string): string =>
        Array.from(document.querySelectorAll(selector))
            .map((el) => el.textContent ?? '')
            .join(' | ');

    test('header: the edited name renders as the header cell text', async () => {
        await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete(), { field: 'country' }],
            rowData,
            initialState: initialRename,
        });
        await waitFor(() =>
            expect(document.querySelector('.ag-header-cell[col-id="athlete"] .ag-header-cell-text')?.textContent).toBe(
                RENAMED
            )
        );
    });

    test('csv: the edited name is used in the exported header row', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete(), { field: 'country' }],
            rowData,
            initialState: initialRename,
        });

        const headerRow = await waitFor(() => {
            const row = api.getDataAsCsv()!.split('\n')[0];
            expect(row).toContain(RENAMED);
            return row;
        });
        expect(headerRow).not.toContain('From Getter');
    });

    test('columnToolPanel: the edited name renders as the tool-panel column label', async () => {
        await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete(), { field: 'country' }],
            rowData,
            initialState: initialRename,
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
        await waitFor(() => expect(panelText('.ag-column-select-column-label')).toContain(RENAMED));
    });

    test('columnDrop: the edited name renders in the row-group panel pill', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete(), { field: 'country' }, { field: 'age' }],
            rowData,
            initialState: initialRename,
            rowGroupPanelShow: 'always',
        });
        api.addRowGroupColumns(['athlete']);
        await waitFor(() => expect(panelText('.ag-column-drop-cell-text')).toContain(RENAMED));
    });

    test('filterToolPanel: the edited name renders as the filters tool-panel group title', async () => {
        await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete({ filter: true }), { field: 'country', filter: true }],
            rowData,
            initialState: initialRename,
            sideBar: { toolPanels: ['filters'], defaultToolPanel: 'filters' },
        });
        await waitFor(() => expect(panelText('.ag-filter-toolpanel-header')).toContain(RENAMED));
    });

    test('advancedFilter: the edited name renders in the column autocomplete', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete({ filter: true }), { field: 'country', filter: true }],
            rowData,
            initialState: initialRename,
            enableAdvancedFilter: true,
        });
        await asyncSetTimeout(0);

        const input = getGridElement(api)!.querySelector('.ag-advanced-filter input[type=text]') as HTMLInputElement;
        input.value = '[';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(0);

        await waitFor(() => expect(panelText('.ag-autocomplete-list-popup')).toContain(RENAMED));
    });

    test('groupFilter: the edited name renders in the group filter field select', async () => {
        // Two row-grouped columns make the group filter render its column field-select, whose options
        // are labelled by display name; the first (athlete) is selected, so its edited name shows.
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [editedAthlete({ filter: true }), { field: 'country', filter: true }, { field: 'age' }],
            rowData,
            initialState: initialRename,
            groupDisplayType: 'singleColumn',
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
        });
        api.addRowGroupColumns(['athlete', 'country']);
        await waitFor(() => expect(api.getRowGroupColumns().length).toBe(2));

        const autoCol = document.querySelector('.ag-header-cell[col-id^="ag-Grid-AutoColumn"]')?.getAttribute('col-id');
        expect(autoCol).toBeTruthy();
        api.showColumnFilter(autoCol!);
        await waitFor(() => expect(panelText('.ag-group-filter-field-select-wrapper')).toContain(RENAMED));
    });
});

describe('Editable header name — integrated charts location', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule.with(AgChartsEnterpriseModule)],
    });

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());
    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    test('chart: the edited name renders in the chart data tool panel', async () => {
        // The chart resolves each column name via the 'chart' location; the data tool panel renders those
        // names, so an edited value-column name must appear there. Rename the charted value column 'gold'.
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country' },
                { field: 'gold', headerNameEditable: true, headerValueGetter: () => 'From Getter' },
            ],
            rowData: [
                { country: 'United States', gold: 3 },
                { country: 'Australia', gold: 2 },
            ],
            initialState: { columnHeaderName: { columnHeaderNames: [{ colId: 'gold', headerName: 'Renamed' }] } },
        });

        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold'] },
            chartType: 'groupedColumn',
        })!;
        expect(chartRef).toBeTruthy();

        api.openChartToolPanel({ chartId: chartRef.chartId, panel: 'data' });
        await waitFor(() => expect(document.querySelector('.ag-chart-data-wrapper')?.textContent).toContain('Renamed'));

        // The settings panel schedules an unguarded 250ms scroll-into-view; let it run while the chart is
        // still mounted so it does not fire against a torn-down component after this test completes.
        // eslint-disable-next-line no-restricted-syntax -- 250ms chart settings-panel scroll-into-view timer
        await asyncSetTimeout(300);
    });
});

describe('Editable header name — row grouping', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Ian Thorpe', country: 'Australia' },
    ];

    async function createGrid(): Promise<GridApi> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true }, { field: 'country' }],
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
        });
        return api;
    }

    test('a renamed leaf column keeps its edited name through a row-group and ungroup cycle', async () => {
        // The override lives on the persistent AgColumn, not on a colDef that grouping regenerates,
        // so grouping by the column and ungrouping again must both preserve the edited name.
        const api = await createGrid();
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed'));

        api.addRowGroupColumns(['athlete']);
        await waitFor(() => expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['athlete']));
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        api.removeRowGroupColumns(['athlete']);
        await waitFor(() => expect(api.getRowGroupColumns()).toEqual([]));
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');
    });

    test('a renamed leaf column that is row-grouped still exports its edited name to grid state', async () => {
        const api = await createGrid();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        api.addRowGroupColumns(['athlete']);

        await waitFor(() =>
            expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([
                { colId: 'athlete', headerName: 'Renamed' },
            ])
        );
    });
});
