import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule, NumberEditorModule, TextEditorModule } from 'ag-grid-community';
import type { GridApi, IRowNode } from 'ag-grid-community';
import { PivotModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../../../test-utils';
import { editCell } from '../group-edit-test-utils';

type EditEvent = {
    type: string;
    value?: any;
    newValue?: any;
    oldValue?: any;
    valueChanged?: boolean;
    source?: string;
    data?: any;
    rowNodeData?: any;
};

describe('enableGroupEdit with pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            RowGroupingEditModule,
            TextEditorModule,
            NumberEditorModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    async function createPivotGrid(events: EditEvent[]) {
        // Use data that matches the e2e test (small-olympic-winners.json) for United States year 2000:
        // gold: 2+2+3=7, silver: 0+1+0=1, bronze: 3+1+1=5
        const api = await gridsManager.createGridAndWait('pivot-enableGroupEdit', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                { field: 'bronze', aggFunc: 'sum' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 130,
                editable: true,
            },
            autoGroupColumnDef: {
                minWidth: 200,
                editable: true,
            },
            enableGroupEdit: true,
            pivotMode: true,
            groupDefaultExpanded: 0,
            // Matches small-olympic-winners.json United States data
            rowData: [
                { country: 'United States', year: 2000, gold: 2, silver: 0, bronze: 3 }, // Dara Torres
                { country: 'United States', year: 2000, gold: 2, silver: 1, bronze: 1 }, // Gary Hall Jr.
                { country: 'United States', year: 2000, gold: 3, silver: 0, bronze: 1 }, // Jenny Thompson
            ],
            onCellEditingStarted: (event) => {
                events.push({
                    type: 'cellEditingStarted',
                    value: event.value,
                    data: event.data ? JSON.parse(JSON.stringify(event.data)) : event.data,
                    rowNodeData: event.node?.data ? JSON.parse(JSON.stringify(event.node.data)) : event.node?.data,
                });
            },
            onCellValueChanged: (event) => {
                events.push({
                    type: 'cellValueChanged',
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    source: event.source,
                    data: event.data ? JSON.parse(JSON.stringify(event.data)) : event.data,
                    rowNodeData: event.node?.data ? JSON.parse(JSON.stringify(event.node.data)) : event.node?.data,
                });
            },
            onCellEditingStopped: (event) => {
                events.push({
                    type: 'cellEditingStopped',
                    value: event.value,
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    valueChanged: event.valueChanged,
                    data: event.data ? JSON.parse(JSON.stringify(event.data)) : event.data,
                    rowNodeData: event.node?.data ? JSON.parse(JSON.stringify(event.node.data)) : event.node?.data,
                });
            },
        });

        await asyncSetTimeout(1);

        const pivotColumns = api.getPivotResultColumns();
        const pivotCol2000Gold = pivotColumns?.find(
            (col) => col.getColId().includes('2000') && col.getColId().includes('gold')
        );
        expect(pivotCol2000Gold).toBeDefined();

        const usaNode = api.getRowNode('row-group-country-United States');
        expect(usaNode).toBeDefined();

        return {
            api,
            pivotCol2000GoldId: pivotCol2000Gold!.getColId(),
            usaNode: usaNode!,
        };
    }

    function locateCell(api: GridApi, rowNode: IRowNode, colId: string) {
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const rowId = rowNode.id;
        const rowIndex = rowNode.rowIndex;
        let cell = gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`);
        if (!cell && rowIndex != null) {
            const rowElement = gridDiv.querySelector<HTMLElement>(`.ag-row[aria-rowindex="${rowIndex + 1}"]`);
            cell = rowElement?.querySelector<HTMLElement>(`[col-id="${colId}"]`) ?? null;
        }
        expect(cell).not.toBeNull();
        return { gridDiv, cell: cell!, rowIndex: rowIndex! };
    }

    test('cellValueChanged not fired without groupRowValueSetter', async () => {
        const events: EditEvent[] = [];
        const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

        expect(usaNode.data).toBeUndefined(); // Group row has no data initially

        // First edit - without groupRowValueSetter, cellValueChanged should NOT fire
        // and the group row data should NOT be created (preserving legacy behavior)
        await editCell(api, usaNode, pivotCol2000GoldId, '1234');
        await asyncSetTimeout(0);

        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({
            type: 'cellEditingStarted',
            value: 7,
            data: undefined,
            rowNodeData: undefined,
        });
        expect(events.find((e) => e.type === 'cellValueChanged')).toBeUndefined();
        expect(events[1]).toMatchObject({
            type: 'cellEditingStopped',
            newValue: 1234,
            oldValue: 7,
            valueChanged: true,
            data: undefined,
            rowNodeData: undefined,
        });

        // Group row data should still be undefined - we don't create it without groupRowValueSetter
        expect(usaNode.data).toBeUndefined();

        // Second edit - re-editing should still NOT fire cellValueChanged (data is still not created)
        events.length = 0;
        await editCell(api, usaNode, pivotCol2000GoldId, '5678');
        await asyncSetTimeout(0);

        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({
            type: 'cellEditingStarted',
            value: 7,
            data: undefined,
            rowNodeData: undefined,
        }); // Still shows aggregated value
        expect(events.find((e) => e.type === 'cellValueChanged')).toBeUndefined();
        expect(events[1]).toMatchObject({
            type: 'cellEditingStopped',
            newValue: 5678,
            oldValue: 7,
            valueChanged: true,
            data: undefined,
            rowNodeData: undefined,
        });

        // Data should remain undefined
        expect(usaNode.data).toBeUndefined();
    });

    // Tests ported from e2e: documentation/ag-grid-docs/src/content/docs/pivoting-result-columns/_examples/pivot-result-summary/example.spec.ts
    describe('keyboard-started edit', () => {
        test('finish with Enter', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell, rowIndex } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.click(cell);
            api.setFocusedCell(rowIndex, pivotCol2000GoldId);
            await asyncSetTimeout(0);

            // Start editing by pressing a key (keyboard-started edit)
            await userEvent.keyboard('1');
            const input = await waitForInput(gridDiv, cell);
            await userEvent.type(input, '234');
            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7 },
                {
                    type: 'cellEditingStopped',
                    newValue: 1234,
                    oldValue: 7,
                    value: 7,
                    valueChanged: true,
                },
            ]);
        });

        test('finish with Escape', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell, rowIndex } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.click(cell);
            api.setFocusedCell(rowIndex, pivotCol2000GoldId);
            await asyncSetTimeout(0);

            // Start editing by pressing a key (keyboard-started edit)
            await userEvent.keyboard('1');
            const input = await waitForInput(gridDiv, cell);
            await userEvent.type(input, '234');
            await userEvent.keyboard('{Escape}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7 },
                {
                    type: 'cellEditingStopped',
                    newValue: undefined,
                    oldValue: 7,
                    value: 7,
                    valueChanged: false,
                },
            ]);
        });

        test('finish with Tab', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell, rowIndex } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.click(cell);
            api.setFocusedCell(rowIndex, pivotCol2000GoldId);
            await asyncSetTimeout(0);

            // Start editing by pressing a key (keyboard-started edit)
            await userEvent.keyboard('1');
            const input = await waitForInput(gridDiv, cell);
            await userEvent.type(input, '234');
            await userEvent.keyboard('{Tab}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7, data: undefined, rowNodeData: undefined },
                {
                    type: 'cellEditingStopped',
                    newValue: 1234,
                    oldValue: 7,
                    value: 7,
                    valueChanged: true,
                    data: undefined,
                    rowNodeData: undefined,
                },
                { type: 'cellEditingStarted', value: 1, data: undefined, rowNodeData: undefined }, // Next cell (2000 silver) starts editing
            ]);
        });
    });

    describe('double-click-started edit', () => {
        test('finish with Enter', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.dblClick(cell);
            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.type(input, '1234');
            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7, data: undefined, rowNodeData: undefined },
                {
                    type: 'cellEditingStopped',
                    newValue: 1234,
                    oldValue: 7,
                    value: 7,
                    valueChanged: true,
                    data: undefined,
                    rowNodeData: undefined,
                },
            ]);
        });

        test('finish with Escape', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.dblClick(cell);
            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.type(input, '1234');
            await userEvent.keyboard('{Escape}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7, data: undefined, rowNodeData: undefined },
                {
                    type: 'cellEditingStopped',
                    newValue: undefined,
                    oldValue: 7,
                    value: 7,
                    valueChanged: false,
                    data: undefined,
                    rowNodeData: undefined,
                },
            ]);
        });

        test('finish with Tab', async () => {
            const events: EditEvent[] = [];
            const { api, pivotCol2000GoldId, usaNode } = await createPivotGrid(events);

            const { gridDiv, cell } = locateCell(api, usaNode, pivotCol2000GoldId);
            await userEvent.dblClick(cell);
            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.type(input, '1234');
            await userEvent.keyboard('{Tab}');
            await asyncSetTimeout(0);

            expect(events).toMatchObject([
                { type: 'cellEditingStarted', value: 7, data: undefined, rowNodeData: undefined },
                {
                    type: 'cellEditingStopped',
                    newValue: 1234,
                    oldValue: 7,
                    value: 7,
                    valueChanged: true,
                    data: undefined,
                    rowNodeData: undefined,
                },
                { type: 'cellEditingStarted', value: 1, data: undefined, rowNodeData: undefined }, // Next cell (2000 silver) starts editing
            ]);
        });
    });
});
