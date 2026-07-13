import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('AG-5004: tooltip on aggregated group-row cells', () => {
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
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent(expected);
        await userEvent.unhover(cell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
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
});
