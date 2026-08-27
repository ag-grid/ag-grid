import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

/**
 * Resolving a configuration once means the filter obeys the resolution rather than the params it is handed,
 * so anything the resolution cannot see is a configuration the filter silently stops honouring. One test per
 * such input, each failing without the fix that keeps the two in step.
 */
interface Row {
    athlete: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { athlete: 'Ada', age: 25 },
    { athlete: 'Bob', age: 40 },
];

describe('Filter configuration resolves what the filter actually obeys', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            SetFilterModule,
            MultiFilterModule,
            AdvancedFilterModule,
            CustomFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    async function createGrid(options: GridOptions<Row>): Promise<GridApi<Row>> {
        return gridsManager.createGridAndWait('grid1', { rowData: ROW_DATA, ...options });
    }

    /** What the column's filter resolved to, which is what the dropdown and the condition limits read. */
    function configOf(api: GridApi<Row>, colId: string): any {
        return (api.getColumn(colId) as any).filterConfig;
    }

    describe('`filterParams` as a function', () => {
        // Not applied at configuration: that would call a user callback at a new time, on a grid with no row
        // data, and again when the component factory builds the params. It resolves when the filter does.
        const paramsFn = () => ({ filterOptions: ['contains'], maxNumConditions: 5 });

        // `cellDataType: false` so the params reach the service exactly as written; the composing that
        // inference does to them is its own case below.
        test('an object resolves, and a function is left for the filter to resolve', async () => {
            const objectApi = await createGrid({
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        cellDataType: false,
                        filterParams: paramsFn(),
                    },
                ],
            });
            const fromObject = configOf(objectApi, 'athlete');
            expect(fromObject.filterOptions).toEqual(['contains']);
            expect(fromObject.conditionCounts.maxNumConditions).toBe(5);
            gridsManager.reset();

            const fnApi = await createGrid({
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        cellDataType: false,
                        filterParams: paramsFn,
                    },
                ],
            });
            // The service will not call the function, so the column has no resolution until a filter exists
            // to resolve from the params the component factory built.
            expect(configOf(fnApi, 'athlete')).toBeNull();

            await fnApi.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'A' });
            await fnApi.onFilterChanged();
            const late = configOf(fnApi, 'athlete');
            // Resolved late, but resolved: the function's params reach the filter rather than spreading to
            // `{}`, which would have left all eight built-ins and two conditions.
            expect(late.filterOptions).toEqual(['contains']);
            expect(late.conditionCounts.maxNumConditions).toBe(5);
        });

        test('cell data type inference composes with a function rather than replacing it', async () => {
            // Inference rewrites `colDef.filterParams` with the defaults its data type implies, merged over
            // by whatever the column wrote. A function is not an object, so it was dropped on the floor and
            // never reached the component factory at all - the column's whole configuration, silently gone.
            const api = await createGrid({
                columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams: paramsFn }],
            });
            await api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'A' });
            await api.onFilterChanged();
            const config = configOf(api, 'athlete');
            expect(config.filterOptions).toEqual(['contains']);
            expect(config.conditionCounts.maxNumConditions).toBe(5);
        });

        test('a Multi Filter child obeys the `maxNumConditions` its function returns', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [78] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = await createGrid({
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [{ filter: 'agTextColumnFilter', filterParams: paramsFn }],
                        },
                    },
                ],
            });
            const condition = { filterType: 'text', type: 'contains', filter: 'A' };
            await api.setColumnFilterModel('athlete', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', operator: 'OR', conditions: new Array(6).fill(condition) }],
            });
            await api.onFilterChanged();
            // The child goes through the same merge as a column, so it was losing its function the same way
            // - and with it the limit, leaving every condition the model named in place.
            const model: any = api.getColumnFilterModel('athlete');
            expect(model.filterModels[0].conditions).toHaveLength(5);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #78');
        });

        test('the late resolution is the same object on every read, not rebuilt per update', async () => {
            const api = await createGrid({
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        cellDataType: false,
                        filterParams: paramsFn,
                    },
                ],
            });
            await api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'A' });
            await api.onFilterChanged();
            const first = configOf(api, 'athlete');
            expect(first).not.toBeNull();

            await api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'B' });
            await api.onFilterChanged();
            // A resolution belongs to the column, so reading it again cannot hand out a second one.
            expect(configOf(api, 'athlete')).toBe(first);
        });
    });

    describe('a Multi Filter child resolves its own configuration, not the parent one', () => {
        test('a child is not handed the Multi Filter own resolution', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [71] });
            // The parent legitimately raises 71, so it is asserted rather than left to print.
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = await createGrid({
                // The handlers implementation is the one where the parent renders the only button bar.
                enableFilterHandlers: true,
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            buttons: ['apply'],
                            debounceMs: 500,
                            filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                        },
                    },
                ],
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #71');
            const parent = configOf(api, 'athlete');
            expect(parent.children).toHaveLength(2);
            // The parent owns the button bar, so its own resolution says so - and no child's may, or a
            // child defers to an apply button it does not have and its edits are never applied.
            expect(parent.useApplyButton).toBe(true);
            expect(parent.children[0]).not.toBe(parent);
            expect(parent.children[1]).not.toBe(parent);
            expect(parent.children[0].useApplyButton).toBe(false);
            expect(parent.children[1].useApplyButton).toBe(false);
        });

        test('a definition change resolves the whole tree again, not whatever a filter reached for first', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [] });
            const columnDefs = (headerName: string) => [
                {
                    field: 'athlete' as const,
                    filter: 'agMultiColumnFilter',
                    headerName,
                    cellDataType: false,
                    filterParams: {
                        filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                    },
                },
            ];
            const api = await createGrid({ enableFilterHandlers: true, columnDefs: columnDefs('Athlete') });
            await api.setColumnFilterModel('athlete', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'A' }, null],
            });
            await api.onFilterChanged();
            const before = configOf(api, 'athlete');
            expect(before.children).toHaveLength(2);

            api.setGridOption('columnDefs', columnDefs('Competitor'));
            await api.onFilterChanged();
            const after = configOf(api, 'athlete');
            expect(after).not.toBe(before);
            // The live filter asks for its resolution before the column event rebuilds one. A filter allowed
            // to store what it gets back claims the column, and the rebuild is skipped - leaving a resolution
            // with no children, so every warning this definition owes goes unreported from here on.
            expect(after.children).toHaveLength(2);
        });

        test('a Multi Filter naming no children still resolves the two it has', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [] });
            const api = await createGrid({
                columnDefs: [{ field: 'athlete', filter: 'agMultiColumnFilter', cellDataType: false }],
            });
            expect(configOf(api, 'athlete').children).toHaveLength(2);
        });
    });

    describe('an unknown button type is reported for every producer of a button list', () => {
        // `FilterButtonComp` is shared by the column filter, the advanced filter, its builder and two tool
        // panels. Judging the list only where a colDef is read leaves the other four reporting nothing.
        test('the advanced filter reports its own unknown `buttons` type', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [75] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            await createGrid({
                enableAdvancedFilter: true,
                advancedFilterParams: { buttons: ['apply', 'bogus'] as any },
                columnDefs: [{ field: 'athlete' }],
            });
            const warnings = warn.mock.calls.flat().join(' ');
            expect(warnings).toContain('warning #75');
            expect(warnings).toContain('bogus');
        });
    });

    describe('a definition naming an inherited `Object.prototype` key', () => {
        // `toString` is not a filter, but it indexes an object keyed by filter name, so an unguarded lookup
        // yields `Object.prototype.toString` - a function that then stands in for the resolved filter type.
        test('`filter: "toString"` resolves to no filter rather than to a function', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
            const api = await createGrid({
                columnDefs: [{ field: 'athlete', filter: 'toString', cellDataType: false }],
            });
            const config = configOf(api, 'athlete');
            // Not a simple filter's resolution: that one collects default options by filter type, and the
            // type here would be a function, whose option list is `undefined`.
            expect(config?.filterOptions).toBeUndefined();
        });
    });
});
