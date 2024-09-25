import type { GlobalGridOptionsMergeStrategy, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    ModuleRegistry,
    createGrid,
    provideGlobalGridOptions,
} from 'ag-grid-community';

describe('Global Grid Options', () => {
    function createMyGrid(gridOptions: GridOptions = {}) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        provideGlobalGridOptions({});
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);
    });

    beforeEach(() => {
        resetGrids();
    });

    test('merge global grid options at top level', () => {
        const globalOptions: GridOptions = { suppressHorizontalScroll: true, rowBuffer: 3, rowHeight: 22 };

        provideGlobalGridOptions(globalOptions);

        const api = createMyGrid({
            suppressHorizontalScroll: false,
            rowBuffer: 5,
            cellFadeDuration: 11,
        });

        expect(api.getGridOption('suppressHorizontalScroll')).toBe(false);
        expect(api.getGridOption('rowBuffer')).toBe(5);
        expect(api.getGridOption('rowHeight')).toBe(22);
        expect(api.getGridOption('cellFadeDuration')).toBe(11);

        // ensure global options are not mutated
        api.setGridOption('rowBuffer', 10);
        expect(api.getGridOption('rowBuffer')).toBe(10);
        expect(globalOptions.rowBuffer).toBe(3);
    });

    test('merge global grid options deep', () => {
        provideGlobalGridOptions(
            {
                autoGroupColumnDef: {
                    suppressAutoSize: true,
                },
                defaultColDef: {
                    width: 111,
                    editable: true,
                },
            },
            'deep'
        );

        const api = createMyGrid({
            autoGroupColumnDef: {
                suppressFillHandle: true,
            },
            defaultColDef: {
                width: 222,
                flex: 10,
            },
        });

        expect(api.getGridOption('autoGroupColumnDef')).toEqual({
            suppressAutoSize: true,
            suppressFillHandle: true,
        });
        expect(api.getGridOption('defaultColDef')).toEqual({
            width: 222,
            editable: true,
            flex: 10,
        });
    });

    test('merge global grid options shallow (default)', () => {
        provideGlobalGridOptions({
            autoGroupColumnDef: {
                suppressAutoSize: true,
            },
            defaultColDef: {
                width: 111,
                editable: true,
            },
        });

        const api = createMyGrid({
            autoGroupColumnDef: {
                suppressFillHandle: true,
            },
            defaultColDef: {
                width: 222,
                flex: 10,
            },
        });

        expect(api.getGridOption('autoGroupColumnDef')).toEqual({
            suppressFillHandle: true,
        });
        expect(api.getGridOption('defaultColDef')).toEqual({
            width: 222,
            flex: 10,
        });
    });

    describe('context maintains reference', () => {
        const strategies: GlobalGridOptionsMergeStrategy[] = ['deep', 'shallow'];
        describe.each(strategies)('strategy: %s', (strategy) => {
            test('options', () => {
                const context = { foo: 'bar' };
                const api = createMyGrid({
                    context,
                });

                expect(api.getGridOption('context')).toBe(context);
            });

            test('global context reference', () => {
                const contextGlobal = { foo: 'global' };

                provideGlobalGridOptions(
                    {
                        context: contextGlobal,
                    },
                    strategy
                );

                const api = createMyGrid({
                    columnDefs: [{ field: 'foo' }],
                });

                expect(api.getGridOption('context')).toBe(contextGlobal);
            });
        });

        describe('favour local context reference', () => {
            test('strategy: deep', () => {
                const context = { foo: 'bar' };
                const contextGlobal = { globalProp: 'global' };

                provideGlobalGridOptions(
                    {
                        context: contextGlobal,
                    },
                    'deep'
                );

                const api = createMyGrid({
                    context,
                });

                // local context reference is maintained
                expect(api.getGridOption('context')).toBe(context);
                // with global context properties merged into it
                expect(api.getGridOption('context')).toEqual({ foo: 'bar', globalProp: 'global' });

                // ensure global context reference is not mutated
                expect(contextGlobal).toEqual({ globalProp: 'global' });
            });

            test('strategy: shallow', () => {
                const context = { foo: 'bar' };
                const contextGlobal = { globalProp: 'global' };

                provideGlobalGridOptions(
                    {
                        context: contextGlobal,
                    },
                    'shallow'
                );

                const api = createMyGrid({
                    context,
                });

                // local context reference is maintained
                expect(api.getGridOption('context')).toBe(context);
                // with global context properties merged into it
                expect(api.getGridOption('context')).toEqual({ foo: 'bar' });
            });
        });
    });
});
