import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

// The builder dialog's VirtualList sizes its viewport from getBoundingClientRect — give it a
// stable height so item count is deterministic. Other popup/dialog needs (offsetParent,
// offsetHeight, clientHeight) are handled by mockGridLayout.
let savedGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;
beforeAll(() => {
    savedGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        value: function (this: Element) {
            const rect = savedGetBoundingClientRect.call(this);
            if (
                this.classList.contains('ag-advanced-filter-builder-virtual-list-viewport') ||
                this.classList.contains('ag-rich-select-virtual-list-viewport') ||
                this.classList.contains('ag-advanced-filter-builder-list')
            ) {
                return new DOMRect(rect.x, rect.y, rect.width, 400);
            }
            return rect;
        },
    });
});
afterAll(() => {
    if (savedGetBoundingClientRect) {
        Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
            configurable: true,
            value: savedGetBoundingClientRect,
        });
    }
});

// --- Shared test data ---

interface TestRow {
    athlete: string;
    age: number | null;
    hasGold: boolean | null;
}

const ROW_DATA: TestRow[] = [
    { athlete: 'Michael Phelps', age: 23, hasGold: true },
    { athlete: 'Emma Thompson', age: 30, hasGold: false },
    { athlete: 'Usain Bolt', age: 25, hasGold: true },
    { athlete: 'Anna Kowalski', age: 19, hasGold: false },
];

const COLUMN_DEFS: GridOptions['columnDefs'] = [
    { field: 'athlete', filter: true },
    { field: 'age', filter: true },
    { field: 'hasGold', filter: true },
];

const DEFAULT_OPTIONS: GridOptions<TestRow> = {
    columnDefs: COLUMN_DEFS,
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

// --- Helpers ---

function getDisplayedAthletes(api: GridApi<TestRow>): string[] {
    const result: string[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        result.push(api.getDisplayedRowAtIndex(i)?.data?.athlete ?? '');
    }
    return result;
}

/**
 * The VirtualList's initial refresh() runs before its element is in the DOM (so offsetHeight=0
 * and 0 rows render). After the builder is mounted we must force a re-render by dispatching
 * scroll on the viewport so drawVirtualRows() re-evaluates the now-positive height.
 */
async function ensureBuilderItemsRendered(): Promise<void> {
    for (const selector of [
        '.ag-advanced-filter-builder-virtual-list-viewport',
        '.ag-rich-select-virtual-list-viewport',
    ]) {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) {
            el.scrollTop = 1;
            el.scrollTop = 0;
        }
    }
    await asyncSetTimeout(0);
}

/** Returns all builder item wrappers currently rendered in the DOM. */
async function getBuilderItems(): Promise<HTMLElement[]> {
    await ensureBuilderItemsRendered();
    return Array.from(document.querySelectorAll<HTMLElement>('.ag-advanced-filter-builder-item-wrapper'));
}

/** Returns the pill display text for a given pill class within a builder item. */
function getPillText(item: HTMLElement, pillClass: string): string | null {
    const pill = item.querySelector(`.${pillClass}`);
    const display = pill?.querySelector('.ag-advanced-filter-builder-pill-display');
    return display?.textContent ?? null;
}

/** Returns the column pill text for a builder condition row. */
function getColumnPillText(item: HTMLElement): string | null {
    return getPillText(item, 'ag-advanced-filter-builder-column-pill');
}

/** Returns the operator pill text for a builder condition row. */
function getOperatorPillText(item: HTMLElement): string | null {
    return getPillText(item, 'ag-advanced-filter-builder-option-pill');
}

/** Returns the value pill text for a builder condition row. */
function getValuePillText(item: HTMLElement): string | null {
    return getPillText(item, 'ag-advanced-filter-builder-value-pill');
}

/** Returns the join pill text for a join row (AND/OR). */
function getJoinPillText(item: HTMLElement): string | null {
    return getPillText(item, 'ag-advanced-filter-builder-join-pill');
}

/** Returns builder items that are filter conditions (have a column pill). */
async function getConditionItems(): Promise<HTMLElement[]> {
    return (await getBuilderItems()).filter((item) => item.querySelector('.ag-advanced-filter-builder-column-pill'));
}

/** Returns builder items that are join operators (have a join pill but no column pill). */
async function getJoinItems(): Promise<HTMLElement[]> {
    return (await getBuilderItems()).filter(
        (item) =>
            item.querySelector('.ag-advanced-filter-builder-join-pill') &&
            !item.querySelector('.ag-advanced-filter-builder-column-pill')
    );
}

/** Checks if the builder dialog is open. */
function isBuilderOpen(): boolean {
    return document.querySelector('.ag-advanced-filter-builder') !== null;
}

// --- Tests ---

describe('Advanced Filter - Builder UI', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    describe('Opening and closing', () => {
        test('showAdvancedFilterBuilder opens the builder dialog', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `showAdvancedFilterBuilder opens the builder dialog setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `showAdvancedFilterBuilder opens the builder dialog setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            expect(isBuilderOpen()).toBe(false);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            expect(isBuilderOpen()).toBe(true);
            await new GridRows(api, `showAdvancedFilterBuilder opens the builder dialog final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
        });

        test('hideAdvancedFilterBuilder closes the builder dialog', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `hideAdvancedFilterBuilder closes the builder dialog setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `hideAdvancedFilterBuilder closes the builder dialog setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);
            expect(isBuilderOpen()).toBe(true);

            api.hideAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            expect(isBuilderOpen()).toBe(false);
            await new GridRows(api, `hideAdvancedFilterBuilder closes the builder dialog final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
        });
    });

    describe('Builder reflects model state', () => {
        test('empty model shows default join with one empty condition', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `empty model shows default join with one empty condition setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    └── hasGold "Has Gold" width:200
                `
            );
            await new GridRows(api, `empty model shows default join with one empty condition setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            const items = await getBuilderItems();
            // Should have at least a root join item and an empty condition
            expect(items.length).toBeGreaterThanOrEqual(2);
            await new GridRows(api, `empty model shows default join with one empty condition final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
        });

        test('single text condition model shows correct pills', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `single text condition model shows correct pills setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `single text condition model shows correct pills setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'bolt',
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            const conditions = await getConditionItems();
            expect(conditions.length).toBe(1);
            expect(getColumnPillText(conditions[0])).toBe('Athlete');
            expect(getOperatorPillText(conditions[0])).toBe('contains');
            // Text values display with quotes in the pill
            expect(getValuePillText(conditions[0])).toBe('"bolt"');
            await new GridRows(api, `single text condition model shows correct pills final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
            `);
        });

        test('single number condition model shows correct pills', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `single number condition model shows correct pills setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `single number condition model shows correct pills setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 25,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            const conditions = await getConditionItems();
            expect(conditions.length).toBe(1);
            expect(getColumnPillText(conditions[0])).toBe('Age');
            expect(getOperatorPillText(conditions[0])).toBe('>');
            expect(getValuePillText(conditions[0])).toBe('25');
            await new GridRows(api, `single number condition model shows correct pills final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
            `);
        });

        test('compound AND model shows join pill and multiple conditions', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `compound AND model shows join pill and multiple conditions setup`).checkColumns(
                `
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    └── hasGold "Has Gold" width:200
                `
            );
            await new GridRows(api, `compound AND model shows join pill and multiple conditions setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'bolt' },
                    { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                ],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            // Verify join operator
            const joins = await getJoinItems();
            expect(joins.length).toBe(1);
            expect(getJoinPillText(joins[0])).toBe('AND');

            // Verify conditions
            const conditions = await getConditionItems();
            expect(conditions.length).toBe(2);

            expect(getColumnPillText(conditions[0])).toBe('Athlete');
            expect(getOperatorPillText(conditions[0])).toBe('contains');

            expect(getColumnPillText(conditions[1])).toBe('Age');
            expect(getOperatorPillText(conditions[1])).toBe('>');
            await new GridRows(api, `compound AND model shows join pill and multiple conditions final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
            `);
        });

        test('boolean condition model shows correct pills', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `boolean condition model shows correct pills setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `boolean condition model shows correct pills setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'boolean',
                colId: 'hasGold',
                type: 'true',
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            const conditions = await getConditionItems();
            expect(conditions.length).toBe(1);
            expect(getColumnPillText(conditions[0])).toBe('Has Gold');
            expect(getOperatorPillText(conditions[0])).toBe('is true');
            await new GridRows(api, `boolean condition model shows correct pills final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                └── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
            `);
        });

        test('blank operator condition shows no value pill', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `blank operator condition shows no value pill setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `blank operator condition shows no value pill setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'blank',
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.showAdvancedFilterBuilder();
            await asyncSetTimeout(0);

            const conditions = await getConditionItems();
            expect(conditions.length).toBe(1);
            expect(getColumnPillText(conditions[0])).toBe('Age');
            expect(getOperatorPillText(conditions[0])).toBe('is blank');
            // No value pill for zero-operand operators
            const valuePill = conditions[0].querySelector('.ag-advanced-filter-builder-value-pill');
            expect(valuePill).toBeNull();
            await new GridRows(api, `blank operator condition shows no value pill final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    // NOTE: Pill picker dropdown interaction (clicking pill → selecting from rich select list)
    // requires a nested VirtualList popup that doesn't reliably render in jsdom. These
    // interactions should be covered by Playwright E2E tests instead.

    describe('Applying filter from builder', () => {
        test('applying a model set via API filters rows after builder apply', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `applying a model set via API filters rows after builder apply setup`)
                .checkColumns(`
                    CENTER
                    ├── athlete "Athlete" width:200
                    ├── age "Age" width:200
                    └── hasGold "Has Gold" width:200
                `);
            await new GridRows(api, `applying a model set via API filters rows after builder apply setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            // Set a filter model
            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'greaterThan',
                filter: 25,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(getDisplayedAthletes(api)).toEqual(['Emma Thompson']);
            await new GridRows(api, `applying a model set via API filters rows after builder apply final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                `
            );
        });

        test('clearing model via null removes filter', async () => {
            const api = gridsManager.createGrid('grid1', DEFAULT_OPTIONS);
            await new GridColumns(api, `clearing model via null removes filter setup`).checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200
                ├── age "Age" width:200
                └── hasGold "Has Gold" width:200
            `);
            await new GridRows(api, `clearing model via null removes filter setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
            await asyncSetTimeout(0);

            // Set a filter
            api.setAdvancedFilterModel({
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'bolt',
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);

            // Clear
            api.setAdvancedFilterModel(null);
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowCount()).toBe(ROW_DATA.length);
            await new GridRows(api, `clearing model via null removes filter final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Michael Phelps" age:23 hasGold:true
                ├── LEAF id:1 athlete:"Emma Thompson" age:30 hasGold:false
                ├── LEAF id:2 athlete:"Usain Bolt" age:25 hasGold:true
                └── LEAF id:3 athlete:"Anna Kowalski" age:19 hasGold:false
            `);
        });
    });
});
