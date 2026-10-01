import { findByText, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
    TestGridsManager,
    asyncSetTimeout,
    canvasPolyfill,
    getVisibleTooltips as getTooltips,
    waitForTooltips,
} from 'ag-test-utils';

import type { AgColumn, ColDef, GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

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
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            ...extraOptions,
        });
        return { api, gridDiv: getGridElement(api)! as HTMLElement };
    }

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
        // The header tooltip callback reads valueFormatted, which the tooltip service resolves from the
        // display name on each read, so a rename underneath the header must surface in the tooltip.
        const { api } = await createGrid([
            {
                field: 'athlete',
                headerNameEditable: true,
                headerTooltip: (params) => params.valueFormatted ?? '',
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

/**
 * A rename made while a column's pill is already showing in a drop zone must relabel that pill. Each
 * test renders the pill before renaming, as a pill built after the rename picks up the new name anyway.
 */
describe('Editable header name — live drop zone pills', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [
        { country: 'Ireland', sport: 'Swimming', year: 2008, total: 3 },
        { country: 'Ireland', sport: 'Rowing', year: 2012, total: 1 },
    ];

    const columnsToolPanel = { toolPanels: ['columns'], defaultToolPanel: 'columns' };

    const pillTexts = (zoneSelector: string): string[] =>
        Array.from(document.querySelectorAll(`${zoneSelector} .ag-column-drop-cell-text`)).map(
            (el) => el.textContent ?? ''
        );

    const rename = (api: GridApi, colId: string, headerName: string | null) =>
        api.applyColumnState({ state: [{ colId, headerName }] });

    test('the Values section relabels its pill and keeps the aggregation function', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'total', headerNameEditable: true, aggFunc: 'sum' },
            ],
            rowData,
            sideBar: columnsToolPanel,
        });
        const values = '.ag-column-drop-vertical.ag-column-drop-aggregation';
        await waitFor(() => expect(pillTexts(values)).toEqual(['sum(Total)']));

        rename(api, 'total', 'NewTotal');
        await waitFor(() => expect(pillTexts(values)).toEqual(['sum(NewTotal)']));

        rename(api, 'total', null);
        await waitFor(() => expect(pillTexts(values)).toEqual(['sum(Total)']));
    });

    test('the Row Groups section relabels only the renamed pill', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', headerNameEditable: true, rowGroup: true },
                { field: 'year', headerNameEditable: true, rowGroup: true },
                { field: 'total' },
            ],
            rowData,
            sideBar: columnsToolPanel,
        });
        const rowGroups = '.ag-column-drop-vertical.ag-column-drop-rowgroup';
        await waitFor(() => expect(pillTexts(rowGroups)).toEqual(['Country', 'Year']));

        rename(api, 'country', 'Nation');
        await waitFor(() => expect(pillTexts(rowGroups)).toEqual(['Nation', 'Year']));
    });

    test('the Column Labels section relabels its pill in pivot mode', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', headerNameEditable: true, pivot: true },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
            sideBar: columnsToolPanel,
        });
        const pivot = '.ag-column-drop-vertical.ag-column-drop-pivot';
        await waitFor(() => expect(pillTexts(pivot)).toEqual(['Sport']));

        rename(api, 'sport', 'Discipline');
        await waitFor(() => expect(pillTexts(pivot)).toEqual(['Discipline']));
    });

    test('the row-group panel above the grid relabels its pill', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'country', headerNameEditable: true, rowGroup: true }, { field: 'total' }],
            rowData,
            rowGroupPanelShow: 'always',
        });
        const rowGroupPanel = '.ag-column-drop-horizontal.ag-column-drop-rowgroup';
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Country']));

        rename(api, 'country', 'Nation');
        await waitFor(() => expect(pillTexts(rowGroupPanel)).toEqual(['Nation']));
    });
});

describe('Editable header name — labels follow a rename made in the UI', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [
        { athlete: 'Michael Phelps', country: 'United States', total: 3, awarded: '2008-08-24' },
        { athlete: 'Ian Thorpe', country: 'Australia', total: 2, awarded: '2004-08-29' },
    ];

    const texts = (selector: string): string =>
        Array.from(document.querySelectorAll(selector))
            .map((el) => el.textContent ?? '')
            .join(' | ');
    const floatingFilterAriaLabels = (): string =>
        Array.from(document.querySelectorAll('.ag-floating-filter input'))
            .map((el) => el.getAttribute('aria-label') ?? '')
            .join(' | ');

    async function commitEditor(name: string): Promise<void> {
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-column-header-edit-popup-editor input');
            expect(el).toBeTruthy();
            return el!;
        });
        await userEvent.clear(input);
        await userEvent.type(input, name);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await waitFor(() => expect(document.querySelector('.ag-column-header-edit-popup-editor')).toBeNull());
    }

    /** Header menu → "Edit Column Name" → type → Enter. */
    async function renameFromHeaderMenu(api: GridApi, colId: string, name: string): Promise<void> {
        api.showColumnMenu(colId);
        await userEvent.click(await findByText(document.body, 'Edit Column Name'));
        await commitEditor(name);
        await waitFor(() => expect(texts(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-text`)).toBe(name));
    }

    /**
     * Columns tool panel entry → right-click → "Edit Column Name", the route for column groups. jsdom gives
     * the virtual list no height, so the entry is built from its model item as the list itself would.
     */
    async function renameFromColumnsToolPanel(api: GridApi, label: string, name: string): Promise<void> {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const { listPanel, item } = await waitFor(() => {
            const panel = (api.getToolPanelInstance('columns') as any)?.primaryColsPanel?.primaryColsListPanel;
            const found = ((panel?.getDisplayedColsList() as any[]) ?? []).find((i) => i.displayName === label);
            expect(found).toBeTruthy();
            return { listPanel: panel, item: found };
        });
        const wrapper = document.createElement('div');
        wrapper.classList.add('ag-virtual-list-item');
        gridDiv.appendChild(wrapper);
        const comp = listPanel['createComponentFromItem'](item, wrapper);
        wrapper.appendChild(comp.getGui());
        wrapper.dispatchEvent(
            new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })
        );
        await userEvent.click(await findByText(gridDiv, 'Edit Column Name'));
        await commitEditor(name);
        listPanel.destroyBean(comp);
        wrapper.remove();
    }

    describe('filters tool panel', () => {
        const createGrid = () =>
            gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', filter: true, headerNameEditable: true },
                    { field: 'country', filter: true },
                ],
                rowData,
                sideBar: { toolPanels: ['filters'], defaultToolPanel: 'filters' },
            });
        const panelTitles = () => texts('.ag-filter-toolpanel-header');

        test('relabels a column while the panel is open', async () => {
            const api = await createGrid();
            await waitFor(() => expect(panelTitles()).toContain('Athlete'));

            await renameFromHeaderMenu(api, 'athlete', 'Competitor');
            await waitFor(() => expect(panelTitles()).toContain('Competitor'));
            expect(panelTitles()).not.toContain('Athlete');
        });

        test('shows the new name when reopened after a rename made while closed', async () => {
            const api = await createGrid();
            await waitFor(() => expect(panelTitles()).toContain('Athlete'));
            api.closeToolPanel();

            await renameFromHeaderMenu(api, 'athlete', 'Competitor');
            api.openToolPanel('filters');
            await waitFor(() => expect(panelTitles()).toContain('Competitor'));
        });

        test('relabels a column group', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        groupId: 'medals',
                        headerName: 'Medals',
                        headerNameEditable: true,
                        children: [
                            { field: 'athlete', filter: true },
                            { field: 'total', filter: true },
                        ],
                    },
                    { field: 'country', filter: true },
                ],
                rowData,
                sideBar: { toolPanels: ['filters', 'columns'], defaultToolPanel: 'filters' },
            });
            await waitFor(() => expect(panelTitles()).toContain('Medals'));
            api.openToolPanel('columns');

            await renameFromColumnsToolPanel(api, 'Medals', 'Awards');
            api.openToolPanel('filters');
            await waitFor(() => expect(panelTitles()).toContain('Awards'));
            expect(panelTitles()).not.toContain('Medals');
        });
    });

    test('new filters tool panel: relabels the filter card', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', headerNameEditable: true },
                { field: 'country', filter: 'agTextColumnFilter' },
            ],
            rowData,
            enableFilterHandlers: true,
            sideBar: { toolPanels: ['filters-new'], defaultToolPanel: 'filters-new' },
        });
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'a' } });
        const cardText = () => texts('.ag-tool-panel-wrapper');
        await waitFor(() => expect(cardText()).toContain('Athlete'));

        await renameFromHeaderMenu(api, 'athlete', 'Competitor');
        await waitFor(() => expect(cardText()).toContain('Competitor'));
        expect(cardText()).not.toContain('Athlete');
    });

    test('group filter: the field select shows the new name when the filter is reopened', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', filter: true, rowGroup: true, headerNameEditable: true },
                { field: 'country', filter: true, rowGroup: true },
            ],
            rowData,
            groupDisplayType: 'singleColumn',
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
        });
        const autoColId = await waitFor(() => {
            const id = document.querySelector('.ag-header-cell[col-id^="ag-Grid-AutoColumn"]')?.getAttribute('col-id');
            expect(id).toBeTruthy();
            return id!;
        });
        const fieldSelect = '.ag-group-filter-field-select-wrapper';
        api.showColumnFilter(autoColId);
        await waitFor(() => expect(texts(fieldSelect)).toContain('Athlete'));
        // The filter popup is modal, so the user dismisses it before reaching the header menu.
        await waitFor(() => {
            document.body.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
            );
            expect(document.querySelector(fieldSelect)).toBeNull();
        });

        await renameFromHeaderMenu(api, 'athlete', 'Competitor');
        api.showColumnFilter(autoColId);
        await waitFor(() => expect(texts(fieldSelect)).toContain('Competitor'));
    });

    test('auto group column: a multipleColumns group column follows its row-group column', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, headerNameEditable: true },
                { field: 'country', rowGroup: true },
            ],
            rowData,
            groupDisplayType: 'multipleColumns',
        });
        const autoHeaders = () => texts('.ag-header-cell[col-id^="ag-Grid-AutoColumn"] .ag-header-cell-text');
        await waitFor(() => expect(autoHeaders()).toBe('Athlete | Country'));

        await renameFromHeaderMenu(api, 'athlete', 'Competitor');
        await waitFor(() => expect(autoHeaders()).toBe('Competitor | Country'));
    });

    describe('floating filter aria-labels', () => {
        class ReadOnlyCustomFilter {
            private readonly gui = document.createElement('div');
            public getGui() {
                return this.gui;
            }
            public isFilterActive() {
                return false;
            }
            public doesFilterPass() {
                return true;
            }
            public getModel() {
                return null;
            }
            public setModel() {}
        }

        test.each<[string, ColDef]>([
            ['text', { field: 'athlete', filter: 'agTextColumnFilter' }],
            ['number', { field: 'total', filter: 'agNumberColumnFilter' }],
            ['date', { field: 'awarded', filter: 'agDateColumnFilter', cellDataType: 'dateString' }],
            ['set', { field: 'athlete', filter: 'agSetColumnFilter' }],
            ['multi', { field: 'athlete', filter: 'agMultiColumnFilter' }],
            ['read-only (custom filter)', { field: 'athlete', filter: ReadOnlyCustomFilter }],
        ])('%s floating filter', async (_name, colDef) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ ...colDef, floatingFilter: true, headerNameEditable: true }],
                rowData,
            });
            const colId = colDef.field!;
            const originalName = colId.charAt(0).toUpperCase() + colId.slice(1);
            await waitFor(() => expect(floatingFilterAriaLabels()).toContain(`${originalName} Filter Input`));

            await renameFromHeaderMenu(api, colId, 'Renamed');
            await waitFor(() => expect(floatingFilterAriaLabels()).toContain('Renamed Filter Input'));
            expect(floatingFilterAriaLabels()).not.toContain(originalName);
        });

        test('group floating filter on a multipleColumns group column', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', filter: true, rowGroup: true, headerNameEditable: true },
                    { field: 'country' },
                ],
                rowData,
                groupDisplayType: 'multipleColumns',
                autoGroupColumnDef: { filter: 'agGroupColumnFilter', floatingFilter: true },
            });
            await waitFor(() => expect(floatingFilterAriaLabels()).toContain('Athlete Filter Input'));

            await renameFromHeaderMenu(api, 'athlete', 'Renamed');
            await waitFor(() => expect(floatingFilterAriaLabels()).toContain('Renamed Filter Input'));
        });
    });
});
