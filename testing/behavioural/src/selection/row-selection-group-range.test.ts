import { GridColumns, GridRows, assertSelectedRowsByIndex } from 'ag-test-utils';

import { createGridAndWait, groupGridOptions, setupRowSelectionSuite } from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('Basic Interactions', () => {
        describe('Group selection', () => {
            setupRowSelectionSuite();

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click does not affect ability to select multiple rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });
                    // The starting fixture, asserted once for the suite: every case below builds this same
                    // grid, so each one repeating it would assert the shared setup rather than its own change.
                    await new GridColumns(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
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
                        `CTRL-click and CMD-click does not affect ability to select multiple rows setup`
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

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    actions.toggleCheckboxByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(
                        api,
                        `CTRL-click and CMD-click does not affect ability to select multiple rows final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([1, 3], false);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.selectRowsByIndex([2, 4], false);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
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

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
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

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('Range selection is preserved on checkbox toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.toggleCheckboxByIndex(5);
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on checkbox toggle final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.toggleCheckboxByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
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

                test('Range members can be un-selected with toggle', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(1);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.toggleCheckboxByIndex(3);
                    assertSelectedRowsByIndex([1, 2, 4], api);
                    await new GridRows(api, `Range members can be un-selected with toggle final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
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

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
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

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(6);
                    actions.toggleCheckboxByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
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

                test('Range can be inverted', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(4);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
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

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
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
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
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
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
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
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
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
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.toggleCheckboxByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.toggleCheckboxByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                            │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                            │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                            │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                            │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                            │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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
                });

                test('CTRL+SHIFT-click selects range if root is selected', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2);
                    actions.toggleCheckboxByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click selects range if root is selected final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
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

                test('CTRL/META+SHIFT-click with null selection root is no-op', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([], api);

                    actions.toggleCheckboxByIndex(2, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op final state`)
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

                // Grouped display order is where a range diverges from the flat case: the rows between two
                // leaves include group rows, and a collapsed group hides leaves that are still in the range.
                test('SHIFT-click selects a range spanning sibling groups', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    // 11 is the last Swimming leaf and 14 the last Gymnastics leaf, both under United States,
                    // so the range has to step over the Gymnastics group row at 12.
                    actions.toggleCheckboxByIndex(11);
                    actions.toggleCheckboxByIndex(14, { shiftKey: true });

                    await new GridRows(api, `SHIFT-click selects a range spanning sibling groups final state`).check(
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
                        `
                    );
                });

                test('SHIFT-click selects a range spanning country groups', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    // 11 is under United States and 21 under Australia, so the range crosses two country rows
                    // and the sport groups beneath them.
                    actions.toggleCheckboxByIndex(11);
                    actions.toggleCheckboxByIndex(21, { shiftKey: true });

                    await new GridRows(api, `SHIFT-click selects a range spanning country groups final state`).check(
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
                            │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF selected id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF selected id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler selected id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP selected id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF selected id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                            ├─┬ filler selected id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                            │ └─┬ LEAF_GROUP selected id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                            │ · ├── LEAF selected id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                            │ · ├── LEAF selected id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
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
                });

                test('SHIFT-click selects a range spanning a collapsed group', async () => {
                    const [api, actions] = await createGridAndWait({
                        ...groupGridOptions,
                        rowSelection: { mode: 'multiRow' },
                    });

                    await actions.collapseGroupRowByIndex(12, { count: 1 });

                    actions.toggleCheckboxByIndex(11);
                    actions.toggleCheckboxByIndex(15, { shiftKey: true });

                    await new GridRows(api, `SHIFT-click selects a range spanning a collapsed group final state`).check(
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
                            │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                            │ └─┬ LEAF_GROUP selected collapsed id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                            │ · ├── LEAF hidden id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                            │ · └── LEAF hidden id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                            ├─┬ filler selected id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                            │ └─┬ LEAF_GROUP selected id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                            │ · └── LEAF selected id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
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
                });
            });
        });
    });
});
