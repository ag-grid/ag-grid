import { GridColumns, GridRows, assertSelectedRowsByIndex, isElementDisplayed } from 'ag-test-utils';

import { columnDefs, createGrid, rowData, setupRowSelectionSuite } from './rowSelectionHarness';

describe('Row Selection Grid Options', () => {
    describe('Basic Interactions', () => {
        setupRowSelectionSuite();

        describe('Multiple Row Selection', () => {
            test('un-selectable row cannot be selected', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.data?.sport !== 'football' },
                });
                await new GridColumns(api, `un-selectable row cannot be selected setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `un-selectable row cannot be selected setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.toggleCheckboxByIndex(0);
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { metaKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);

                actions.toggleCheckboxByIndex(0, { shiftKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `un-selectable row cannot be selected final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF 🚫 id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Clicking an already-selected row is a no-op', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false },
                });
                await new GridRows(api, `Clicking an already-selected row is a no-op setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);

                actions.clickRowByIndex(2);
                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Clicking an already-selected row is a no-op final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('row-click interaction with multiple selected rows', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                    },
                });

                // Select two rows by toggling checkboxes
                actions.selectRowsByIndex([2, 3], false);

                actions.clickRowByIndex(3);

                // Both rows should still be selected
                assertSelectedRowsByIndex([2, 3], api);
                await new GridRows(api, `row-click interaction with multiple selected rows final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('must de-select with CTRL when `enableClickSelection: true`', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        enableClickSelection: true,
                    },
                });

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3);
                assertSelectedRowsByIndex([3], api);

                actions.clickRowByIndex(3, { ctrlKey: true });
                assertSelectedRowsByIndex([], api);
                await new GridRows(api, `must de-select with CTRL when _enableClickSelection: true_ final state`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `
                );
            });

            test('Single click after multiple selection clears previous selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                });

                actions.selectRowsByIndex([1, 3, 5], true);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([2], api);
                await new GridRows(api, `Single click after multiple selection clears previous selection final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
            });

            test('Single click on selected row clears previous selection', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                });

                actions.selectRowsByIndex([1, 3, 5], true);

                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([3], api);
                await new GridRows(api, `Single click on selected row clears previous selection final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('Disabled checkbox shown when `isRowSelectable` returns `true` and `checkboxes` returns `false`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: (params) => params.data.sport.endsWith('ing'),
                        isRowSelectable: () => true,
                    },
                });

                [
                    { index: 0, disabled: '' },
                    { index: 1, disabled: '' },
                    { index: 2, disabled: '' },
                    { index: 3, disabled: '' },
                    { index: 4, disabled: '' },
                    { index: 5, disabled: null },
                    { index: 6, disabled: null },
                ].forEach(({ index, disabled }) => {
                    expect(actions.getCheckboxByIndex(index)?.getAttribute('disabled')).toBe(disabled);
                });
            });

            test('Disabled checkbox shown when `isRowSelectable` returns `false` and `checkboxes` returns `true`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: () => true,
                        isRowSelectable: () => false,
                    },
                });

                rowData.map((_, i) => expect(actions.getCheckboxByIndex(i)?.getAttribute('disabled')).toBe(''));
            });

            test('No checkbox shown when `isRowSelectable` returns `false` and `checkboxes` returns `false`', () => {
                const [_, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: {
                        mode: 'multiRow',
                        checkboxes: () => false,
                        isRowSelectable: () => false,
                    },
                });

                rowData.map((_, i) => expect(isElementDisplayed(actions.getCheckboxByIndex(i)!)).toBe(false));
            });

            describe('Range selection behaviour', () => {
                test('CTRL-click and CMD-click selects multiple rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { metaKey: true });
                    actions.clickRowByIndex(3, { ctrlKey: true });

                    assertSelectedRowsByIndex([2, 5, 3], api);
                    await new GridRows(api, `CTRL-click and CMD-click selects multiple rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click selects range of rows', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(api, `SHIFT-click selects range of rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click extends range downwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.selectRowsByIndex([1, 3], true);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([1, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click extends range downwards from from last selected row final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click extends range upwards from from last selected row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.selectRowsByIndex([2, 4], true);

                    actions.clickRowByIndex(1, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 4, 1, 3], api);
                    await new GridRows(api, `SHIFT-click extends range upwards from from last selected row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF selected id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('SHIFT-click on un-selected table selects only clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([4], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click on un-selected table selects only clicked row final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `);
                });

                test('Range selection is preserved on CTRL-click and CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(1);
                    actions.clickRowByIndex(3, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);

                    actions.clickRowByIndex(5, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 5], api);
                    await new GridRows(api, `Range selection is preserved on CTRL-click and CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF selected id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('Range members can be un-selected with CTRL-click or CMD-click', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(1);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3, 4], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([1, 2, 4], api);

                    actions.clickRowByIndex(2, { ctrlKey: true });
                    assertSelectedRowsByIndex([1, 4], api);
                    await new GridRows(api, `Range members can be un-selected with CTRL-click or CMD-click final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF selected id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('Range is extended downwards from selection root', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `Range is extended downwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });

                test('Range is extended upwards from selection root', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(6);
                    actions.clickRowByIndex(4, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5], api);

                    actions.clickRowByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([6, 4, 5, 2, 3], api);
                    await new GridRows(api, `Range is extended upwards from selection root final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });

                test('Range can be inverted', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(4);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([4, 5, 6], api);

                    actions.clickRowByIndex(2, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4], api);
                    await new GridRows(api, `Range can be inverted final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click within range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click within range after de-selection resets root and clears previous sele final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click below range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                    await new GridRows(
                        api,
                        `SHIFT-click below range after de-selection resets root and clears previous selec final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click above range after de-selection resets root and clears previous selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true });
                    assertSelectedRowsByIndex([1, 2, 3], api);
                    await new GridRows(
                        api,
                        `SHIFT-click above range after de-selection resets root and clears previous selec final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('META+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `META+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `META+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('META+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `META+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click within range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(6, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2, 6], api);
                    await new GridRows(api, `CTRL+SHIFT-click within range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF selected id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click below range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(6, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([2], api);
                    await new GridRows(api, `CTRL+SHIFT-click below range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF selected id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL+SHIFT-click above range allows batch deselection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([2, 3, 4, 5], api);

                    actions.clickRowByIndex(3, { metaKey: true });
                    assertSelectedRowsByIndex([2, 4, 5], api);

                    actions.clickRowByIndex(1, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([4, 5], api);
                    await new GridRows(api, `CTRL+SHIFT-click above range allows batch deselection final state`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );
                });

                test('CTRL/META+SHIFT-click with null selection root is no-op', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2, { shiftKey: true, ctrlKey: true });
                    assertSelectedRowsByIndex([], api);

                    actions.clickRowByIndex(2, { shiftKey: true, metaKey: true });
                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `CTRL/META+SHIFT-click with null selection root is no-op final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });

                test('SHIFT-click after select all selects range between clicked row and last clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(5, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all selects range between clicked row and last clicked  final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click after select all on pristine grid selects range between first row and clicked row', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.toggleHeaderCheckboxByIndex(0);

                    assertSelectedRowsByIndex([0, 1, 2, 3, 4, 5, 6], api);

                    actions.clickRowByIndex(3, { shiftKey: true });

                    assertSelectedRowsByIndex([0, 1, 2, 3], api);
                    await new GridRows(
                        api,
                        `SHIFT-click after select all on pristine grid selects range between first row an final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF selected id:0 sport:"football"
                        ├── LEAF selected id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('SHIFT-click after select all behaves consistently', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.clickRowByIndex(2);
                    actions.clickRowByIndex(4, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4], api);

                    actions.toggleHeaderCheckboxByIndex(0);

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowsByIndex([2, 3, 4, 5, 6], api);
                    await new GridRows(api, `SHIFT-click after select all behaves consistently final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });

                test('Select all, then de-select, then SHIFT-click goes back to normal behaviour', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
                    });

                    actions.toggleHeaderCheckboxByIndex(0);

                    // De-select a single row
                    actions.clickRowByIndex(3, { ctrlKey: true });

                    actions.clickRowByIndex(6, { shiftKey: true });

                    assertSelectedRowsByIndex([3, 4, 5, 6], api);
                    await new GridRows(
                        api,
                        `Select all, then de-select, then SHIFT-click goes back to normal behaviour final state`
                    ).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF selected id:6 sport:"rowing"
                    `);
                });
            });
        });

        describe('Multiple Row Selection with Click', () => {
            test('Select multiple rows without modifier keys', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                actions.clickRowByIndex(2);
                actions.clickRowByIndex(5);
                actions.clickRowByIndex(3);

                assertSelectedRowsByIndex([2, 5, 3], api);
                await new GridRows(api, `Select multiple rows without modifier keys final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF selected id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('De-select row with click', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableSelectionWithoutKeys: true, enableClickSelection: true },
                });

                actions.selectRowsByIndex([1, 2, 3], true);

                actions.clickRowByIndex(2);

                assertSelectedRowsByIndex([1, 3], api);
                await new GridRows(api, `De-select row with click final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF selected id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });

            test('SHIFT-click on row that is already selected is a no-op', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow', enableClickSelection: true },
                });

                actions.clickRowByIndex(1);

                assertSelectedRowsByIndex([1], api);

                actions.clickRowByIndex(1, { shiftKey: true });

                assertSelectedRowsByIndex([1], api);
                await new GridRows(api, `SHIFT-click on row that is already selected is a no-op final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF selected id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);
            });
        });
    });
});
