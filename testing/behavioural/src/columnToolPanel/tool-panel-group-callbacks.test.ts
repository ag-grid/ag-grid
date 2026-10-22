import { findByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type {
    ColGroupDef,
    GetColumnMenuItemsParams,
    GridApi,
    GridOptions,
    HeaderValueGetterParams,
    IColumnSelectionLabelRendererComp,
    IColumnSelectionLabelRendererParams,
    ProvidedColumnGroup,
    ToolPanelClassParams,
} from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from './toolPanelContextMenuHarness';

/**
 * The tool panels build their own copy of each column group to lay out their tree. User callbacks fired
 * from a tool panel receive the grid's own provided group, so events such as `headerNameChanged` reach them.
 */
describe('Tool panel column group callbacks', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const rowData = [{ gold: 1, silver: 2, country: 'Ireland' }];

    const resultsGroup = (extra: Partial<ColGroupDef> = {}): ColGroupDef => ({
        headerName: 'Results',
        groupId: 'results',
        children: [{ field: 'gold' }, { field: 'silver' }],
        ...extra,
    });

    const receivedGroups: (ProvidedColumnGroup | null)[] = [];

    class LabelRenderer implements IColumnSelectionLabelRendererComp {
        private readonly eGui = document.createElement('span');

        public init(params: IColumnSelectionLabelRendererParams): void {
            if (params.columnGroup) {
                receivedGroups.push(params.columnGroup);
            }
            this.eGui.textContent = params.displayName;
        }

        public getGui(): HTMLElement {
            return this.eGui;
        }
    }

    beforeEach(() => {
        receivedGroups.length = 0;
    });

    function renderVirtualList(root: ParentNode): void {
        const viewport = root.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    function createGrid(options: GridOptions, toolPanel = 'agColumnsToolPanel'): Promise<GridApi> {
        return gridMgr.createGridAndWait('myGrid', {
            rowData,
            components: { customColumnLabel: LabelRenderer },
            ...options,
            sideBar: {
                toolPanels: [
                    {
                        id: 'panel',
                        labelDefault: 'Panel',
                        labelKey: 'panel',
                        iconKey: 'columns',
                        toolPanel,
                        toolPanelParams: { columnLabelRenderer: 'customColumnLabel' },
                    },
                ],
                defaultToolPanel: 'panel',
            },
        });
    }

    const gridGroup = (api: GridApi, groupId: string) => api.getColumnGroup(groupId)!.getProvidedColumnGroup();

    async function waitForLabels(api: GridApi, count: number): Promise<void> {
        const gridElement = getGridElement(api)!;
        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(receivedGroups.length).toBeGreaterThanOrEqual(count);
        });
    }

    test('the label renderer receives the grid group, which fires headerNameChanged on a rename', async () => {
        const api = await createGrid({ columnDefs: [resultsGroup()] });
        await waitForLabels(api, 1);

        const group = receivedGroups[0]!;
        expect(group).toBe(gridGroup(api, 'results'));

        const onRenamed = vi.fn();
        group.addEventListener('headerNameChanged', onRenamed);
        api.setState({
            columnGroup: { openColumnGroupIds: [], headerNames: [{ groupId: 'results', headerName: 'Medals' }] },
        });

        await waitFor(() => expect(onRenamed).toHaveBeenCalledTimes(1));
    });

    test('each part of a split group receives the grid group and all of its columns', async () => {
        const api = await createGrid({
            columnDefs: [resultsGroup(), { field: 'country' }],
        });
        api.moveColumns(['country'], 1);
        await waitForLabels(api, 2);

        const splitParts = receivedGroups.slice(-2);
        expect(splitParts.map((group) => group === gridGroup(api, 'results'))).toEqual([true, true]);
        expect(splitParts[0]!.getLeafColumns().map((col) => col.getColId())).toEqual(['gold', 'silver']);
    });

    test('toolPanelClass receives the grid group', async () => {
        const toolPanelClass = vi.fn((_params: ToolPanelClassParams) => 'custom-group-class');
        const api = await createGrid({ columnDefs: [resultsGroup({ toolPanelClass })] });
        await waitForLabels(api, 1);

        expect(toolPanelClass).toHaveBeenCalledWith(
            expect.objectContaining({ columnGroup: gridGroup(api, 'results') })
        );
    });

    test('getColumnMenuItems from the tool panel context menu receives the grid group', async () => {
        const getColumnMenuItems = vi.fn((_params: GetColumnMenuItemsParams) => [{ name: 'Custom' }]);
        const api = await createGrid({ columnDefs: [resultsGroup()], getColumnMenuItems });
        await waitForLabels(api, 1);

        await openToolPanelContextMenu(
            api.getToolPanelInstance('panel') as any,
            getGridElement(api)! as HTMLElement,
            'Results'
        );

        await waitFor(() => expect(getColumnMenuItems).toHaveBeenCalled());
        expect(getColumnMenuItems.mock.calls[0][0].columnGroup).toBe(gridGroup(api, 'results'));
    });

    test.each([
        ['agColumnsToolPanel', 'columnToolPanel'],
        ['agFiltersToolPanel', 'filterToolPanel'],
    ])('a group headerValueGetter in the %s receives the grid group', async (toolPanel, location) => {
        const headerValueGetter = vi.fn((_params: HeaderValueGetterParams) => 'Results');
        const api = await createGrid(
            {
                columnDefs: [resultsGroup({ headerValueGetter })],
                defaultColDef: { filter: true },
            },
            toolPanel
        );
        const gridElement = getGridElement(api)!;

        await waitFor(() => {
            if (toolPanel === 'agColumnsToolPanel') {
                renderVirtualList(gridElement);
            }
            expect(headerValueGetter).toHaveBeenCalledWith(expect.objectContaining({ location }));
        });
        const params = headerValueGetter.mock.calls.find(([p]) => p.location === location)![0];
        expect(params.providedColumnGroup).toBe(gridGroup(api, 'results'));
    });

    test('a custom layout keeps its own group names and passes its own group where the grid has none', async () => {
        const api = await createGrid({ columnDefs: [resultsGroup(), { field: 'country' }] });
        await waitForLabels(api, 1);
        receivedGroups.length = 0;

        const toolPanel = api.getToolPanelInstance('panel') as any;
        toolPanel.setColumnLayout([
            { groupId: 'results', headerName: 'Layout Results', children: [{ field: 'gold' }] },
            { groupId: 'layoutOnly', headerName: 'Layout Only', children: [{ field: 'country' }] },
        ]);
        await waitForLabels(api, 2);

        const results = receivedGroups.find((group) => group?.getGroupId() === 'results')!;
        const layoutOnly = receivedGroups.find((group) => group?.getGroupId() === 'layoutOnly')!;
        expect(results).toBe(gridGroup(api, 'results'));
        expect(layoutOnly).toBeTruthy();
        expect(api.getColumnGroup('layoutOnly')).toBeNull();

        const labels = Array.from(
            getGridElement(api)!.querySelectorAll('.ag-column-select-column-label'),
            (element) => element.textContent
        );
        expect(labels).toEqual(expect.arrayContaining(['Layout Results', 'Layout Only']));
    });
    test('renaming and resetting a group that exists only in a custom layout fires headerNameChanged on its callback group', async () => {
        const api = await createGrid({
            columnDefs: [{ field: 'gold' }],
            columnHeaderEdit: { applyMode: 'deferred' },
        });
        const toolPanel = api.getToolPanelInstance('panel') as any;
        toolPanel.setColumnLayout([
            {
                groupId: 'layoutOnly',
                headerName: 'Layout Only',
                headerNameEditable: true,
                children: [{ field: 'gold' }],
            },
        ]);
        await waitForLabels(api, 1);
        const layoutOnly = receivedGroups.find((group) => group?.getGroupId() === 'layoutOnly')!;
        const onRenamed = vi.fn();
        layoutOnly.addEventListener('headerNameChanged', onRenamed);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await openToolPanelContextMenu(toolPanel, gridDiv, 'Layout Only');
        await userEvent.click(await findByText(gridDiv, 'Edit Column Name'));
        const input = await waitFor(() => {
            const el = document.querySelector('.ag-column-header-edit-popup-editor input') as HTMLInputElement | null;
            expect(el).toBeTruthy();
            return el!;
        });
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

        await waitFor(() => expect(onRenamed).toHaveBeenCalledTimes(1));

        api.resetColumnState();

        expect(onRenamed).toHaveBeenCalledTimes(2);
    });

    test('resetting a layout-only group renamed before the layout was reapplied notifies the current callback group', async () => {
        const api = await createGrid({
            columnDefs: [{ field: 'gold' }],
            columnHeaderEdit: { applyMode: 'deferred' },
        });
        const toolPanel = api.getToolPanelInstance('panel') as any;
        const layout = [
            {
                groupId: 'layoutOnly',
                headerName: 'Layout Only',
                headerNameEditable: true,
                children: [{ field: 'gold' }],
            },
        ];
        toolPanel.setColumnLayout(layout);
        await waitForLabels(api, 1);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await openToolPanelContextMenu(toolPanel, gridDiv, 'Layout Only');
        await userEvent.click(await findByText(gridDiv, 'Edit Column Name'));
        const input = await waitFor(() => {
            const el = document.querySelector('.ag-column-header-edit-popup-editor input') as HTMLInputElement | null;
            expect(el).toBeTruthy();
            return el!;
        });
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await findByText(gridDiv, 'Renamed');

        const staleGroup = receivedGroups.find((group) => group?.getGroupId() === 'layoutOnly')!;
        receivedGroups.length = 0;
        toolPanel.setColumnLayout(layout);
        await waitForLabels(api, 1);
        const currentGroup = receivedGroups.find((group) => group?.getGroupId() === 'layoutOnly')!;
        expect(currentGroup).not.toBe(staleGroup);
        const onRenamed = vi.fn();
        currentGroup.addEventListener('headerNameChanged', onRenamed);

        api.resetColumnState();

        expect(onRenamed).toHaveBeenCalledTimes(1);
    });
});
