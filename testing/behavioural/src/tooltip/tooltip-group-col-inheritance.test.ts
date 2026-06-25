import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { GROUP_AUTO_COLUMN_ID, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, ITooltipComp, ITooltipParams, Module } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Tooltip inheritance in group columns', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RowGroupingModule, TreeDataModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const TOOLTIP_SHOW_DELAY = 200;

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });

    // TC2 – single column grouping: group cell inherits tooltipValueGetter from underlying colDef
    test('group cell inherits tooltipValueGetter when grouped (singleColumn)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => `Tooltip: ${params.value}`,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-single', gridOptions);
        await new GridColumns(api, 'group cell inherits tooltipValueGetter (singleColumn) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipValueGetter (singleColumn) setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: Australia');
        await new GridRows(api, 'group cell inherits tooltipValueGetter (singleColumn) final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC2 – multiple column grouping: group cell inherits tooltipValueGetter from underlying colDef
    test('group cell inherits tooltipValueGetter when grouped (multipleColumns)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => `Country: ${params.value}`,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-multiple', gridOptions);
        await new GridColumns(api, 'group cell inherits tooltipValueGetter (multipleColumns) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipValueGetter (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.cell('row-group-country-Australia', autoColId))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country: Australia');
        await new GridRows(api, 'group cell inherits tooltipValueGetter (multipleColumns) final state').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC2 – tooltipField is inherited (singleColumn)
    test('group cell inherits tooltipField from underlying colDef', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, tooltipField: 'country' },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-field', gridOptions);
        await new GridColumns(api, 'group cell inherits tooltipField setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipField setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Australia');
        await new GridRows(api, 'group cell inherits tooltipField final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC4 – grouped header inherits headerTooltip from underlying colDef (multipleColumns)
    test('grouped header inherits headerTooltip from underlying colDef (multipleColumns)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, headerTooltip: 'Country header tooltip' },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-header', gridOptions);
        await new GridColumns(api, 'grouped header inherits headerTooltip (multipleColumns) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'grouped header inherits headerTooltip (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const headerCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.headerCell(autoColId)));

        await userEvent.hover(headerCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country header tooltip');
        await new GridRows(api, 'grouped header inherits headerTooltip (multipleColumns) final state').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC5 – leaf rows in the group column use autoGroupColumnDef tooltip settings
    test('leaf rows use autoGroupColumnDef tooltipValueGetter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                field: 'athlete',
                tooltipValueGetter: (params) => `Leaf: ${params.value}`,
            },
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-leaf', gridOptions);
        await new GridColumns(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 ag-Grid-AutoColumn:"Alice" country:"Australia" athlete:"Alice"
        `);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Australia')!, true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const leafCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.autoGroupCell('0')));

        await userEvent.hover(leafCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Leaf: Alice');
        await new GridRows(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF id:0 ag-Grid-AutoColumn:"Alice" country:"Australia" athlete:"Alice"
        `);
    });

    // group rows always use underlying colDef tooltip even when autoGroupColumnDef also sets one
    test('group rows use underlying colDef tooltip, ignoring autoGroupColumnDef tooltipValueGetter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: () => 'Inherited tooltip',
                },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: {
                tooltipValueGetter: () => 'autoGroupColumnDef tooltip',
            },
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-override', gridOptions);
        await new GridColumns(api, 'group rows use underlying colDef tooltip setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group rows use underlying colDef tooltip setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Inherited tooltip');
        await new GridRows(api, 'group rows use underlying colDef tooltip final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // tooltipComponentSelector is inherited by the auto group column (multipleColumns)
    test('group column inherits tooltipComponentSelector (multipleColumns)', async () => {
        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom custom-selector-tooltip';
                this.eGui.textContent = `selector:${params.value}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => params.value,
                    tooltipComponentSelector: () => ({ component: CustomTooltip }),
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-selector-multiple', gridOptions);
        await new GridColumns(api, 'group column inherits tooltipComponentSelector (multipleColumns) setup')
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                └── athlete "Athlete" width:200
            `);
        await new GridRows(api, 'group column inherits tooltipComponentSelector (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.cell('row-group-country-Australia', autoColId))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.custom-selector-tooltip')).not.toBeNull();
        expect(getTooltips()[0]).toHaveTextContent('selector:Australia');
        await new GridRows(api, 'group column inherits tooltipComponentSelector (multipleColumns) final state').check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
                └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
                · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
            `
        );
    });

    // tooltipComponentSelector on the source column is dispatched in singleColumn mode
    test('group cell uses tooltipComponentSelector from source column (singleColumn)', async () => {
        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom custom-selector-tooltip';
                this.eGui.textContent = `selector:${params.value}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => params.value,
                    tooltipComponentSelector: () => ({ component: CustomTooltip }),
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-selector-single', gridOptions);
        await new GridColumns(api, 'group cell uses tooltipComponentSelector from source column (singleColumn) setup')
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── athlete "Athlete" width:200
            `);
        await new GridRows(api, 'group cell uses tooltipComponentSelector from source column (singleColumn) setup')
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
            `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.custom-selector-tooltip')).not.toBeNull();
        expect(getTooltips()[0]).toHaveTextContent('selector:Australia');
        await new GridRows(
            api,
            'group cell uses tooltipComponentSelector from source column (singleColumn) final state'
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC3 – groupDisplayType: 'groupRows': full-width row inherits tooltipValueGetter from colDef
    test('full-width group row inherits tooltipValueGetter (groupRows)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => `Tooltip: ${params.value}`,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-valuegetter', gridOptions);
        await new GridColumns(api, 'full-width group row inherits tooltipValueGetter (groupRows) setup').checkColumns(`
            CENTER
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'full-width group row inherits tooltipValueGetter (groupRows) setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupRow = await waitFor(() => getByTestId(gridDiv, agTestIdFor.rowNode('row-group-country-Australia')));

        await userEvent.hover(groupRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: Australia');
        await new GridRows(api, 'full-width group row inherits tooltipValueGetter (groupRows) final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // TC3 – groupDisplayType: 'groupRows': full-width row reads tooltipField from node.data,
    // not from the group display value — verified with tree data where the two differ
    test('full-width group row reads tooltipField from node.data, not display value (groupRows + tree data)', async () => {
        const gridOptions: GridOptions = {
            treeData: true,
            treeDataParentIdField: 'parentId',
            getRowId: (params) => params.data.id,
            // autoGroupColumnDef.tooltipField is 'description', distinct from the display field 'name'
            autoGroupColumnDef: {
                field: 'name',
                tooltipField: 'description',
            },
            columnDefs: [],
            rowData: [
                { id: 'au', parentId: null, name: 'Australia', description: 'Commonwealth of Australia' },
                { id: 'au-syd', parentId: 'au', name: 'Sydney', description: 'Harbour City' },
            ],
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-field', gridOptions);
        await new GridRows(api, 'full-width group row reads tooltipField from data setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ au GROUP collapsed id:au
            · └── au-syd LEAF hidden id:au-syd
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupRow = await waitFor(() => getByTestId(gridDiv, agTestIdFor.rowNode('au')));

        await userEvent.hover(groupRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        // tooltip comes from data.description ('Commonwealth of Australia'), not from data.name ('Australia')
        expect(getTooltips()[0]).toHaveTextContent('Commonwealth of Australia');
        await new GridRows(api, 'full-width group row reads tooltipField from data final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ au GROUP collapsed id:au
            · └── au-syd LEAF hidden id:au-syd
        `);
    });

    // TC3 – groupDisplayType: 'groupRows' with regular row grouping: a group node carries no `node.data`,
    // so `tooltipField` must fall back to the group display value rather than producing no tooltip.
    test('full-width group row inherits tooltipField from underlying colDef (groupRows, regular grouping)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    tooltipField: 'country',
                },
                { field: 'bronze' },
            ],
            rowData: [
                { country: 'United States', bronze: 1 },
                { country: 'United States', bronze: 2 },
            ],
            groupDefaultExpanded: -1,
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-field-regular', gridOptions);
        await new GridRows(api, 'full-width group row inherits tooltipField (regular grouping) setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:"row-group-country-United States"
            · ├── LEAF id:0 country:"United States" bronze:1
            · └── LEAF id:1 country:"United States" bronze:2
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupRow = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.rowNode('row-group-country-United States'))
        );

        await userEvent.hover(groupRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('United States');
    });

    // P1 fix: tooltipValueGetter receives params.value from the owning group column, not the outer group
    test('full-width group row tooltipValueGetter receives value from the owning column (groupRows + multiple groups)', async () => {
        const countryTooltips: string[] = [];
        const yearTooltips: string[] = [];
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => {
                        countryTooltips.push(String(params.value));
                        return `country:${params.value}`;
                    },
                },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => {
                        yearTooltips.push(String(params.value));
                        return `year:${params.value}`;
                    },
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', year: 2020, athlete: 'Alice' }],
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-multi-group', gridOptions);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Australia')!, true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const yearRow = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.rowNode('row-group-country-Australia-year-2020'))
        );

        await userEvent.hover(yearRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        // The year group row must show the year value (2020), not the country value (Australia)
        expect(getTooltips()[0]).toHaveTextContent('year:2020');
    });

    // P2 fix: tooltipComponent alone receives the group display value, not undefined
    test('full-width group row passes group display value to tooltipComponent when no getter or field (groupRows)', async () => {
        let capturedValue: unknown = 'not-set';

        class CaptureTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                capturedValue = params.value;
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom capture-tooltip';
                this.eGui.textContent = `captured:${params.value}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipComponent: CaptureTooltip,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-component-only', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupRow = await waitFor(() => getByTestId(gridDiv, agTestIdFor.rowNode('row-group-country-Australia')));

        await userEvent.hover(groupRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.capture-tooltip')).not.toBeNull();
        // params.value must be the group display value, not undefined
        expect(capturedValue).toBe('Australia');
    });

    // getAdditionalParams must expose the group column's formatted value to a custom tooltipComponent,
    // matching the formatter output (not the raw display value) as the standard cell tooltip path does.
    test('full-width group row passes formatted value to tooltipComponent params.valueFormatted (groupRows)', async () => {
        let capturedValueFormatted: unknown = 'not-set';

        class CaptureTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                capturedValueFormatted = params.valueFormatted;
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom capture-tooltip';
                this.eGui.textContent = `captured:${params.valueFormatted}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    valueFormatter: (params) => `formatted:${params.value}`,
                    tooltipComponent: CaptureTooltip,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'groupRows',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-rows-value-formatted', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupRow = await waitFor(() => getByTestId(gridDiv, agTestIdFor.rowNode('row-group-country-Australia')));

        await userEvent.hover(groupRow);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.capture-tooltip')).not.toBeNull();
        expect(capturedValueFormatted).toBe('formatted:Australia');
    });
});
