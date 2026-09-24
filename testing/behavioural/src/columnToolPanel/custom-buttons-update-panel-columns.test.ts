import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type {
    AgColumn,
    ColDef,
    ColumnState,
    ColumnToolPanelButtonActionParams,
    GridApi,
    IColumnStateUpdateStrategy,
    IToolPanelColumnCompParams,
    SideBarDef,
} from 'ag-grid-community';
import { enableDevValidations, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

type UpdatePanelColumnsParams = Parameters<ColumnToolPanelButtonActionParams['updatePanelColumns']>[0];

interface Scenario {
    name: string;
    pivotMode?: boolean;
    /** Changes applied directly to both grids before the button is clicked, e.g. to move away from a saved state. */
    setup?: (api: GridApi) => void;
    /** The params passed to `updatePanelColumns` / `api.applyColumnState`. `savedState` is captured at grid creation. */
    getParams: (savedState: ColumnState[]) => UpdatePanelColumnsParams;
}

const scenarios: Scenario[] = [
    {
        name: 'hides and shows columns',
        getParams: () => ({
            state: [
                { colId: 'athlete', hide: true },
                { colId: 'bronze', hide: false },
            ],
        }),
    },
    {
        name: 'reorders columns with applyOrder',
        getParams: () => ({
            state: ['sport', 'athlete', 'year', 'silver', 'gold', 'bronze', 'country'].map((colId) => ({ colId })),
            applyOrder: true,
        }),
    },
    {
        name: 'adds row groups in rowGroupIndex order',
        getParams: () => ({
            state: [
                { colId: 'sport', rowGroup: true, rowGroupIndex: 0 },
                { colId: 'year', rowGroup: true, rowGroupIndex: 2 },
            ],
        }),
    },
    {
        name: 'reorders an active row group with rowGroupIndex',
        setup: (api) => api.applyColumnState({ state: [{ colId: 'sport', rowGroup: true }] }),
        getParams: () => ({ state: [{ colId: 'sport', rowGroupIndex: 0 }] }),
    },
    {
        name: 'removes a row group',
        getParams: () => ({ state: [{ colId: 'country', rowGroup: false }] }),
    },
    {
        name: 'sets value columns and their agg functions',
        getParams: () => ({
            state: [
                { colId: 'gold', aggFunc: null },
                { colId: 'silver', aggFunc: 'max' },
                { colId: 'bronze', aggFunc: 'avg' },
            ],
        }),
    },
    {
        name: 'orders value columns by valueIndex',
        getParams: () => ({
            state: [
                { colId: 'silver', aggFunc: 'sum', valueIndex: 0 },
                { colId: 'gold', aggFunc: 'sum', valueIndex: 1 },
            ],
        }),
    },
    {
        name: 'reorders an active value column with valueIndex',
        setup: (api) => api.applyColumnState({ state: [{ colId: 'silver', aggFunc: 'sum' }] }),
        getParams: () => ({ state: [{ colId: 'silver', valueIndex: 0 }] }),
    },
    {
        name: 'sorts columns by sortIndex',
        getParams: () => ({
            state: [
                { colId: 'athlete', sort: 'asc', sortIndex: 1 },
                { colId: 'year', sort: 'desc', sortIndex: 0 },
            ],
        }),
    },
    {
        name: 'clears a sort',
        getParams: () => ({ state: [{ colId: 'sport', sort: null }] }),
    },
    {
        name: 'restores a saved state',
        setup: (api) =>
            api.applyColumnState({
                state: [
                    { colId: 'athlete', hide: true },
                    { colId: 'sport', rowGroup: true },
                    { colId: 'silver', aggFunc: 'sum' },
                    { colId: 'year', sort: 'desc' },
                    { colId: 'bronze' },
                    { colId: 'athlete' },
                ],
                applyOrder: true,
            }),
        getParams: (savedState) => ({ state: savedState, applyOrder: true }),
    },
    {
        name: 'adds pivot columns in pivotIndex order',
        pivotMode: true,
        getParams: () => ({
            state: [
                { colId: 'sport', pivot: true, pivotIndex: 0 },
                { colId: 'athlete', pivot: true, pivotIndex: 2 },
            ],
        }),
    },
    {
        name: 'reorders an active pivot column with pivotIndex',
        pivotMode: true,
        setup: (api) => api.applyColumnState({ state: [{ colId: 'athlete', pivot: true }] }),
        getParams: () => ({ state: [{ colId: 'athlete', pivotIndex: 0 }] }),
    },
    {
        name: 'removes a pivot column',
        pivotMode: true,
        getParams: () => ({ state: [{ colId: 'year', pivot: false }] }),
    },
    {
        name: 'sets a pivot sort',
        pivotMode: true,
        getParams: () => ({ state: [{ colId: 'year', pivotSort: 'desc' }] }),
    },
];

describe('column tool panel custom buttons - updatePanelColumns', () => {
    const gridMgr = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const columnDefs: ColDef[] = [
        { field: 'athlete', enableRowGroup: true, enablePivot: true },
        { field: 'country', enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true, sort: 'asc' },
        { field: 'year', enableRowGroup: true, enablePivot: true, pivot: true },
        { field: 'gold', enableValue: true, aggFunc: 'sum' },
        { field: 'silver', enableValue: true },
        { field: 'bronze', enableValue: true, hide: true },
    ];

    const rowData = [
        {
            athlete: 'Michael Phelps',
            country: 'United States',
            sport: 'Swimming',
            year: 2008,
            gold: 8,
            silver: 0,
            bronze: 0,
        },
        { athlete: 'Ian Thorpe', country: 'Australia', sport: 'Swimming', year: 2000, gold: 3, silver: 2, bronze: 0 },
        { athlete: 'Aleksey Nemov', country: 'Russia', sport: 'Gymnastics', year: 2000, gold: 2, silver: 1, bronze: 3 },
        {
            athlete: 'Cindy Klassen',
            country: 'Canada',
            sport: 'Speed Skating',
            year: 2006,
            gold: 1,
            silver: 2,
            bronze: 2,
        },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    async function createGrid(
        id: string,
        options: { buttons?: IToolPanelColumnCompParams['buttons']; pivotMode?: boolean } = {}
    ): Promise<{ api: GridApi; toolPanel: any; toolPanelGui: HTMLElement; savedState: ColumnState[] }> {
        const sideBar: SideBarDef = {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: { buttons: options.buttons },
                },
            ],
            defaultToolPanel: 'columns',
        };
        const api = await gridMgr.createGridAndWait(id, {
            columnDefs,
            rowData,
            sideBar,
            pivotMode: options.pivotMode,
        });
        const toolPanel = await waitFor(() => {
            const panel = api.getToolPanelInstance('columns') as any;
            expect(panel).toBeDefined();
            return panel;
        });
        return { api, toolPanel, toolPanelGui: toolPanel.getGui(), savedState: api.getColumnState() };
    }

    /** Everything the Columns Tool Panel can change, in a form that can be compared between grids. */
    function snapshot(api: GridApi) {
        return {
            columnState: api
                .getColumnState()
                .map(
                    ({
                        colId,
                        hide,
                        rowGroup,
                        rowGroupIndex,
                        pivot,
                        pivotIndex,
                        aggFunc,
                        sort,
                        sortIndex,
                        pivotSort,
                    }) => ({
                        colId,
                        hide,
                        rowGroup,
                        rowGroupIndex,
                        pivot,
                        pivotIndex,
                        aggFunc,
                        sort,
                        sortIndex,
                        pivotSort,
                    })
                ),
            rowGroupColumns: api.getRowGroupColumns().map((col) => col.getColId()),
            valueColumns: api.getValueColumns().map((col) => col.getColId()),
            pivotColumns: api.getPivotColumns().map((col) => col.getColId()),
        };
    }

    function getButton(toolPanelGui: HTMLElement, label: string): HTMLButtonElement {
        return Array.from(toolPanelGui.querySelectorAll<HTMLButtonElement>('.ag-column-panel-buttons-button')).find(
            (button) => button.textContent?.trim() === label
        )!;
    }

    function getUpdateStrategy(toolPanel: any): IColumnStateUpdateStrategy {
        return toolPanel.beans.columnStateUpdateStrategy;
    }

    /** Creates the reference grid, which applies the params through the grid API, and returns its final snapshot. */
    async function getExpectedSnapshot(scenario: Scenario) {
        const { api, savedState } = await createGrid('referenceGrid', { pivotMode: scenario.pivotMode });
        scenario.setup?.(api);
        api.applyColumnState(scenario.getParams(savedState));
        return snapshot(api);
    }

    /** Creates a grid whose `Preset` custom button calls `updatePanelColumns` with the scenario's params. */
    async function createPanelGrid(scenario: Scenario, deferred: boolean) {
        let savedState: ColumnState[] = [];
        const preset = {
            label: 'Preset',
            action: (params: ColumnToolPanelButtonActionParams) =>
                params.updatePanelColumns(scenario.getParams(savedState)),
        };
        const grid = await createGrid('panelGrid', {
            buttons: deferred ? ['cancel', 'apply', preset] : [preset],
            pivotMode: scenario.pivotMode,
        });
        savedState = grid.savedState;
        scenario.setup?.(grid.api);
        return grid;
    }

    describe('with deferred updates', () => {
        test.each(scenarios)('$name: waits for Apply, then matches api.applyColumnState', async (scenario) => {
            const expected = await getExpectedSnapshot(scenario);
            const { api, toolPanelGui } = await createPanelGrid(scenario, true);
            const before = snapshot(api);

            getButton(toolPanelGui, 'Preset').click();

            expect(snapshot(api)).toEqual(before);
            expect(getButton(toolPanelGui, 'Apply').disabled).toBe(false);

            getButton(toolPanelGui, 'Apply').click();

            expect(snapshot(api)).toEqual(expected);
        });

        test('Cancel discards the staged changes', async () => {
            const { api, toolPanelGui } = await createPanelGrid(scenarios[0], true);
            const before = snapshot(api);

            getButton(toolPanelGui, 'Preset').click();
            getButton(toolPanelGui, 'Cancel').click();

            expect(getButton(toolPanelGui, 'Apply').disabled).toBe(true);

            getButton(toolPanelGui, 'Apply').click();

            expect(snapshot(api)).toEqual(before);
        });

        test('staging the current state leaves Apply disabled', async () => {
            const scenario: Scenario = {
                name: 'restore the saved state',
                // Removing a value column keeps its last aggFunc on the column.
                setup: (api) => {
                    api.applyColumnState({ state: [{ colId: 'silver', aggFunc: 'sum' }] });
                    api.applyColumnState({ state: [{ colId: 'silver', aggFunc: null }] });
                },
                getParams: (savedState) => ({ state: savedState, applyOrder: true }),
            };
            const { toolPanelGui } = await createPanelGrid(scenario, true);

            getButton(toolPanelGui, 'Preset').click();

            expect(getButton(toolPanelGui, 'Apply').disabled).toBe(true);
        });

        test('keeps changes already pending in the panel', async () => {
            const scenario: Scenario = {
                name: 'hide sport',
                getParams: () => ({ state: [{ colId: 'sport', hide: true }] }),
            };
            const { api, toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const athlete = api.getColumn('athlete') as AgColumn;

            getUpdateStrategy(toolPanel).setColumnsVisible(true, [athlete], false, 'toolPanelUi');
            getButton(toolPanelGui, 'Preset').click();
            getButton(toolPanelGui, 'Apply').click();

            expect(api.getColumn('athlete')!.isVisible()).toBe(false);
            expect(api.getColumn('sport')!.isVisible()).toBe(false);
        });

        test('shows staged changes in the panel before Apply', async () => {
            const scenario: Scenario = {
                name: 'group by sport, hide athlete',
                getParams: () => ({
                    state: [
                        { colId: 'athlete', hide: true },
                        { colId: 'sport', rowGroup: true },
                    ],
                }),
            };
            const { toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const strategy = getUpdateStrategy(toolPanel);

            getButton(toolPanelGui, 'Preset').click();

            expect(strategy.getRowGroupColumns(true).map((col) => col.getColId())).toEqual(['country', 'sport']);
            expect(toolPanel.rowGroupDropZonePanel.getGui().textContent).toContain('Sport');
        });

        test('shows staged row group, value and pivot order in the panel before Apply', async () => {
            const scenario: Scenario = {
                name: 'reorder every section',
                pivotMode: true,
                setup: (api) =>
                    api.applyColumnState({
                        state: [
                            { colId: 'silver', aggFunc: 'sum' },
                            { colId: 'athlete', pivot: true },
                        ],
                    }),
                getParams: () => ({
                    state: [
                        { colId: 'sport', rowGroup: true, rowGroupIndex: 0 },
                        { colId: 'silver', valueIndex: 0 },
                        { colId: 'athlete', pivotIndex: 0 },
                    ],
                }),
            };
            const { toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const strategy = getUpdateStrategy(toolPanel);
            const colIds = (columns: AgColumn[]) => columns.map((col) => col.getColId());

            getButton(toolPanelGui, 'Preset').click();

            expect(colIds(strategy.getRowGroupColumns(true))).toEqual(['sport', 'country']);
            expect(colIds(strategy.getValueColumns(true))).toEqual(['silver', 'gold']);
            expect(colIds(strategy.getPivotColumns(true))).toEqual(['athlete', 'year']);
        });

        test('shows a staged sort in the panel before Apply', async () => {
            const scenario: Scenario = {
                name: 'sort athlete',
                getParams: () => ({ state: [{ colId: 'athlete', sort: 'desc' }] }),
            };
            const { api, toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const athlete = api.getColumn('athlete') as AgColumn;

            getButton(toolPanelGui, 'Preset').click();

            expect(getUpdateStrategy(toolPanel).getSortDef(true, athlete)?.direction).toBe('desc');
            expect(athlete.getSort() ?? null).toBeNull();
        });

        test('a sort from the panel after a staged sort wins', async () => {
            const scenario: Scenario = {
                name: 'sort athlete',
                getParams: () => ({ state: [{ colId: 'athlete', sort: 'desc' }] }),
            };
            const { api, toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const athlete = api.getColumn('athlete') as AgColumn;
            const strategy = getUpdateStrategy(toolPanel);

            getButton(toolPanelGui, 'Preset').click();
            strategy.progressSortFromEvent(true, athlete, new MouseEvent('click'));
            const panelSort = strategy.getSortDef(true, athlete)?.direction ?? null;
            // Re-dates the staged column state, which must not revive the preset's sort.
            strategy.setColumnsVisible(true, [api.getColumn('year') as AgColumn], false, 'toolPanelUi');
            getButton(toolPanelGui, 'Apply').click();

            expect(panelSort).not.toBe('desc');
            expect(athlete.getSort() ?? null).toBe(panelSort);
        });

        test('a staged sort after a sort from the panel wins', async () => {
            const scenario: Scenario = {
                name: 'sort athlete',
                getParams: () => ({ state: [{ colId: 'athlete', sort: 'desc' }] }),
            };
            const { api, toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const athlete = api.getColumn('athlete') as AgColumn;

            getUpdateStrategy(toolPanel).progressSortFromEvent(true, athlete, new MouseEvent('click'));
            getButton(toolPanelGui, 'Preset').click();
            getButton(toolPanelGui, 'Apply').click();

            expect(athlete.getSort()).toBe('desc');
        });

        test('a staged sort survives a later multi-sort from the panel', async () => {
            const scenario: Scenario = {
                name: 'sort athlete',
                getParams: () => ({ state: [{ colId: 'athlete', sort: 'desc' }] }),
            };
            const { api, toolPanel, toolPanelGui } = await createPanelGrid(scenario, true);
            const strategy = getUpdateStrategy(toolPanel);
            const year = api.getColumn('year') as AgColumn;

            strategy.progressSortFromEvent(true, api.getColumn('country') as AgColumn, new MouseEvent('click'));
            getButton(toolPanelGui, 'Preset').click();
            strategy.progressSortFromEvent(true, year, new MouseEvent('click', { shiftKey: true }));
            getButton(toolPanelGui, 'Apply').click();

            expect(api.getColumn('country')!.getSort()).toBe('asc');
            expect(api.getColumn('athlete')!.getSort()).toBe('desc');
            expect(year.getSort()).toBe('asc');
            expect(api.getColumn('sport')!.getSort() ?? null).toBeNull();
        });

        test('previews grouping by a column with a groupHierarchy as Apply groups it', async () => {
            const preset = {
                label: 'Preset',
                action: (params: ColumnToolPanelButtonActionParams) =>
                    params.updatePanelColumns({ state: [{ colId: 'date', rowGroup: true }] }),
            };
            const api = await gridMgr.createGridAndWait('hierarchyGrid', {
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'country', enableRowGroup: true },
                ],
                rowData: [{ date: '2008-08-24', country: 'United States' }],
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: { buttons: ['cancel', 'apply', preset] },
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });
            const toolPanel = await waitFor(() => {
                const panel = api.getToolPanelInstance('columns') as any;
                expect(panel).toBeDefined();
                return panel;
            });
            const toolPanelGui: HTMLElement = toolPanel.getGui();

            getButton(toolPanelGui, 'Preset').click();
            const staged = getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId());
            getButton(toolPanelGui, 'Apply').click();

            expect(staged).toEqual(api.getRowGroupColumns().map((col) => col.getColId()));
        });

        test('ignores fields the panel cannot change', async () => {
            // Typed as full `ColumnState`, like the output of `api.getColumnState()`.
            const state: ColumnState[] = [{ colId: 'athlete', width: 432, pinned: 'left', hide: true }];
            const scenario: Scenario = { name: 'set width', getParams: () => ({ state }) };
            const { api, toolPanelGui } = await createPanelGrid(scenario, true);
            const athlete = api.getColumn('athlete')!;
            const widthBefore = athlete.getActualWidth();

            getButton(toolPanelGui, 'Preset').click();
            getButton(toolPanelGui, 'Apply').click();

            expect(athlete.isVisible()).toBe(false);
            expect(athlete.getActualWidth()).toBe(widthBefore);
            expect(athlete.getPinned()).toBeNull();
        });
    });

    describe('without deferred updates', () => {
        test.each(scenarios)('$name: applies immediately and matches api.applyColumnState', async (scenario) => {
            const expected = await getExpectedSnapshot(scenario);
            const { api, toolPanelGui } = await createPanelGrid(scenario, false);

            getButton(toolPanelGui, 'Preset').click();

            expect(snapshot(api)).toEqual(expected);
        });
    });
});
