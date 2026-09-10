import { waitFor } from '@testing-library/dom';
import { TestGridsManager, installFilterLayoutMock, uninstallFilterLayoutMock } from 'ag-test-utils';

import type { GridApi, IToolPanelComp, IToolPanelParams, SideBarState } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import { FILTERS_SIDEBAR, openFiltersPanel } from '../filters/filter-behaviour/toolPanelHarness';

/**
 * Side Bar / Tool Panel grid state. `api.refreshToolPanel()` is exercised alongside each restore
 * because both reach the panel as a `refresh(params)` call, and only the params tell them apart.
 */
describe('Tool Panel state', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            FiltersToolPanelModule,
            ColumnsToolPanelModule,
            GridStateModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const columnDefs = [
        { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
    ];
    const rowData = [{ name: 'Alice', age: 30 }];

    /** A side bar state naming the filters/groups to leave expanded. */
    function filtersState(expandedColIds: string[], expandedGroupIds: string[] = []): SideBarState {
        return {
            visible: true,
            position: 'right',
            openToolPanel: 'filters',
            toolPanels: { filters: { expandedColIds, expandedGroupIds } },
        };
    }

    /** Restores side bar state; callers then poll for the outcome, as the rebuild is async. */
    function restoreSideBar(api: GridApi, sideBar: SideBarState): void {
        api.setState({ sideBar });
    }

    /** Polls until the named top-level filters-panel entry has the wanted expansion. */
    async function waitForFilterExpanded(api: GridApi, title: string, expanded: boolean): Promise<void> {
        await waitFor(async () => expect((await openFiltersPanel(api)).isGroupExpandedByTitle(title)).toBe(expanded));
    }

    /** Polls until the side bar state matches, to avoid a guessed delay. */
    async function waitForSideBarState(api: GridApi, expected: unknown): Promise<void> {
        await waitFor(() => expect(api.getState().sideBar).toEqual(expected));
    }

    describe('Filters Tool Panel', () => {
        test('setState restores an expanded filter (AG-18061)', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            expect(panel.isGroupExpandedByTitle('Age')).toBe(false);

            restoreSideBar(api, filtersState(['age']));

            await waitForFilterExpanded(api, 'Age', true);
            await waitForSideBarState(api, filtersState(['age']));
        });

        test('setState restores an expanded column group', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ headerName: 'Group', groupId: 'group', children: columnDefs }],
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            // Column groups render expanded by default, so collapse first
            await panel.collapseGroup('Group');
            expect(api.getState().sideBar?.toolPanels?.filters).toEqual({
                expandedColIds: [],
                expandedGroupIds: [],
            });

            const groupExpandedState: SideBarState = {
                visible: true,
                position: 'right',
                openToolPanel: 'filters',
                toolPanels: { filters: { expandedColIds: [], expandedGroupIds: ['group'] } },
            };
            restoreSideBar(api, groupExpandedState);

            await waitForFilterExpanded(api, 'Group', true);
            await waitForSideBarState(api, groupExpandedState);
        });

        test('setState restore is authoritative: empty ids collapse a live-expanded filter', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Age');
            expect(api.getState().sideBar?.toolPanels?.filters).toEqual({
                expandedColIds: ['age'],
                expandedGroupIds: [],
            });

            restoreSideBar(api, filtersState([]));

            await waitForFilterExpanded(api, 'Age', false);
        });

        test('setState restores every time it is called', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            await openFiltersPanel(api);

            restoreSideBar(api, filtersState(['age']));
            await waitForFilterExpanded(api, 'Age', true);

            restoreSideBar(api, filtersState(['name']));
            await waitForFilterExpanded(api, 'Name', true);
            expect((await openFiltersPanel(api)).isGroupExpandedByTitle('Age')).toBe(false);
        });

        test('re-restoring one saved snapshot object is authoritative after a user change', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Age');
            // The same saved object twice, with a user change in between
            const saved = api.getState();

            restoreSideBar(api, saved.sideBar!);
            await waitForFilterExpanded(api, 'Age', true);

            await (await openFiltersPanel(api)).collapseGroup('Age');
            await waitForFilterExpanded(api, 'Age', false);

            api.setState(saved);

            await waitForFilterExpanded(api, 'Age', true);
        });

        test('refreshToolPanel and column changes preserve live expansion', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
                initialState: { sideBar: filtersState(['name']) },
            });
            const panel = await openFiltersPanel(api);
            // The construction-time state is applied once
            expect(panel.isGroupExpandedByTitle('Name')).toBe(true);

            await panel.collapseGroup('Name');
            await panel.expandGroup('Age');

            // and neither a re-render nor a refresh re-presents it over the user's change
            api.moveColumns(['age'], 0);
            await waitForSideBarState(api, filtersState(['age']));
            api.refreshToolPanel();

            const refreshed = await openFiltersPanel(api);
            expect(refreshed.isGroupExpandedByTitle('Age')).toBe(true);
            expect(refreshed.isGroupExpandedByTitle('Name')).toBe(false);
        });

        test('refreshToolPanel after a restore keeps the restored expansion', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: FILTERS_SIDEBAR,
            });
            await openFiltersPanel(api);
            restoreSideBar(api, filtersState(['age']));
            await waitForFilterExpanded(api, 'Age', true);

            api.refreshToolPanel();

            expect((await openFiltersPanel(api)).isGroupExpandedByTitle('Age')).toBe(true);
        });
    });

    describe('Columns Tool Panel', () => {
        const groupedColumnDefs = [
            { headerName: 'Group A', groupId: 'gA', children: [{ field: 'name' }, { field: 'age' }] },
            { headerName: 'Group B', groupId: 'gB', children: [{ field: 'sport' }] },
        ];
        const groupedRowData = [{ name: 'Alice', age: 30, sport: 'Golf' }];
        const COLUMNS_SIDEBAR = { toolPanels: ['columns'], defaultToolPanel: 'columns' };

        function columnsState(expandedGroupIds: string[]): SideBarState {
            return {
                visible: true,
                position: 'right',
                openToolPanel: 'columns',
                toolPanels: { columns: { expandedGroupIds } },
            };
        }

        /** Creates the grid and waits for the panel to render its groups. */
        async function createColumnsGrid(): Promise<GridApi> {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: groupedColumnDefs,
                rowData: groupedRowData,
                sideBar: COLUMNS_SIDEBAR,
            });
            await waitForColumnsState(api, ['gA', 'gB']);
            return api;
        }

        async function waitForColumnsState(api: GridApi, expandedGroupIds: string[]): Promise<void> {
            await waitFor(() => expect(api.getState().sideBar?.toolPanels?.columns).toEqual({ expandedGroupIds }));
        }

        test('setState restores expanded groups', async () => {
            // Groups are expanded by default, so the restore has to collapse one
            const api = await createColumnsGrid();

            api.setState({ sideBar: columnsState(['gA']) });

            await waitForColumnsState(api, ['gA']);
        });

        test('re-restoring one saved snapshot object is authoritative after a user change', async () => {
            const api = await createColumnsGrid();
            api.setState({ sideBar: columnsState(['gA']) });
            await waitForColumnsState(api, ['gA']);
            const saved = api.getState();

            // A user change, then the very same saved object again
            api.setState({ sideBar: columnsState(['gA', 'gB']) });
            await waitForColumnsState(api, ['gA', 'gB']);
            api.setState(saved);

            await waitForColumnsState(api, ['gA']);
        });

        test('refreshToolPanel keeps the restored expansion instead of reverting to construction state', async () => {
            const api = await createColumnsGrid();
            api.setState({ sideBar: columnsState(['gA']) });
            await waitForColumnsState(api, ['gA']);

            api.refreshToolPanel();

            await waitForColumnsState(api, ['gA']);
        });
    });

    describe('Custom tool panel', () => {
        /** Records the state the grid asks it to present, and reports its own state back. */
        class RecordingToolPanel implements IToolPanelComp {
            public static presented: (unknown | undefined)[] = [];
            private readonly eGui = document.createElement('div');
            private state: unknown;

            public init(params: IToolPanelParams): void {
                this.present(params);
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public refresh(params: IToolPanelParams): boolean {
                this.present(params);
                return true;
            }

            public getState(): unknown {
                return this.state;
            }

            private present(params: IToolPanelParams): void {
                RecordingToolPanel.presented.push(params.initialState);
                this.state = params.initialState;
            }
        }

        const CUSTOM_SIDEBAR = {
            toolPanels: [
                {
                    id: 'custom',
                    labelDefault: 'Custom',
                    labelKey: 'custom',
                    iconKey: 'columns',
                    toolPanel: RecordingToolPanel,
                },
            ],
            defaultToolPanel: 'custom',
        };

        function customState(value: string): SideBarState {
            return {
                visible: true,
                position: 'right',
                openToolPanel: 'custom',
                toolPanels: { custom: { value } },
            };
        }

        beforeEach(() => {
            RecordingToolPanel.presented = [];
        });

        test('a panel that implements neither refresh nor getState survives a refresh and a restore', async () => {
            // `refresh` and `getState` are optional, so the grid must cope without them
            class MinimalToolPanel {
                private readonly eGui = document.createElement('div');
                public init(): void {
                    this.eGui.textContent = 'minimal';
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
            }

            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: {
                    toolPanels: [
                        {
                            id: 'minimal',
                            labelDefault: 'Minimal',
                            labelKey: 'minimal',
                            iconKey: 'columns',
                            toolPanel: MinimalToolPanel as any,
                        },
                    ],
                    defaultToolPanel: 'minimal',
                },
            });
            await waitFor(() => expect(api.getState().sideBar?.openToolPanel).toBe('minimal'));

            api.refreshToolPanel();
            api.setState({
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'minimal',
                    toolPanels: { minimal: { value: 'ignored' } },
                },
            });

            await waitFor(() => expect(api.getState().sideBar?.openToolPanel).toBe('minimal'));
            // No `getState` on the panel, so it contributes no state of its own
            expect(api.getState().sideBar?.toolPanels?.minimal).toBeUndefined();
        });

        test('refresh receives the restored state, and refreshToolPanel then presents the current params', async () => {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs,
                rowData,
                sideBar: CUSTOM_SIDEBAR,
                initialState: { sideBar: customState('construction') },
            });
            await waitFor(() => expect(RecordingToolPanel.presented).toEqual([{ value: 'construction' }]));

            api.setState({ sideBar: customState('restored') });
            await waitFor(() =>
                expect(RecordingToolPanel.presented).toEqual([{ value: 'construction' }, { value: 'restored' }])
            );

            api.refreshToolPanel();

            // `refreshToolPanel` presents the current params: after a restore, the restored state
            expect(RecordingToolPanel.presented).toEqual([
                { value: 'construction' },
                { value: 'restored' },
                { value: 'restored' },
            ]);
            expect(api.getState().sideBar).toEqual(customState('restored'));
        });
    });
});
