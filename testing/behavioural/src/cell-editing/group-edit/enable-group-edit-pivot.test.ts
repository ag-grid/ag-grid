import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { expect } from '../../test-utils/matchers';
import { cascadeGroupRowValueSetter, editCell } from './group-edit-test-utils';

/**
 * Tests for the deprecated `enableGroupEdit` grid option with pivot mode.
 * This is a regression test for the pivot-result-summary e2e test.
 */
describe('enableGroupEdit grid option (deprecated) with pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Comprehensive test covering cellValueChanged behaviour with and without groupRowValueSetter
    // Also verifies re-editing after group row data was auto-created behaves correctly
    test('cellValueChanged fires only when groupRowValueSetter is defined, re-edit works correctly', async () => {
        const events: {
            type: string;
            value?: any;
            newValue?: any;
            oldValue?: any;
            valueChanged?: boolean;
            source?: string;
        }[] = [];

        // Setup without groupRowValueSetter (matches e2e test pivot-result-summary)
        const api = await gridsManager.createGridAndWait('pivot-enableGroupEdit', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 130,
                editable: true,
            },
            enableGroupEdit: true,
            pivotMode: true,
            groupDefaultExpanded: 0,
            rowData: [
                { country: 'USA', year: 2000, gold: 7 },
                { country: 'USA', year: 2004, gold: 1 },
            ],
            onCellEditingStarted: (event) => {
                events.push({ type: 'cellEditingStarted', value: event.value });
            },
            onCellValueChanged: (event) => {
                events.push({
                    type: 'cellValueChanged',
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    source: event.source,
                });
            },
            onCellEditingStopped: (event) => {
                events.push({
                    type: 'cellEditingStopped',
                    value: event.value,
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    valueChanged: event.valueChanged,
                });
            },
        });

        await asyncSetTimeout(1);

        const pivotColumns = api.getPivotResultColumns();
        const pivotCol2000Gold = pivotColumns?.find(
            (col) => col.getColId().includes('2000') && col.getColId().includes('gold')
        );
        expect(pivotCol2000Gold).toBeDefined();
        const pivotColId = pivotCol2000Gold!.getColId();

        const usaNode = api.getRowNode('row-group-country-USA');
        expect(usaNode).toBeDefined();
        expect(usaNode!.data).toBeUndefined(); // Group row has no data initially

        // First edit - without groupRowValueSetter, cellValueChanged should NOT fire
        await editCell(api, usaNode!, pivotColId, '1234');
        await asyncSetTimeout(0);

        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({ type: 'cellEditingStarted', value: 7 });
        expect(events.find((e) => e.type === 'cellValueChanged')).toBeUndefined();
        expect(events[1]).toMatchObject({
            type: 'cellEditingStopped',
            newValue: 1234,
            oldValue: 7,
            valueChanged: true,
        });

        // After first edit, group row now has auto-created data object
        expect(usaNode!.data).toBeDefined();

        // Second edit - re-editing after data was created should still NOT fire cellValueChanged
        // This verifies the fix handles the case where data already exists
        events.length = 0;
        await editCell(api, usaNode!, pivotColId, '5678');
        await asyncSetTimeout(0);

        expect(events).toHaveLength(2);
        expect(events[0]).toMatchObject({ type: 'cellEditingStarted', value: 7 }); // Still shows aggregated value
        expect(events.find((e) => e.type === 'cellValueChanged')).toBeUndefined();
        expect(events[1]).toMatchObject({
            type: 'cellEditingStopped',
            newValue: 5678,
            oldValue: 7,
            valueChanged: true,
        });
    });

    test('cellValueChanged fires when groupRowValueSetter is defined', async () => {
        const events: {
            type: string;
            value?: any;
            newValue?: any;
            oldValue?: any;
            valueChanged?: boolean;
            source?: string;
        }[] = [];

        const api = await gridsManager.createGridAndWait('pivot-enableGroupEdit-with-setter', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', pivot: true },
                {
                    field: 'gold',
                    aggFunc: 'sum',
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 130,
                editable: true,
            },
            enableGroupEdit: true,
            pivotMode: true,
            groupDefaultExpanded: 0,
            rowData: [
                { country: 'USA', year: 2000, gold: 7 },
                { country: 'USA', year: 2004, gold: 1 },
            ],
            onCellEditingStarted: (event) => {
                events.push({ type: 'cellEditingStarted', value: event.value });
            },
            onCellValueChanged: (event) => {
                events.push({
                    type: 'cellValueChanged',
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    source: event.source,
                });
            },
            onCellEditingStopped: (event) => {
                events.push({
                    type: 'cellEditingStopped',
                    value: event.value,
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    valueChanged: event.valueChanged,
                });
            },
        });

        await asyncSetTimeout(1);

        const pivotColumns = api.getPivotResultColumns();
        const pivotCol2000Gold = pivotColumns?.find(
            (col) => col.getColId().includes('2000') && col.getColId().includes('gold')
        );
        const pivotColId = pivotCol2000Gold!.getColId();
        const usaNode = api.getRowNode('row-group-country-USA');

        // With groupRowValueSetter, cellValueChanged SHOULD fire
        await editCell(api, usaNode!, pivotColId, '1234');
        await asyncSetTimeout(0);

        expect(events[0]).toMatchObject({ type: 'cellEditingStarted', value: 7 });
        const cellValueChangedEvents = events.filter((e) => e.type === 'cellValueChanged');
        expect(cellValueChangedEvents.length).toBeGreaterThan(0);
        expect(cellValueChangedEvents[0]).toMatchObject({
            type: 'cellValueChanged',
            newValue: 1234,
            oldValue: 7,
            source: 'edit',
        });

        // Verify grid state updated (cascade distributed value to the single 2000 leaf)
        const usaLeaf2000 = api
            .getRowNode('row-group-country-USA')
            ?.allLeafChildren?.find((n) => n.data?.year === 2000);
        expect(usaLeaf2000?.data?.gold).toBe(1234);
    });
});
