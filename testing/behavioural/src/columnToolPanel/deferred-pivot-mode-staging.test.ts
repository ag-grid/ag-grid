import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';

import { AgColumn, DragSourceType, getGridElement } from 'ag-grid-community';
import type { GridApi, IColumnStateUpdateStrategy } from 'ag-grid-community';

import {
    addPrimaryColumnBackToRowGroups,
    cancelDeferredChanges,
    commitChanges,
    createDeferredNonPivotAggregationGrid,
    createDeferredNonPivotGrid,
    createDeferredPivotAggregationGrid,
    createDeferredPivotModeGrid,
    createNonDeferredPivotModeGrid,
    createPrimaryColumnComp,
    dragRenderedPrimaryColumnToEndOfPrimaryList,
    dragRenderedPrimaryColumnToRowGroups,
    getApplyButton,
    getCancelButton,
    getDropZoneText,
    getPivotModeToggle,
    getUpdateStrategy,
    getValueColumnIds,
    gridMgr,
    rowData,
    setupDeferredPivotModeSuite,
} from './deferredPivotModeHarness';

/** happy-dom gives the virtual list no height, so it needs one before it renders every column. */
async function renderWholeColumnList(toolPanelGui: HTMLElement, count: number): Promise<void> {
    const viewport = toolPanelGui.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
    Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
    viewport.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(getColumnListLabels(toolPanelGui)).toHaveLength(count), { timeout: 500 });
}

const getColumnListItems = (toolPanelGui: HTMLElement): HTMLElement[] =>
    Array.from(toolPanelGui.querySelectorAll<HTMLElement>('.ag-column-select-column'));

const getColumnListLabel = (item: HTMLElement): string =>
    item.querySelector('.ag-column-select-column-label')!.textContent!.trim();

const getColumnListLabels = (toolPanelGui: HTMLElement): string[] =>
    getColumnListItems(toolPanelGui).map(getColumnListLabel);

function getColumnListItem(toolPanelGui: HTMLElement, label: string): HTMLElement {
    const item = getColumnListItems(toolPanelGui).find((candidate) => getColumnListLabel(candidate) === label);
    if (!item) {
        throw new Error(`no column list item "${label}" among ${getColumnListLabels(toolPanelGui)}`);
    }
    return item;
}

function getColumnListCheckbox(toolPanelGui: HTMLElement, label: string): HTMLInputElement {
    return getColumnListItem(toolPanelGui, label).querySelector<HTMLInputElement>('input[type="checkbox"]')!;
}

describe('deferred column tool panel pivot mode - staging changes and committing them', () => {
    setupDeferredPivotModeSuite();

    test('adding aggregation values in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding aggregation values in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver', 'bronze']);
    });

    test('adding an unchecked column to row groups in deferred pivot mode stages both state and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const refreshDeferredUiSpy = vi.spyOn(toolPanel, 'refreshDeferredUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await addPrimaryColumnBackToRowGroups(toolPanel, gridApi, 'athlete');

        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
                .sort()
        ).toEqual(['athlete', 'country', 'sport']);
        expect(refreshDeferredUiSpy).toHaveBeenCalled();
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        getCancelButton(toolPanelGui).click();

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['country', 'sport'])
        );
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('adding row groups in pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const country = gridApi.getColumn('country')! as AgColumn;
        const sport = gridApi.getColumn('sport')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [country, sport, date], 'toolPanelUi');

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport', 'date']);
    });

    test('aggregation value changes and cancelling in non-pivot mode should keep values unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;
        const silver = gridApi.getColumn('silver')! as AgColumn;
        const bronze = gridApi.getColumn('bronze')! as AgColumn;

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold, silver, bronze], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);

        getUpdateStrategy(toolPanel).setValueColumns(true, [silver, gold], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        expect(getValueColumnIds(gridApi)).toEqual(['gold', 'silver']);
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill and cancelling keeps it unchanged in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('sum');
    });

    test('changing agg function on an existing value pill applies only after commit in non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing agg function on an existing value pill applies only after commit in pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();
        const gold = gridApi.getColumn('gold')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnAggFunc(true, gold, 'max', 'toolPanelUi');

        expect(gold.getAggFunc()).toBe('sum');

        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.getColumn('gold')!.getAggFunc()).toBe('max');
    });

    test('changing column visibility and cancelling in non-pivot mode should keep visibility unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');
        cancelDeferredChanges(toolPanel);

        expect(country.isVisible()).toBe(true);
    });

    test('changing column visibility in non-pivot mode applies only after commit', async () => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid();
        const country = gridApi.getColumn('country')! as AgColumn;

        expect(country.isVisible()).toBe(true);

        getUpdateStrategy(toolPanel).setColumnsVisible(true, [country], false, 'toolPanelUi');

        expect(country.isVisible()).toBe(true);

        commitChanges(toolPanel);

        expect(country.isVisible()).toBe(false);
    });

    test('checking a pivot-only column in deferred pivot mode draws a staged label pill immediately', async () => {
        const gridApi = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'athlete', enableRowGroup: true, rowGroup: true },
                { field: 'year', enablePivot: true, pivot: true },
                { field: 'date', enablePivot: true },
                { field: 'gold', enableValue: true, aggFunc: 'sum' },
            ],
            rowData,
            pivotMode: true,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { buttons: ['apply', 'cancel'] as const },
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        await new GridColumns(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP
            │ └── pivot_year_2000_gold "Gold" width:200 columnGroupShow:open
            ├─┬ "2004" GROUP
            │ └── pivot_year_2004_gold "Gold" width:200 columnGroupShow:open
            └─┬ "2008" GROUP
              └── pivot_year_2008_gold "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
        // The panel is ready once it has drawn the pill for the configured pivot column.
        const toolPanel = await waitFor(() => {
            const panel = gridApi.getToolPanelInstance('columns') as any;
            expect(getDropZoneText(panel.pivotDropZonePanel)).toContain('Year');
            expect(panel.primaryColsPanel.primaryColsListPanel.getDisplayedColsList().length).toBeGreaterThan(0);
            return panel;
        });
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');

        createPrimaryColumnComp(toolPanel, 'Date')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getPivotColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['year', 'date'])
        );
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).toContain('Date');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.pivotDropZonePanel)).not.toContain('Date');
        await new GridRows(
            gridApi,
            `checking a pivot-only column in deferred pivot mode draws a staged label pill im final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2000_gold:2 pivot_year_2004_gold:6 pivot_year_2008_gold:8
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" pivot_year_2000_gold:null pivot_year_2004_gold:6 pivot_year_2008_gold:8
            │ ├── LEAF hidden id:0 pivot_year_2000_gold:8 pivot_year_2004_gold:8 pivot_year_2008_gold:8
            │ └── LEAF hidden id:1 pivot_year_2000_gold:6 pivot_year_2004_gold:6 pivot_year_2008_gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Julian Weber" ag-Grid-AutoColumn:"Julian Weber" pivot_year_2000_gold:2 pivot_year_2004_gold:null pivot_year_2008_gold:null
            · └── LEAF hidden id:2 pivot_year_2000_gold:2 pivot_year_2004_gold:2 pivot_year_2008_gold:2
        `);
    });

    test('checking a row-group column in deferred pivot mode draws a staged row-group pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Country');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Sport');
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        createPrimaryColumnComp(toolPanel, 'Athlete')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
                    .sort()
            ).toEqual(['athlete', 'country', 'sport'])
        );
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');
    });

    test('checking a value column in deferred pivot mode draws a staged value pill immediately', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');

        createPrimaryColumnComp(toolPanel, 'Age')['onChangeCommon'](true);

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getValueColumns(true)
                    .map((col) => col.getColId())
            ).toEqual(['silver', 'bronze', 'age'])
        );
        expect(getValueColumnIds(gridApi)).toEqual(['silver', 'bronze']);
        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).toContain('Age');

        cancelDeferredChanges(toolPanel);

        expect(getDropZoneText(toolPanel.valuesDropZonePanel)).not.toContain('Age');
    });

    test('column label changes and cancelling in pivot mode should keep labels unchanged', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();
        const year = gridApi.getColumn('year')! as AgColumn;
        const date = gridApi.getColumn('date')! as AgColumn;

        getUpdateStrategy(toolPanel).setPivotColumns(true, [year, date], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        getUpdateStrategy(toolPanel).setPivotColumns(true, [date, year], 'toolPanelUi');
        cancelDeferredChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
    });

    test('commit should call exactly one state-application path', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Observe the public batch signal: a single batched state application fires exactly one
        // `columnEverythingChanged`. A redundant grid-state round-trip would fire it twice; a piecemeal
        // path (per-column moveColumns / setColumns / setColumnAggFunc, which emit only granular events)
        // would fire it zero times. Both regressions are caught by asserting exactly one.
        let everythingChangedCount = 0;
        gridApi.addEventListener('columnEverythingChanged', () => {
            everythingChangedCount++;
        });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);

        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any second (redundant) columnEverythingChanged to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        // Turning pivot off applies state in a single batch — exactly one `columnEverythingChanged`.
        expect(everythingChangedCount).toBe(1);
        expect(gridApi.isPivotMode()).toBe(false);
    });

    test('commit raises the pivot change and its column moves before the pivot mode change', async () => {
        const { gridApi, toolPanelGui } = await createDeferredPivotModeGrid();

        getPivotModeToggle(toolPanelGui).click();

        const raised: string[] = [];
        for (const type of ['columnPivotChanged', 'columnMoved', 'columnPivotModeChanged'] as const) {
            gridApi.addEventListener(type, () => {
                raised.push(type);
            });
        }
        getApplyButton(toolPanelGui).click();

        await waitFor(() => expect(raised).toContain('columnPivotModeChanged'), { timeout: 500 });
        await asyncSetTimeout(0);

        expect({ raised, pivotMode: gridApi.isPivotMode() }).toEqual({
            raised: ['columnPivotChanged', 'columnMoved', 'columnPivotModeChanged'],
            pivotMode: false,
        });
    });

    test('turning pivot mode off raises the pivot change before the pivot mode change in the immediate panel, as in the deferred one', async () => {
        /** The ordered pivot events of switching pivot mode off from the panel's toggle, with pivot columns set. */
        async function pivotEventsOfTurningPivotModeOff(
            panel: { gridApi: GridApi; toolPanel: any },
            deferred: boolean
        ): Promise<string[]> {
            const { gridApi, toolPanel } = panel;
            const toolPanelGui: HTMLElement = toolPanel.getGui();
            expect({
                pivotMode: gridApi.isPivotMode(),
                pivots: gridApi.getPivotColumns().map((c) => c.getColId()),
            }).toEqual({ pivotMode: true, pivots: ['year'] });

            const raised: string[] = [];
            for (const type of ['columnPivotChanged', 'columnMoved', 'columnPivotModeChanged'] as const) {
                gridApi.addEventListener(type, () => {
                    raised.push(type);
                });
            }
            // The toggle carries its test id on a debounce, after the panel is up.
            const toggle = await waitFor(() => getPivotModeToggle(toolPanelGui), { timeout: 500 });
            toggle.click();
            if (deferred) {
                // Staged only: the grid has told its listeners nothing yet.
                expect({ raised, pivotMode: gridApi.isPivotMode() }).toEqual({ raised: [], pivotMode: true });
                getApplyButton(toolPanelGui).click();
            }

            await waitFor(() => expect(raised).toContain('columnPivotModeChanged'), { timeout: 500 });
            // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any further event to arrive; polling would pass on the first one
            await asyncSetTimeout(1);
            expect(gridApi.isPivotMode()).toBe(false);
            return raised;
        }

        const deferredPanel = await createDeferredNonPivotGrid();
        deferredPanel.gridApi.setGridOption('pivotMode', true);
        await waitFor(() => expect(deferredPanel.gridApi.isPivotMode()).toBe(true), { timeout: 500 });
        const deferredEvents = await pivotEventsOfTurningPivotModeOff(deferredPanel, true);
        gridMgr.reset();

        const immediateEvents = await pivotEventsOfTurningPivotModeOff(await createNonDeferredPivotModeGrid(), false);

        // The deferred apply's order is the one the sibling test above pins; the immediate toggle must give the same.
        expect({
            deferredEvents,
            immediateEqualsDeferred: immediateEvents.join() === deferredEvents.join(),
            immediatePivotChangedFirst:
                immediateEvents.indexOf('columnPivotChanged') < immediateEvents.indexOf('columnPivotModeChanged'),
            immediateEvents,
        }).toEqual({
            deferredEvents: ['columnPivotChanged', 'columnMoved', 'columnPivotModeChanged'],
            immediateEqualsDeferred: true,
            immediatePivotChangedFirst: true,
            immediateEvents: ['columnPivotChanged', 'columnMoved', 'columnPivotModeChanged'],
        });
    });

    type Marker =
        | 'columnRowGroupChanged'
        | 'columnValueChanged'
        | 'columnPivotChanged'
        | 'columnPivotModeChanged'
        | 'columnMoved'
        | 'sortChanged'
        | 'columnResized'
        | 'columnVisible';
    type Stage = (strategy: IColumnStateUpdateStrategy, col: (colId: string) => AgColumn) => void;
    const stagedRowGroup: Stage = (strategy, col) => strategy.setRowGroupColumns(true, [col('athlete')], 'toolPanelUi');
    const stagedPivotMode: Stage = (strategy) => strategy.setPivotMode(true, true, 'toolPanelUi');
    const stagedMove: Stage = (strategy, col) => strategy.moveColumns(true, [col('age')], 4, 'toolPanelUi');
    type EndState = { rowGroups: string[]; values: string[]; pivots: string[]; pivotMode: boolean };
    const noEnd: EndState = { rowGroups: [], values: [], pivots: [], pivotMode: false };

    test.each<{
        first: string;
        second: string;
        stageFirst: Stage;
        stageSecond: Stage;
        markers: [Marker, Marker];
        end: Partial<EndState>;
    }>([
        {
            first: 'row group',
            second: 'pivot mode',
            stageFirst: stagedRowGroup,
            stageSecond: stagedPivotMode,
            markers: ['columnRowGroupChanged', 'columnPivotModeChanged'],
            end: { rowGroups: ['athlete'], pivotMode: true },
        },
        {
            first: 'row group',
            second: 'move',
            stageFirst: stagedRowGroup,
            stageSecond: stagedMove,
            markers: ['columnRowGroupChanged', 'columnMoved'],
            end: { rowGroups: ['athlete'] },
        },
        {
            first: 'row group',
            second: 'sort',
            stageFirst: stagedRowGroup,
            stageSecond: (strategy, col) => strategy.progressSortFromEvent(true, col('age'), new MouseEvent('click')),
            markers: ['columnRowGroupChanged', 'sortChanged'],
            end: { rowGroups: ['athlete'] },
        },
        {
            first: 'row group',
            second: 'hide',
            stageFirst: stagedRowGroup,
            stageSecond: (strategy, col) => strategy.setColumnsVisible(true, [col('country')], false, 'toolPanelUi'),
            markers: ['columnRowGroupChanged', 'columnVisible'],
            end: { rowGroups: ['athlete'] },
        },
        {
            first: 'row group',
            second: 'width',
            stageFirst: stagedRowGroup,
            stageSecond: (strategy, col) =>
                strategy.applyColumnState(true, [{ colId: col('age').getColId(), width: 321 }], 'toolPanelUi'),
            markers: ['columnRowGroupChanged', 'columnResized'],
            end: { rowGroups: ['athlete'] },
        },
        {
            first: 'value',
            second: 'pivot mode',
            stageFirst: (strategy, col) => strategy.setValueColumns(true, [col('gold')], 'toolPanelUi'),
            stageSecond: stagedPivotMode,
            markers: ['columnValueChanged', 'columnPivotModeChanged'],
            end: { values: ['gold'], pivotMode: true },
        },
        {
            first: 'pivot col',
            second: 'pivot mode',
            stageFirst: (strategy, col) => strategy.setPivotColumns(true, [col('year')], 'toolPanelUi'),
            stageSecond: stagedPivotMode,
            markers: ['columnPivotChanged', 'columnPivotModeChanged'],
            end: { pivots: ['year'], pivotMode: true },
        },
        {
            first: 'pivot mode',
            second: 'row group',
            stageFirst: stagedPivotMode,
            stageSecond: stagedRowGroup,
            markers: ['columnPivotModeChanged', 'columnRowGroupChanged'],
            end: { rowGroups: ['athlete'], pivotMode: true },
        },
        {
            first: 'move',
            second: 'row group',
            stageFirst: stagedMove,
            stageSecond: stagedRowGroup,
            markers: ['columnMoved', 'columnRowGroupChanged'],
            end: { rowGroups: ['athlete'] },
        },
    ])('one Apply tells $first before $second', async ({ stageFirst, stageSecond, markers, end }) => {
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true, enablePivot: true },
            { field: 'age', enableValue: true },
            { field: 'country', enableRowGroup: true, enablePivot: true },
            { field: 'year', enableRowGroup: true, enablePivot: true },
            { field: 'gold', enableValue: true },
        ]);
        const raised: string[] = [];
        const counts = { modelUpdated: 0, displayedColumnsChanged: 0 };
        for (const type of markers) {
            if (type !== 'columnVisible') {
                gridApi.addEventListener(type, () => {
                    raised.push(type);
                });
            }
        }
        gridApi.addEventListener('columnVisible', (event) => {
            if (markers.includes('columnVisible') && event.columns?.some((col) => col.getColId() === 'country')) {
                raised.push(`columnVisible ${event.columns.map((col) => col.getColId())}`);
            }
        });
        gridApi.addEventListener('modelUpdated', () => {
            ++counts.modelUpdated;
        });
        gridApi.addEventListener('displayedColumnsChanged', () => {
            ++counts.displayedColumnsChanged;
        });
        const strategy = getUpdateStrategy(toolPanel);
        const col = (colId: string) => {
            const column = gridApi.getColumn(colId);
            if (!(column instanceof AgColumn)) {
                throw new Error(`no column ${colId}`);
            }
            return column;
        };

        stageFirst(strategy, col);
        stageSecond(strategy, col);
        // Staged only: the grid has told its listeners nothing yet.
        expect(raised).toEqual([]);
        commitChanges(toolPanel);

        // Positive control: the listener saw this apply's last marker.
        const last = markers[1] === 'columnVisible' ? 'columnVisible country' : markers[1];
        await waitFor(() => expect(raised).toContain(last), { timeout: 500 });
        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any further (duplicate) event to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        expect({
            raised,
            counts,
            state: {
                rowGroups: gridApi.getRowGroupColumns().map((c) => c.getColId()),
                values: gridApi.getValueColumns().map((c) => c.getColId()),
                pivots: gridApi.getPivotColumns().map((c) => c.getColId()),
                pivotMode: gridApi.isPivotMode(),
            },
        }).toEqual({
            raised: markers.map((m) => (m === 'columnVisible' ? 'columnVisible country' : m)),
            counts: { modelUpdated: 1, displayedColumnsChanged: 1 },
            state: { ...noEnd, ...end },
        });
    });

    test('one Apply of a row group dragged in, then pivot mode switched on, raises the row group change first', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true },
            { field: 'age' },
            { field: 'country' },
            { field: 'gold' },
        ]);
        const raised: string[] = [];
        for (const type of ['columnRowGroupChanged', 'columnPivotModeChanged'] as const) {
            gridApi.addEventListener(type, () => {
                raised.push(type);
            });
        }

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );
        await waitFor(() => expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete'), {
            timeout: 500,
        });
        getPivotModeToggle(toolPanelGui).click();

        // Staged only: the grid has told its listeners nothing yet.
        expect(raised).toEqual([]);
        getApplyButton(toolPanelGui).click();

        await waitFor(() => expect(raised).toContain('columnPivotModeChanged'), { timeout: 500 });
        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any further (duplicate) event to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        expect({
            raised,
            rowGroups: gridApi.getRowGroupColumns().map((col) => col.getColId()),
            pivotMode: gridApi.isPivotMode(),
        }).toEqual({
            raised: ['columnRowGroupChanged', 'columnPivotModeChanged'],
            rowGroups: ['athlete'],
            pivotMode: true,
        });
    });

    test('one Apply committing a dragged-in row group and a column hide is one column change for grid listeners', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true },
            { field: 'age' },
            { field: 'country' },
            { field: 'gold' },
        ]);
        const raised: string[] = [];
        for (const type of ['displayedColumnsChanged', 'columnRowGroupChanged'] as const) {
            gridApi.addEventListener(type, () => {
                raised.push(type);
            });
        }

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );
        await waitFor(() => expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete'), {
            timeout: 500,
        });

        await renderWholeColumnList(toolPanelGui, 4);
        const ageCheckbox = getColumnListCheckbox(toolPanelGui, 'Age');
        expect(ageCheckbox.checked).toBe(true);
        ageCheckbox.click();
        await waitFor(() => expect(getColumnListCheckbox(toolPanelGui, 'Age').checked).toBe(false), {
            timeout: 500,
        });

        // Staged only: the grid has told its listeners nothing yet.
        expect(raised).toEqual([]);
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        getApplyButton(toolPanelGui).click();

        // Positive control: the listener saw this apply's events.
        await waitFor(() => expect(raised).toContain('columnRowGroupChanged'), { timeout: 500 });
        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any further (duplicate) event to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        // Sorted: the order between the two events is outside the contract, their count is the claim.
        expect({
            raised: [...raised].sort(),
            rowGroups: gridApi.getRowGroupColumns().map((col) => col.getColId()),
            ageVisible: gridApi.getColumn('age')!.isVisible(),
        }).toEqual({
            raised: ['columnRowGroupChanged', 'displayedColumnsChanged'],
            rowGroups: ['athlete'],
            ageVisible: false,
        });
    });

    test('one Apply committing a dragged-in row group and a column reordered in the list ends in the order the panel showed', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredNonPivotGrid([
            { field: 'athlete', enableRowGroup: true },
            { field: 'age' },
            { field: 'country' },
            { field: 'gold' },
        ]);
        const raised: string[] = [];
        gridApi.addEventListener('displayedColumnsChanged', () => {
            raised.push('displayedColumnsChanged');
        });

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );
        await waitFor(() => expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete'), {
            timeout: 500,
        });

        await renderWholeColumnList(toolPanelGui, 4);
        expect(getColumnListLabels(toolPanelGui)).toEqual(['Athlete', 'Age', 'Country', 'Gold']);
        await dragRenderedPrimaryColumnToEndOfPrimaryList(toolPanel, 'Age');
        await waitFor(() => expect(getColumnListLabels(toolPanelGui)).toEqual(['Athlete', 'Country', 'Gold', 'Age']), {
            timeout: 500,
        });

        // Staged only: the grid has told its listeners nothing yet.
        expect(raised).toEqual([]);
        expect(gridApi.getRowGroupColumns()).toEqual([]);
        expect(getApplyButton(toolPanelGui).disabled).toBe(false);

        getApplyButton(toolPanelGui).click();

        // Positive control: the listener saw this apply's event.
        await waitFor(() => expect(raised).toContain('displayedColumnsChanged'), { timeout: 500 });
        // eslint-disable-next-line no-restricted-syntax -- waits a macrotask for any further (duplicate) event to arrive; polling would pass on the first event and never catch the duplicate
        await asyncSetTimeout(1);

        expect({
            raised,
            rowGroups: gridApi.getRowGroupColumns().map((col) => col.getColId()),
            order: gridApi.getColumnState().map((state) => state.colId),
        }).toEqual({
            raised: ['displayedColumnsChanged'],
            rowGroups: ['athlete'],
            order: ['ag-Grid-AutoColumn', 'athlete', 'country', 'gold', 'age'],
        });
    });

    test('an aggregation throwing while the commit switches pivot mode off leaves pivot mode off and the grid told of it', async () => {
        let aggregationArmed = false;
        const { gridApi, toolPanel } = await createDeferredNonPivotGrid([
            { field: 'country', rowGroup: true, enableRowGroup: true, enablePivot: true },
            { field: 'year', pivot: true, enableRowGroup: true, enablePivot: true },
            {
                field: 'gold',
                enableValue: true,
                aggFunc: (params) => {
                    if (aggregationArmed) {
                        throw new Error('aggregation failed');
                    }
                    return params.values.reduce((sum, value) => sum + value, 0);
                },
            },
        ]);
        gridApi.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        expect(gridApi.isPivotMode()).toBe(true);
        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        const pivotModeChanges: boolean[] = [];
        gridApi.addEventListener('columnPivotModeChanged', () => pivotModeChanges.push(gridApi.isPivotMode()));

        aggregationArmed = true;
        expect(() => commitChanges(toolPanel)).toThrow('aggregation failed');
        aggregationArmed = false;

        expect(gridApi.isPivotMode()).toBe(false);
        await waitFor(() => expect(pivotModeChanges).toEqual([false]), { timeout: 500 });
    });

    test('toggling pivot mode in deferred mode persists pivot state to grid state and restores pivot columns', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });

        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getState().pivot?.pivotMode ?? false).toBe(false);

        getUpdateStrategy(toolPanel).setPivotMode(true, true, 'toolPanelUi');
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(true);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);
        expect(gridApi.getState().pivot).toEqual({
            pivotMode: true,
            pivotColIds: ['year'],
            pivotSortModel: [{ colId: 'year', sort: 'asc' }],
        });
    });

    test('commit should make exactly one server call', async () => {
        const { gridApi, toolPanelGui, serverGetDataSpy } = await createDeferredPivotModeGrid();
        const initialCallCount = serverGetDataSpy.mock.calls.length;

        getPivotModeToggle(toolPanelGui).click();
        getApplyButton(toolPanelGui).click();
        await waitForNoLoadingRows(gridApi);

        expect(serverGetDataSpy.mock.calls.length - initialCallCount).toBe(1);
    });

    test('dragging an unchecked column from the column list into row groups in deferred pivot mode stages the pill and checkbox', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(false);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).not.toContain('Athlete');

        await dragRenderedPrimaryColumnToRowGroups(
            toolPanel,
            toolPanelGui,
            'Athlete',
            toolPanel.rowGroupDropZonePanel.getGui()
        );

        await waitFor(() =>
            expect(
                getUpdateStrategy(toolPanel)
                    .getRowGroupColumns(true)
                    .map((col) => col.getColId())
                    .sort()
            ).toEqual(['athlete', 'country', 'sport'])
        );
        expect(createPrimaryColumnComp(toolPanel, 'Athlete').isSelected()).toBe(true);
        expect(getDropZoneText(toolPanel.rowGroupDropZonePanel)).toContain('Athlete');
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the deferred tool panel into external header drop zones should be prohibited', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;

        const rowGroupBefore = gridApi.getRowGroupColumns().map((col) => col.getColId());
        const pivotBefore = gridApi.getPivotColumns().map((col) => col.getColId());
        const deferredRowGroupBefore = getUpdateStrategy(toolPanel)
            .getRowGroupColumns(true)
            .map((col) => col.getColId());
        const deferredPivotBefore = getUpdateStrategy(toolPanel)
            .getPivotColumns(true)
            .map((col) => col.getColId());

        // Drag a CTP column to the live header row-group drop zone. In deferred mode this is
        // rejected by the drop-zone predicate (no `data-column-tool-panel-deferred` allowed).
        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        // Drag the same column to the live header pivot drop zone — also rejected.
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Neither live state nor deferred state should have changed.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(rowGroupBefore);
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(pivotBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredRowGroupBefore);
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(deferredPivotBefore);
    });

    test('dragging a CTP column to the header pivot panel in deferred mode should not apply changes', async () => {
        const { gridApi, toolPanel, toolPanelGui } = await createDeferredPivotModeGrid();

        // Athlete is not a pivot column initially
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Get the header (horizontal) pivot drop zone GUI from the grid DOM
        const gridEl = getGridElement(gridApi)!;
        const headerPivotDropZone = gridEl.querySelector('.ag-column-drop-horizontal-pivot') as HTMLElement;
        expect(headerPivotDropZone).toBeTruthy();

        // Simulate full drag from CTP column list to header pivot panel
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerPivotDropZone);

        // Grid pivot columns should remain unchanged (no immediate apply)
        expect(gridApi.getPivotColumns().map((col) => col.getColId())).toEqual(['year']);

        // Deferred state should also remain unchanged (drag should be fully rejected)
        expect(
            getUpdateStrategy(toolPanel)
                .getPivotColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['year']);
    });

    test('onGridExit and onGridEnter drag callbacks should be no-ops in deferred mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotModeGrid();

        // Country is an active row group
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);

        // Create a Country column comp (which registers drag source with onGridExit/onGridEnter)
        const countryComp = createPrimaryColumnComp(toolPanel, 'Country');
        const onChangeCommonSpy = vi.spyOn(countryComp, 'onChangeCommon');

        // Find the drag source via dragSourceAndParamsList
        const dragAndDrop = countryComp.beans.dragAndDrop;
        const entry = dragAndDrop['dragSourceAndParamsList'].find(
            (e: any) => e.dragSource.eElement === countryComp.eDragHandle
        );
        expect(entry).toBeTruthy();
        const dragSource = entry.dragSource;

        // Trigger onGridExit — should not call onChangeCommon in deferred mode
        dragSource.onGridExit(null);

        expect(onChangeCommonSpy).not.toHaveBeenCalled();

        // Deferred state should remain unchanged
        expect(
            getUpdateStrategy(toolPanel)
                .getRowGroupColumns(true)
                .map((col) => col.getColId())
        ).toEqual(['country', 'sport']);

        // Grid state should remain unchanged
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toEqual(['country', 'sport']);
    });

    test('dragging from the non-deferred tool panel into external header drop zones should remain allowed', async () => {
        const { gridApi, toolPanel } = await createNonDeferredPivotModeGrid();
        const gridEl = getGridElement(gridApi)!;
        const toolPanelGui = toolPanel.getGui() as HTMLElement;

        // Athlete is not yet a row group — drag it to the live header row-group drop zone.
        // In non-deferred mode the drop is allowed → it becomes a row-group column immediately.
        expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).not.toContain('athlete');

        const headerRowGroupDropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement;
        expect(headerRowGroupDropZone).toBeTruthy();
        await dragRenderedPrimaryColumnToRowGroups(toolPanel, toolPanelGui, 'Athlete', headerRowGroupDropZone);

        await waitFor(() => expect(gridApi.getRowGroupColumns().map((col) => col.getColId())).toContain('athlete'));
    });

    test('dragging into column groups is allowed after clearing groups, labels and aggregations then committing non-pivot mode', async () => {
        const { gridApi, toolPanel } = await createDeferredPivotAggregationGrid();

        getUpdateStrategy(toolPanel).setRowGroupColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setValueColumns(true, [], 'toolPanelUi');
        getUpdateStrategy(toolPanel).setPivotMode(true, false, 'toolPanelUi');
        toolPanel['onPivotModePanelValueChanged']();
        commitChanges(toolPanel);
        await waitForNoLoadingRows(gridApi);

        expect(gridApi.isPivotMode()).toBe(false);
        expect(gridApi.getRowGroupColumns()).toEqual([]);
        expect(gridApi.getPivotColumns()).toEqual([]);
        expect(gridApi.getValueColumns()).toEqual([]);
        expect(toolPanel.rowGroupDropZonePanel.isInterestedIn(DragSourceType.ToolPanel)).toBe(true);
    });
});
