import { GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

describe('ag-grid grouping min / max aggregation of dates', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // dates are created in local time, so the formatted output does not depend on the time zone
    const createRowData = () =>
        cachedJSONObjects.array([
            {
                id: '1',
                country: 'United States',
                athlete: 'Michael Phelps',
                total: 8,
                date: new Date(2008, 7, 24),
                dateTime: new Date(2008, 7, 24, 9, 30, 0),
                dateString: '2008-08-24',
                dateTimeString: '2008-08-24T09:30:00',
            },
            {
                id: '2',
                country: 'United States',
                athlete: 'Michael Phelps',
                total: 8,
                date: new Date(2004, 7, 29),
                dateTime: new Date(2004, 7, 29, 18, 5, 10),
                dateString: '2004-08-29',
                dateTimeString: '2004-08-29T18:05:10',
            },
            {
                id: '3',
                country: 'United States',
                athlete: 'Michael Phelps',
                total: 6,
                date: new Date(2012, 7, 12),
                dateTime: new Date(2012, 7, 12, 12, 25, 59),
                dateString: '2012-08-12',
                dateTimeString: '2012-08-12T12:25:59',
            },
            {
                id: '4',
                country: 'United States',
                athlete: 'Natalie Coughlin',
                total: 6,
                date: new Date(2008, 7, 24),
                dateTime: new Date(2008, 7, 24, 7, 0, 0),
                dateString: '2008-08-24',
                dateTimeString: '2008-08-24T07:00:00',
            },
            {
                id: '5',
                country: 'Russia',
                athlete: 'Aleksey Nemov',
                total: 6,
                date: new Date(2000, 9, 1),
                dateTime: new Date(2000, 9, 1, 14, 45, 30),
                dateString: '2000-10-01',
                dateTimeString: '2000-10-01T14:45:30',
            },
        ]);

    const createGridOptions = (aggFunc: 'min' | 'max'): GridOptions => ({
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'athlete', rowGroup: true, hide: true },
            { field: 'total', aggFunc },
            { field: 'date', cellDataType: 'date', aggFunc },
            { field: 'dateTime', cellDataType: 'dateTime', aggFunc },
            { field: 'dateString', cellDataType: 'dateString', aggFunc },
            { field: 'dateTimeString', cellDataType: 'dateTimeString', aggFunc },
        ],
        autoGroupColumnDef: { headerName: 'Group' },
        animateRows: false,
        groupDefaultExpanded: -1,
        rowData: createRowData(),
        getRowId: (params) => params.data.id,
    });

    test('max returns the latest date of each date data type', async () => {
        const api = gridsManager.createGrid('myGrid', createGridOptions('max'));

        await new GridRows(api, 'max').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States" total:8 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" total:8 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ │ ├── LEAF id:1 country:"United States" athlete:"Michael Phelps" total:8 date:"2008-08-24" dateTime:"2008-08-24T09:30:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T09:30:00"
            │ │ ├── LEAF id:2 country:"United States" athlete:"Michael Phelps" total:8 date:"2004-08-29" dateTime:"2004-08-29T18:05:10" dateString:"2004-08-29" dateTimeString:"2004-08-29T18:05:10"
            │ │ └── LEAF id:3 country:"United States" athlete:"Michael Phelps" total:6 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ └─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            │ · └── LEAF id:4 country:"United States" athlete:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            └─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
            · └─┬ LEAF_GROUP id:"row-group-country-Russia-athlete-Aleksey Nemov" ag-Grid-AutoColumn:"Aleksey Nemov" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
            · · └── LEAF id:5 country:"Russia" athlete:"Aleksey Nemov" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
        `);
    });

    test('min returns the earliest date of each date data type', async () => {
        const api = gridsManager.createGrid('myGrid', createGridOptions('min'));

        await new GridRows(api, 'min').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States" total:6 date:"2004-08-29" dateTime:"2004-08-29T18:05:10" dateString:"2004-08-29" dateTimeString:"2004-08-29T18:05:10"
            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" total:6 date:"2004-08-29" dateTime:"2004-08-29T18:05:10" dateString:"2004-08-29" dateTimeString:"2004-08-29T18:05:10"
            │ │ ├── LEAF id:1 country:"United States" athlete:"Michael Phelps" total:8 date:"2008-08-24" dateTime:"2008-08-24T09:30:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T09:30:00"
            │ │ ├── LEAF id:2 country:"United States" athlete:"Michael Phelps" total:8 date:"2004-08-29" dateTime:"2004-08-29T18:05:10" dateString:"2004-08-29" dateTimeString:"2004-08-29T18:05:10"
            │ │ └── LEAF id:3 country:"United States" athlete:"Michael Phelps" total:6 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ └─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            │ · └── LEAF id:4 country:"United States" athlete:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            └─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
            · └─┬ LEAF_GROUP id:"row-group-country-Russia-athlete-Aleksey Nemov" ag-Grid-AutoColumn:"Aleksey Nemov" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
            · · └── LEAF id:5 country:"Russia" athlete:"Aleksey Nemov" total:6 date:"2000-10-01" dateTime:"2000-10-01T14:45:30" dateString:"2000-10-01" dateTimeString:"2000-10-01T14:45:30"
        `);
    });

    test('max returns the original value, keeping the data type of the column', async () => {
        const api = gridsManager.createGrid('myGrid', createGridOptions('max'));

        const phelps = api.getRowNode('row-group-country-United States-athlete-Michael Phelps')!;
        const latestRow = api.getRowNode('3')!;

        expect(phelps.aggData.date).toBe(latestRow.data.date);
        expect(phelps.aggData.dateTime).toBe(latestRow.data.dateTime);
        expect(phelps.aggData.dateString).toBe('2012-08-12');
        expect(phelps.aggData.dateTimeString).toBe('2012-08-12T12:25:59');
    });

    test('max updates when a leaf date changes', async () => {
        const api = gridsManager.createGrid('myGrid', createGridOptions('max'));

        applyTransactionChecked(api, {
            update: [
                {
                    ...api.getRowNode('5')!.data,
                    date: new Date(2016, 7, 10),
                    dateTime: new Date(2016, 7, 10, 10, 0, 0),
                    dateString: '2016-08-10',
                    dateTimeString: '2016-08-10T10:00:00',
                },
            ],
        });

        await new GridRows(api, 'after update').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States" total:8 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" total:8 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ │ ├── LEAF id:1 country:"United States" athlete:"Michael Phelps" total:8 date:"2008-08-24" dateTime:"2008-08-24T09:30:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T09:30:00"
            │ │ ├── LEAF id:2 country:"United States" athlete:"Michael Phelps" total:8 date:"2004-08-29" dateTime:"2004-08-29T18:05:10" dateString:"2004-08-29" dateTimeString:"2004-08-29T18:05:10"
            │ │ └── LEAF id:3 country:"United States" athlete:"Michael Phelps" total:6 date:"2012-08-12" dateTime:"2012-08-12T12:25:59" dateString:"2012-08-12" dateTimeString:"2012-08-12T12:25:59"
            │ └─┬ LEAF_GROUP id:"row-group-country-United States-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            │ · └── LEAF id:4 country:"United States" athlete:"Natalie Coughlin" total:6 date:"2008-08-24" dateTime:"2008-08-24T07:00:00" dateString:"2008-08-24" dateTimeString:"2008-08-24T07:00:00"
            └─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" total:6 date:"2016-08-10" dateTime:"2016-08-10T10:00:00" dateString:"2016-08-10" dateTimeString:"2016-08-10T10:00:00"
            · └─┬ LEAF_GROUP id:"row-group-country-Russia-athlete-Aleksey Nemov" ag-Grid-AutoColumn:"Aleksey Nemov" total:6 date:"2016-08-10" dateTime:"2016-08-10T10:00:00" dateString:"2016-08-10" dateTimeString:"2016-08-10T10:00:00"
            · · └── LEAF id:5 country:"Russia" athlete:"Aleksey Nemov" total:6 date:"2016-08-10" dateTime:"2016-08-10T10:00:00" dateString:"2016-08-10" dateTimeString:"2016-08-10T10:00:00"
        `);
    });

    test('strings in a text column are not aggregated as dates', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, hide: true },
                { field: 'dateString', cellDataType: 'text', aggFunc: 'max' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: createRowData(),
            getRowId: (params) => params.data.id,
        });

        const phelps = api.getRowNode('row-group-athlete-Michael Phelps')!;
        expect(phelps.aggData.dateString).toBeNull();
    });
});
