import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, getVisibleTooltips as getTooltips, waitForTooltips } from 'ag-test-utils';

import { TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridApi, GridOptions, ITooltipComp, ITooltipParams, Module } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule, TreeDataModule } from 'ag-grid-enterprise';

describe('AG-5004: tooltip on aggregated group-row cells', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RowGroupingModule, TreeDataModule, ShowValuesAsModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    // 0 means 0 here: FAST_TEST_TIMINGS lifts the grid's 200ms floor for this suite, so a hover costs
    // nothing. Every assertion below polls for the outcome rather than sleeping past it.
    const TOOLTIP_SHOW_DELAY = 0;

    const findGroupRowId = (api: GridApi, key: string): string => {
        let id: string | undefined;
        api.forEachNode((node) => {
            if (node.group && node.key === key) {
                id = node.id ?? undefined;
            }
        });
        if (id == null) {
            throw new Error(`No group node found for key "${key}"`);
        }
        return id;
    };

    const hoverCellAndExpectTooltip = async (api: GridApi, rowId: string, colId: string, expected: string) => {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell(rowId, colId)));
        await userEvent.hover(cell);
        // Polling covers the show delay: a sleep on top of it only pads, since the tooltip count is 0
        // until the grid's timer fires and 1 after it.
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent(expected);
        await userEvent.unhover(cell);
        await waitForTooltips(0);
    };

    // Regular row grouping: the aggregated column's group node has no underlying data record.
    test('row grouping: aggregated sum cell tooltips the aggregated value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', tooltipField: 'value' },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-sum', gridOptions);
        const groupRowId = findGroupRowId(api, 'AU');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', '6');
    });

    // A value-getter column deriving its value on a group node that has no underlying data record.
    test('row grouping: value-getter cell tooltips the derived group value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'derived',
                    valueGetter: (params) => (params.node?.group ? -4 : params.data?.value),
                    tooltipField: 'total',
                },
            ],
            rowData: [
                { country: 'AU', value: 1, total: 10 },
                { country: 'AU', value: 3, total: 20 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-value-getter', gridOptions);
        const groupRowId = findGroupRowId(api, 'AU');
        await hoverCellAndExpectTooltip(api, groupRowId, 'derived', '-4');
    });

    // Tree data: the group node carries its own data record whose value differs from the aggregate.
    test('tree data: aggregated cell tooltips the aggregate, not the node data value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value', aggFunc: 'sum', tooltipField: 'value' }],
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { path: ['Parent'], value: 3 },
                { path: ['Parent', 'Child'], value: 4 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-tree-agg', gridOptions);
        const groupRowId = findGroupRowId(api, 'Parent');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', '4');
    });

    // Pins the cross-field decision: an aggFunc column whose tooltipField points at a *different*
    // field still tooltips this cell's aggregate (via ctrl.value), matching autoColService.
    test('tree data: aggregated cell with a cross-field tooltipField tooltips the aggregate', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value', aggFunc: 'sum', tooltipField: 'label' }],
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { path: ['Parent'], value: 3, label: 'parent-label' },
                { path: ['Parent', 'Child'], value: 4, label: 'child-label' },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-tree-cross-field', gridOptions);
        const groupRowId = findGroupRowId(api, 'Parent');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', '4');
    });

    // A non-aggregated tree-data column with a distinct tooltipField still reads the underlying
    // field on the group node — the changed branch must not hijack this case.
    test('tree data: non-aggregated column with a distinct tooltipField keeps the underlying value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'name', tooltipField: 'description' }],
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { path: ['Parent'], name: 'Parent', description: 'the-parent-description' },
                { path: ['Parent', 'Child'], name: 'Child', description: 'the-child-description' },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-tree-distinct-field', gridOptions);
        const groupRowId = findGroupRowId(api, 'Parent');
        await hoverCellAndExpectTooltip(api, groupRowId, 'name', 'the-parent-description');
    });

    // Leaf-row cells of an aggregated column keep tooltipping their own value.
    test('row grouping: leaf-row aggregated column cell still tooltips its own value', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', tooltipField: 'value' },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
            ],
            groupDefaultExpanded: 1,
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-leaf', gridOptions);
        let leafRowId: string | undefined;
        api.forEachNode((node) => {
            if (!node.group && node.data?.value === 2) {
                leafRowId = node.id ?? undefined;
            }
        });
        expect(leafRowId).toBeDefined();
        await hoverCellAndExpectTooltip(api, leafRowId!, 'value', '2');
    });

    // An expanded group with a footer sibling blanks its agg value in the header (displayIgnoresAggData),
    // so the changed branch must NOT hijack the tooltip — it falls back to the underlying tooltipField.
    test('tree data: expanded group with a footer keeps the underlying tooltipField (displayIgnoresAggData)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value', aggFunc: 'sum', tooltipField: 'label' }],
            treeData: true,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData: [
                { path: ['Parent'], value: 3, label: 'parent-label' },
                { path: ['Parent', 'Child'], value: 4, label: 'child-label' },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-tree-footer-ignore-agg', gridOptions);
        const groupRowId = findGroupRowId(api, 'Parent');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', 'parent-label');
    });

    // Footer rows show the aggregate and never ignore agg data — they tooltip the displayed aggregate.
    test('row grouping: group footer aggregated cell tooltips the aggregate', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', tooltipField: 'value' },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-footer', gridOptions);
        let footerRowId: string | undefined;
        for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node?.footer && !node.rowPinned) {
                footerRowId = node.id ?? undefined;
            }
        }
        expect(footerRowId).toBeDefined();
        await hoverCellAndExpectTooltip(api, footerRowId!, 'value', '6');
    });

    // A custom tooltipComponent on an aggregated group-row cell receives the displayed aggregate value.
    test('row grouping: custom tooltipComponent renders with the aggregated value', async () => {
        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            public init(params: ITooltipParams): void {
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom custom-agg-tooltip';
                this.eGui.textContent = `agg:${params.value}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', tooltipField: 'value', tooltipComponent: CustomTooltip },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-custom-comp', gridOptions);
        const groupRowId = findGroupRowId(api, 'AU');
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell(groupRowId, 'value')));
        await userEvent.hover(cell);
        await waitForTooltips(1);
        expect(document.querySelector('.custom-agg-tooltip')).not.toBeNull();
        expect(getTooltips()[0]).toHaveTextContent('agg:6');
    });

    // The changed branch only guards `tooltipField`; a group-row cell's `tooltipValueGetter` still wins.
    test('row grouping: tooltipValueGetter still resolves on an aggregated group-row cell', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'value',
                    aggFunc: 'sum',
                    tooltipValueGetter: (params) => `getter:${params.value}`,
                },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-value-getter-comp', gridOptions);
        const groupRowId = findGroupRowId(api, 'AU');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', 'getter:6');
    });

    // showValuesAs transforms the displayed aggregate; the tooltip shows the underlying aggregated value
    // unformatted (6), not the transformed ratio (0.6) or the formatted cell text ("60.00%").
    test('row grouping: showValuesAs aggregated cell tooltips the unformatted aggregate', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal', tooltipField: 'value' },
            ],
            rowData: [
                { country: 'AU', value: 2 },
                { country: 'AU', value: 4 },
                { country: 'US', value: 4 },
            ],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
            tooltipSwitchShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('ag5004-grouping-show-values-as', gridOptions);
        const groupRowId = findGroupRowId(api, 'AU');
        await hoverCellAndExpectTooltip(api, groupRowId, 'value', '6');
    });
});
