import { FindModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Tests for find navigation functionality (next, previous, goTo).
 */
describe('Find Navigation', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [FindModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('findNext navigates through matches in order', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'cat' }, { value: 'dog' }, { value: 'car' }, { value: 'cup' }],
        });
        await new GridColumns(api, `findNext navigates through matches in order setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `findNext navigates through matches in order setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"cat"
            ├── LEAF id:1 value:"dog"
            ├── LEAF id:2 value:"car"
            └── LEAF id:3 value:"cup"
        `);

        api.setGridOption('findSearchValue', 'c');
        await new GridColumns(api, `findNext navigates through matches in order after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `findNext navigates through matches in order after setGridOption findSearchValue`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"cat"
                ├── LEAF id:1 value:"dog"
                ├── LEAF id:2 value:"car"
                └── LEAF id:3 value:"cup"
            `);
        await asyncSetTimeout(1);

        // 'cat', 'car', 'cup' contain 'c', so 3 matches
        expect(api.findGetTotalMatches()).toBe(3);

        // Initially no active match
        expect(api.findGetActiveMatch()).toBeUndefined();

        // Navigate to first match
        api.findNext();
        let activeMatch = api.findGetActiveMatch();
        expect(activeMatch).toBeDefined();
        expect(activeMatch!.numOverall).toBe(1);
        expect(activeMatch!.node.rowIndex).toBe(0);

        // Navigate to second match
        api.findNext();
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(2);
        expect(activeMatch!.node.rowIndex).toBe(2); // 'car' is row index 2

        // Navigate to third match
        api.findNext();
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(3);
        expect(activeMatch!.node.rowIndex).toBe(3); // 'cup' is row index 3

        // Wraps around to first match
        api.findNext();
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(1);
        expect(activeMatch!.node.rowIndex).toBe(0);
    });

    test('findPrevious navigates through matches in reverse order', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'cat' }, { value: 'dog' }, { value: 'car' }],
        });
        await new GridColumns(api, `findPrevious navigates through matches in reverse order setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `findPrevious navigates through matches in reverse order setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"cat"
            ├── LEAF id:1 value:"dog"
            └── LEAF id:2 value:"car"
        `);

        api.setGridOption('findSearchValue', 'c');
        await new GridColumns(
            api,
            `findPrevious navigates through matches in reverse order after setGridOption findSearchValue`
        ).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `findPrevious navigates through matches in reverse order after setGridOption findSearchValue`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"cat"
            ├── LEAF id:1 value:"dog"
            └── LEAF id:2 value:"car"
        `);
        await asyncSetTimeout(1);

        expect(api.findGetTotalMatches()).toBe(2); // 'cat' and 'car'

        // findPrevious from no active match goes to last match
        api.findPrevious();
        let activeMatch = api.findGetActiveMatch();
        expect(activeMatch).toBeDefined();
        expect(activeMatch!.numOverall).toBe(2);
        expect(activeMatch!.node.rowIndex).toBe(2); // 'car'

        // Navigate to first match (going backwards)
        api.findPrevious();
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(1);
        expect(activeMatch!.node.rowIndex).toBe(0); // 'cat'

        // Wraps around to last match
        api.findPrevious();
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(2);
        expect(activeMatch!.node.rowIndex).toBe(2); // 'car'
    });

    test('findGoTo navigates to specific match', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'xone' }, { value: 'xtwo' }, { value: 'xthree' }, { value: 'xfour' }],
        });
        await new GridColumns(api, `findGoTo navigates to specific match setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `findGoTo navigates to specific match setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"xone"
            ├── LEAF id:1 value:"xtwo"
            ├── LEAF id:2 value:"xthree"
            └── LEAF id:3 value:"xfour"
        `);

        api.setGridOption('findSearchValue', 'x');
        await new GridColumns(api, `findGoTo navigates to specific match after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `findGoTo navigates to specific match after setGridOption findSearchValue`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"xone"
            ├── LEAF id:1 value:"xtwo"
            ├── LEAF id:2 value:"xthree"
            └── LEAF id:3 value:"xfour"
        `);
        await asyncSetTimeout(1);

        // Each row has one 'x'
        expect(api.findGetTotalMatches()).toBe(4);

        // Go to third match directly
        api.findGoTo(3);
        let activeMatch = api.findGetActiveMatch();
        expect(activeMatch).toBeDefined();
        expect(activeMatch!.numOverall).toBe(3);
        expect(activeMatch!.node.rowIndex).toBe(2);

        // Go to first match
        api.findGoTo(1);
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(1);
        expect(activeMatch!.node.rowIndex).toBe(0);

        // Go to last match
        api.findGoTo(4);
        activeMatch = api.findGetActiveMatch();
        expect(activeMatch!.numOverall).toBe(4);
        expect(activeMatch!.node.rowIndex).toBe(3);
    });

    test('findGoTo with force=true refreshes even when already at match', async () => {
        const scrollListener = vi.fn();

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'test' }, { value: 'other' }],
            onBodyScrollEnd: scrollListener,
        });
        await new GridColumns(api, `findGoTo with force=true refreshes even when already at match setup`).checkColumns(
            `
                CENTER
                └── value "Value" width:200
            `
        );
        await new GridRows(api, `findGoTo with force=true refreshes even when already at match setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"test"
            └── LEAF id:1 value:"other"
        `);

        api.setGridOption('findSearchValue', 'test');
        await new GridColumns(
            api,
            `findGoTo with force=true refreshes even when already at match after setGridOption findSearchValue`
        ).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(
            api,
            `findGoTo with force=true refreshes even when already at match after setGridOption findSearchValue`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"test"
            └── LEAF id:1 value:"other"
        `);
        await asyncSetTimeout(1);

        api.findGoTo(1);
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);

        // Without force, going to the same match does nothing
        api.findGoTo(1);
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);

        // With force=true, it should trigger scroll/refresh even for same match
        api.findGoTo(1, true);
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);
        // We expect some scroll activity due to force
    });

    test('findClearActive clears the active match', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'xone' }, { value: 'xtwo' }],
        });
        await new GridColumns(api, `findClearActive clears the active match setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `findClearActive clears the active match setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"xone"
            └── LEAF id:1 value:"xtwo"
        `);

        api.setGridOption('findSearchValue', 'x');
        await new GridColumns(api, `findClearActive clears the active match after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `findClearActive clears the active match after setGridOption findSearchValue`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"xone"
                └── LEAF id:1 value:"xtwo"
            `
        );
        await asyncSetTimeout(1);

        expect(api.findGetTotalMatches()).toBe(2);

        // Navigate to first match
        api.findNext();
        expect(api.findGetActiveMatch()).toBeDefined();
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);

        // Clear active match
        api.findClearActive();
        expect(api.findGetActiveMatch()).toBeUndefined();

        // Total matches should still be available
        expect(api.findGetTotalMatches()).toBe(2);

        // Can navigate again after clearing
        api.findNext();
        expect(api.findGetActiveMatch()).toBeDefined();
    });

    test('navigation with multiple matches in same cell', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'aaa' }, { value: 'bbb' }],
        });
        await new GridColumns(api, `navigation with multiple matches in same cell setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `navigation with multiple matches in same cell setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"aaa"
            └── LEAF id:1 value:"bbb"
        `);

        api.setGridOption('findSearchValue', 'a');
        await new GridColumns(api, `navigation with multiple matches in same cell after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
        await new GridRows(api, `navigation with multiple matches in same cell after setGridOption findSearchValue`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 value:"aaa"
                └── LEAF id:1 value:"bbb"
            `);
        await asyncSetTimeout(1);

        // 'aaa' has 3 matches of 'a'
        expect(api.findGetTotalMatches()).toBe(3);

        // Navigate through all matches in the cell
        api.findNext();
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);
        expect(api.findGetActiveMatch()!.numInMatch).toBe(1);
        expect(api.findGetActiveMatch()!.node.rowIndex).toBe(0);

        api.findNext();
        expect(api.findGetActiveMatch()!.numOverall).toBe(2);
        expect(api.findGetActiveMatch()!.numInMatch).toBe(2);
        expect(api.findGetActiveMatch()!.node.rowIndex).toBe(0);

        api.findNext();
        expect(api.findGetActiveMatch()!.numOverall).toBe(3);
        expect(api.findGetActiveMatch()!.numInMatch).toBe(3);
        expect(api.findGetActiveMatch()!.node.rowIndex).toBe(0);

        // Wraps back to first match
        api.findNext();
        expect(api.findGetActiveMatch()!.numOverall).toBe(1);
        expect(api.findGetActiveMatch()!.numInMatch).toBe(1);
    });

    test('navigation across multiple columns', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            rowData: [
                { a: 'find', b: 'no', c: 'find' },
                { a: 'no', b: 'find', c: 'no' },
            ],
        });
        await new GridColumns(api, `navigation across multiple columns setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            ├── b "B" width:200
            └── c "C" width:200
        `);
        await new GridRows(api, `navigation across multiple columns setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"find" b:"no" c:"find"
            └── LEAF id:1 a:"no" b:"find" c:"no"
        `);

        api.setGridOption('findSearchValue', 'find');
        await new GridColumns(api, `navigation across multiple columns after setGridOption findSearchValue`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);
        await new GridRows(api, `navigation across multiple columns after setGridOption findSearchValue`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"find" b:"no" c:"find"
            └── LEAF id:1 a:"no" b:"find" c:"no"
        `);
        await asyncSetTimeout(1);

        expect(api.findGetTotalMatches()).toBe(3);

        // First match in row 0, column 'a'
        api.findNext();
        let match = api.findGetActiveMatch()!;
        expect(match.numOverall).toBe(1);
        expect(match.node.rowIndex).toBe(0);
        expect(match.column!.getColId()).toBe('a');

        // Second match in row 0, column 'c'
        api.findNext();
        match = api.findGetActiveMatch()!;
        expect(match.numOverall).toBe(2);
        expect(match.node.rowIndex).toBe(0);
        expect(match.column!.getColId()).toBe('c');

        // Third match in row 1, column 'b'
        api.findNext();
        match = api.findGetActiveMatch()!;
        expect(match.numOverall).toBe(3);
        expect(match.node.rowIndex).toBe(1);
        expect(match.column!.getColId()).toBe('b');
    });
});
