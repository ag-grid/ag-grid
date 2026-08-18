import { GridColumns, GridRows, assertSelectedRowsById, assertSelectedRowsByIndex } from 'ag-test-utils';

import { createGridAndWait, groupGridOptions, setupRowSelectionSuite } from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('Basic Interactions', () => {
        describe('Group selection', () => {
            setupRowSelectionSuite();

            test('Checkbox location can be altered with `checkboxLocation` setting', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', checkboxes: true },
                });
                await new GridColumns(api, `Checkbox location can be altered with _checkboxLocation_ setting setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `Checkbox location can be altered with _checkboxLocation_ setting setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `
                );

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-SelectionColumn'
                );
                const colState1 = api.getColumnState();
                expect(colState1[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeTruthy();

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    checkboxes: true,
                    checkboxLocation: 'autoGroupColumn',
                });
                await new GridColumns(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-AutoColumn'
                );
                const colState2 = api.getColumnState();
                expect(colState2[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeFalsy();

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    checkboxes: true,
                    checkboxLocation: 'selectionColumn',
                });
                await new GridColumns(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection #2`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Checkbox location can be altered with _checkboxLocation_ setting after setGridOption rowSelection #2`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(actions.getRowByIndex(0)?.querySelector('[role="gridcell"]')?.getAttribute('col-id')).toEqual(
                    'ag-Grid-SelectionColumn'
                );
                const colState3 = api.getColumnState();
                expect(colState3[0].colId.startsWith('ag-Grid-SelectionColumn')).toBeTruthy();
            });

            test('clicking checkbox does nothing if row selection not enabled', async () => {
                const [api, actions] = await createGridAndWait(groupGridOptions);
                await new GridColumns(api, `clicking checkbox does nothing if row selection not enabled setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `clicking checkbox does nothing if row selection not enabled final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
            });

            test('toggling group row selects only that row', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow' },
                });

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([0], api);
                await new GridRows(api, `toggling group row selects only that row final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('clicking group row with `groupSelects = "descendants"` selects group and descendants', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants', enableClickSelection: true },
                });

                actions.clickRowByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "descendants"_ selects group and descend final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF selected id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('toggling group row with `groupSelects = "descendants"` enabled selects that row and all its children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);

                // Can un-select child row
                actions.toggleCheckboxByIndex(4);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14], api);

                // Toggling group row from indeterminate state selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 4], api);

                // Toggle group row again de-selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);
                await new GridRows(
                    api,
                    `toggling group row with _groupSelects = "descendants"_ enabled selects that row  final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('clicking group row with `groupSelects = "filteredDescendants"` enabled selects that row and all its filtered children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                    quickFilterText: 'ing',
                });
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Group selects children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Group checkbox is indeterminate because rows are filtered out
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Can un-select child row
                actions.toggleCheckboxByIndex(4);
                expect(api.getDisplayedRowAtIndex(0)?.isSelected()).toEqual(undefined);
                assertSelectedRowsById(['0', '1', '3', '6', '7', '8', '9', '11', '18', '20'], api);

                // Toggling group row from indeterminate state re-selects all visible children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Group checkbox is still indeterminate because rows are still filtered out
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Remove filter
                api.setGridOption('quickFilterText', undefined);
                await new GridColumns(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking group row with _groupSelects = "filteredDescendants"_ enabled selects t after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler indeterminate id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP indeterminate id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // Toggling indeterminate group row checkbox now transitions to checked state
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '13',
                        '18',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Swimming',
                        'row-group-country-United States-sport-Gymnastics',
                    ],
                    api
                );
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBe(true);
            });

            test('clicking indeterminate group row checkbox when filtered out children are selected and `groupSelects: "filteredDescendants"` selects all children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                });

                // Group selects all children
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '13',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Gymnastics',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                // Filter rows
                api.setGridOption('quickFilterText', 'ing');
                await new GridColumns(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte after setGridOption quickFilterText`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when filtered out children are selecte after setGridOption quickFilterText`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                // De-select group row
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(['13'], api);
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBeUndefined();

                // Toggle indeterminate re-selects all nodes
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '13',
                        '20',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Gymnastics',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );
                expect(api.getDisplayedRowAtIndex(0)!.isSelected()).toBe(true);
            });

            test('clicking indeterminate group row checkbox when only visible children are selected and `groupSelects: "filteredDescendants" de-selects all children', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'filteredDescendants' },
                    quickFilterText: 'ing',
                });

                // Select all filtered children individually
                actions.toggleCheckboxById('0');
                actions.toggleCheckboxById('1');
                actions.toggleCheckboxById('2');
                actions.toggleCheckboxById('3');
                actions.toggleCheckboxById('6');
                actions.toggleCheckboxById('7');
                actions.toggleCheckboxById('8');
                actions.toggleCheckboxById('9');
                actions.toggleCheckboxById('11');
                actions.toggleCheckboxById('18');
                actions.toggleCheckboxById('20');
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        '20',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );

                actions.toggleCheckboxById('row-group-country-United States');
                assertSelectedRowsById([], api);
                await new GridRows(
                    api,
                    `clicking indeterminate group row checkbox when only visible children are selecte final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Cannot select group rows where `isRowSelectable` returns false and `groupSelects` = "self"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(2);
                assertSelectedRowsByIndex([2], api);
                await new GridRows(
                    api,
                    `Cannot select group rows where _isRowSelectable_ returns false and _groupSelects final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Can select group rows where `isRowSelectable` returns false and `groupSelects` = "descendants"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = setup`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Can select group rows where `isRowSelectable` returns false and `groupSelects` = "filteredDescendants"', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'filteredDescendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);
                await new GridRows(
                    api,
                    `Can select group rows where _isRowSelectable_ returns false and _groupSelects_ = final state`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('Selection state changes when `isRowSelectable` changes', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], api);

                api.setGridOption('rowSelection', {
                    mode: 'multiRow',
                    groupSelects: 'descendants',
                    isRowSelectable: (node) => node.data?.sport === 'Gymnastics',
                });
                await new GridColumns(
                    api,
                    `Selection state changes when _isRowSelectable_ changes after setGridOption rowSelection`
                ).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── ag-Grid-AutoColumn "Athlete" width:200
                    ├── age "Age" width:200
                    ├── year "Year" width:200
                    └── date "Date" width:200
                `);
                await new GridRows(
                    api,
                    `Selection state changes when _isRowSelectable_ changes after setGridOption rowSelection`
                ).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                assertSelectedRowsByIndex([], api);
            });

            test('Selection state changes when grouping is updated', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.data?.sport === 'Swimming',
                    },
                });

                // Selects all nodes in country 'United States'
                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsById(
                    [
                        '0',
                        '1',
                        '2',
                        '3',
                        '6',
                        '7',
                        '8',
                        '9',
                        '11',
                        '18',
                        'row-group-country-United States',
                        'row-group-country-United States-sport-Swimming',
                    ],
                    api
                );
                const applied = api.applyColumnState({ state: [{ colId: 'country', rowGroup: false }] });
                expect(applied).toBeTruthy();

                assertSelectedRowsById(['0', '1', '2', '3', '6', '7', '8', '9', '11', '18'], api);
                await new GridRows(api, `Selection state changes when grouping is updated final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP indeterminate id:row-group-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    ├─┬ LEAF_GROUP 🚫 id:row-group-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ ├── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    │ ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ LEAF_GROUP 🚫 id:"row-group-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    └─┬ LEAF_GROUP 🚫 id:"row-group-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                `);
            });

            test('selecting footer node selects sibling (i.e. group node)', async () => {
                const [api, actions] = await createGridAndWait({
                    ...groupGridOptions,
                    groupTotalRow: 'bottom',
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ ├── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Total Swimming"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ │ ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Total Gymnastics"
                    │ └─ footer id:"rowGroupFooter_row-group-country-United States" ag-Grid-AutoColumn:"Total United States"
                    ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ │ ├── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Total Gymnastics"
                    │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Total Russia"
                    ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-Australia ag-Grid-AutoColumn:"Total Australia"
                    ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ │ ├── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Total Speed Skating"
                    │ └─ footer id:rowGroupFooter_row-group-country-Canada ag-Grid-AutoColumn:"Total Canada"
                    ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ ├─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ │ ├── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    │ │ └─ footer id:"rowGroupFooter_row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Total Cross Country Skiing"
                    │ └─ footer id:rowGroupFooter_row-group-country-Norway ag-Grid-AutoColumn:"Total Norway"
                    ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ ├─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-China ag-Grid-AutoColumn:"Total China"
                    ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ ├─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe ag-Grid-AutoColumn:"Total Zimbabwe"
                    └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · ├─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · │ ├── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    · │ └─ footer id:rowGroupFooter_row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                    · └─ footer id:rowGroupFooter_row-group-country-Netherlands ag-Grid-AutoColumn:"Total Netherlands"
                `);

                actions.toggleCheckboxById('rowGroupFooter_row-group-country-United States-sport-Swimming');

                assertSelectedRowsById(['row-group-country-United States-sport-Swimming'], api);
                await new GridRows(api, `selecting footer node selects sibling (i.e. group node) final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ ├── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ │ └─ footer selected id:"rowGroupFooter_row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Total Swimming"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ │ ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Total Gymnastics"
                        │ └─ footer id:"rowGroupFooter_row-group-country-United States" ag-Grid-AutoColumn:"Total United States"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ │ ├── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Total Gymnastics"
                        │ └─ footer id:rowGroupFooter_row-group-country-Russia ag-Grid-AutoColumn:"Total Russia"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ │ ├── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-Australia ag-Grid-AutoColumn:"Total Australia"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ │ ├── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Total Speed Skating"
                        │ └─ footer id:rowGroupFooter_row-group-country-Canada ag-Grid-AutoColumn:"Total Canada"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ │ ├── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        │ │ └─ footer id:"rowGroupFooter_row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Total Cross Country Skiing"
                        │ └─ footer id:rowGroupFooter_row-group-country-Norway ag-Grid-AutoColumn:"Total Norway"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ ├─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-China ag-Grid-AutoColumn:"Total China"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ ├─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        │ └─ footer id:rowGroupFooter_row-group-country-Zimbabwe ag-Grid-AutoColumn:"Total Zimbabwe"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · ├─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · │ ├── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                        · │ └─ footer id:rowGroupFooter_row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Total Swimming"
                        · └─ footer id:rowGroupFooter_row-group-country-Netherlands ag-Grid-AutoColumn:"Total Netherlands"
                    `
                );
            });

            test('parent with unselectable children is unselectable when groupSelects: descendants', async () => {
                const [api] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'descendants',
                        isRowSelectable: (node) => node.id?.startsWith('row-group') ?? false,
                    },
                });
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: descendants setup`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);

                expect(api.getRowNode('row-group-country-United States')?.selectable).toBe(false);
                expect(api.getRowNode('row-group-country-United States-sport-Swimming')?.selectable).toBe(false);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: descendants final state`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });

            test('parent with unselectable children is unselectable when groupSelects: filteredDescendants', async () => {
                const [api] = await createGridAndWait({
                    ...groupGridOptions,
                    rowSelection: {
                        mode: 'multiRow',
                        groupSelects: 'filteredDescendants',
                        isRowSelectable: (node) => node.id?.startsWith('row-group') ?? false,
                    },
                });

                expect(api.getRowNode('row-group-country-United States')?.selectable).toBe(false);
                expect(api.getRowNode('row-group-country-United States-sport-Swimming')?.selectable).toBe(false);
                await new GridRows(
                    api,
                    `parent with unselectable children is unselectable when groupSelects: filteredDes final state`
                ).check(`
                    ROOT 🚫 id:ROOT_NODE_ID
                    ├─┬ filler 🚫 id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                    │ ├─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                    │ │ ├── LEAF 🚫 id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ │ ├── LEAF 🚫 id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ │ ├── LEAF 🚫 id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ │ ├── LEAF 🚫 id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ │ └── LEAF 🚫 id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                    │ · ├── LEAF 🚫 id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ · └── LEAF 🚫 id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                    │ · └── LEAF 🚫 id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                    ├─┬ filler 🚫 id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · ├── LEAF 🚫 id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                    │ · ├── LEAF 🚫 id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                    │ · └── LEAF 🚫 id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    ├─┬ filler 🚫 id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                    │ · └── LEAF 🚫 id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                    ├─┬ filler 🚫 id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                    │ └─┬ LEAF_GROUP 🚫 id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                    │ · └── LEAF 🚫 id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                    ├─┬ filler 🚫 id:row-group-country-China ag-Grid-AutoColumn:"China"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                    ├─┬ filler 🚫 id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                    │ └─┬ LEAF_GROUP 🚫 id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    │ · └── LEAF 🚫 id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    └─┬ filler 🚫 id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                    · └─┬ LEAF_GROUP 🚫 id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                    · · └── LEAF 🚫 id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                `);
            });
        });
    });
});
