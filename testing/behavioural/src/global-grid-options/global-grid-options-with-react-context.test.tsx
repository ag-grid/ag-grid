import { act, cleanup, render, waitFor } from '@testing-library/react';

import type { GlobalGridOptionsMergeStrategy, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import { AgGridContext, AgGridReact } from 'ag-grid-react';

async function renderGridWithPropsAndContext(
    props: GridOptions = {},
    contextValue?: { gridOptions?: GridOptions; mergeStrategy?: GlobalGridOptionsMergeStrategy }
) {
    const { columnDefs, rowData, onGridReady, ...rest } = props;

    let readyResolve!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        readyResolve = resolve;
    });

    const gridElement = (
        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
            <AgGridReact
                columnDefs={columnDefs ?? [{ field: 'value' }]}
                rowData={rowData ?? [{ value: 'a' }]}
                {...rest}
                onGridReady={(params: GridReadyEvent) => {
                    onGridReady?.(params);
                    readyResolve(params.api);
                }}
            />
        </div>
    );

    const renderResult = render(
        contextValue ? <AgGridContext.Provider value={contextValue}>{gridElement}</AgGridContext.Provider> : gridElement
    );

    const api = await readyPromise;
    return { api, ...renderResult };
}

describe('Global grid options via React context', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([AllCommunityModule]);
    });

    beforeEach(() => {
        cleanup();
        provideGlobalGridOptions({}, 'shallow');
    });

    describe('AgGridContext gridOptions merging', () => {
        test('merge AgGridContext grid options at top level (shallow)', async () => {
            const contextOptions: GridOptions = { suppressHorizontalScroll: true, rowBuffer: 3, rowHeight: 22 };

            const { api } = await renderGridWithPropsAndContext(
                {
                    suppressHorizontalScroll: false,
                    rowBuffer: 5,
                    cellFadeDuration: 11,
                },
                { gridOptions: contextOptions, mergeStrategy: 'shallow' }
            );

            // Component props should override context options
            expect(api.getGridOption('suppressHorizontalScroll')).toBe(false);
            expect(api.getGridOption('rowBuffer')).toBe(5);
            // Context options not overridden should be applied
            expect(api.getGridOption('rowHeight')).toBe(22);
            // Component-only props should be applied
            expect(api.getGridOption('cellFadeDuration')).toBe(11);
        });

        test('merge AgGridContext grid options deep', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    autoGroupColumnDef: {
                        suppressFillHandle: true,
                    },
                    defaultColDef: {
                        width: 222,
                        flex: 10,
                    },
                },
                {
                    gridOptions: {
                        autoGroupColumnDef: {
                            suppressAutoSize: true,
                        },
                        defaultColDef: {
                            width: 111,
                            editable: true,
                        },
                    },
                    mergeStrategy: 'deep',
                }
            );

            // Deep merge should combine nested properties
            expect(api.getGridOption('autoGroupColumnDef')).toEqual({
                suppressAutoSize: true,
                suppressFillHandle: true,
            });
            // Component props should override context props for same keys
            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 222,
                editable: true,
                flex: 10,
            });
        });

        test('merge AgGridContext grid options shallow (nested objects replaced)', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    autoGroupColumnDef: {
                        suppressFillHandle: true,
                    },
                    defaultColDef: {
                        width: 222,
                        flex: 10,
                    },
                },
                {
                    gridOptions: {
                        autoGroupColumnDef: {
                            suppressAutoSize: true,
                        },
                        defaultColDef: {
                            width: 111,
                            editable: true,
                        },
                    },
                    mergeStrategy: 'shallow',
                }
            );

            // Shallow merge should replace entire nested objects
            expect(api.getGridOption('autoGroupColumnDef')).toEqual({
                suppressFillHandle: true,
            });
            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 222,
                flex: 10,
            });
        });
    });

    describe('AgGridContext + provideGlobalGridOptions compatibility', () => {
        test('AgGridContext options override provideGlobalGridOptions (both shallow)', async () => {
            provideGlobalGridOptions({ rowBuffer: 1, rowHeight: 10 }, 'shallow');

            const { api } = await renderGridWithPropsAndContext(
                { cellFadeDuration: 5 },
                {
                    gridOptions: { rowBuffer: 3, suppressHorizontalScroll: true },
                    mergeStrategy: 'shallow',
                }
            );

            // provideGlobalGridOptions provides base
            expect(api.getGridOption('rowHeight')).toBe(10);
            // AgGridContext overrides provideGlobalGridOptions
            expect(api.getGridOption('rowBuffer')).toBe(3);
            // AgGridContext-only option
            expect(api.getGridOption('suppressHorizontalScroll')).toBe(true);
            // Component prop
            expect(api.getGridOption('cellFadeDuration')).toBe(5);
        });

        test('AgGridContext options override provideGlobalGridOptions (both deep)', async () => {
            provideGlobalGridOptions(
                {
                    defaultColDef: { width: 100, editable: true },
                    autoGroupColumnDef: { suppressAutoSize: true },
                },
                'deep'
            );

            const { api } = await renderGridWithPropsAndContext(
                {
                    defaultColDef: { flex: 1 },
                },
                {
                    gridOptions: {
                        defaultColDef: { width: 200 },
                    },
                    mergeStrategy: 'deep',
                }
            );

            // All three levels merge: global -> AgGridContext -> component
            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200, // AgGridContext overrides global
                editable: true, // from global
                flex: 1, // from component
            });
            // Global-only option preserved
            expect(api.getGridOption('autoGroupColumnDef')).toEqual({
                suppressAutoSize: true,
            });
        });

        test('AgGridContext shallow with provideGlobalGridOptions deep', async () => {
            provideGlobalGridOptions(
                {
                    defaultColDef: { width: 100, editable: true },
                },
                'deep'
            );

            const { api } = await renderGridWithPropsAndContext(
                {},
                {
                    gridOptions: {
                        defaultColDef: { width: 200 },
                    },
                    mergeStrategy: 'shallow',
                }
            );

            // provideGlobalGridOptions deep merge happens at grid core level
            // AgGridContext shallow merge replaces its own gridOptions over the base
            // but the global deep merge still applies editable from global options
            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200,
                editable: true,
            });
        });

        test('Component props override both AgGridContext and provideGlobalGridOptions', async () => {
            provideGlobalGridOptions({ rowBuffer: 1, rowHeight: 10 }, 'shallow');

            const { api } = await renderGridWithPropsAndContext(
                { rowBuffer: 5, suppressHorizontalScroll: false },
                {
                    gridOptions: { rowBuffer: 3, suppressHorizontalScroll: true, cellFadeDuration: 7 },
                    mergeStrategy: 'shallow',
                }
            );

            // Component props have highest priority
            expect(api.getGridOption('rowBuffer')).toBe(5);
            expect(api.getGridOption('suppressHorizontalScroll')).toBe(false);
            // AgGridContext option not overridden by component
            expect(api.getGridOption('cellFadeDuration')).toBe(7);
            // Global option not overridden
            expect(api.getGridOption('rowHeight')).toBe(10);
        });
    });

    describe('Nested AgGridContext providers', () => {
        async function renderNestedGrid(
            outerContext: { gridOptions?: GridOptions; mergeStrategy?: GlobalGridOptionsMergeStrategy },
            innerContext: { gridOptions?: GridOptions; mergeStrategy?: GlobalGridOptionsMergeStrategy },
            props: GridOptions = {}
        ) {
            const { columnDefs, rowData, onGridReady, ...rest } = props;

            let readyResolve!: (api: GridApi) => void;
            const readyPromise = new Promise<GridApi>((resolve) => {
                readyResolve = resolve;
            });

            const renderResult = render(
                <AgGridContext.Provider value={outerContext}>
                    <AgGridContext.Provider value={innerContext}>
                        <div style={{ width: 600, height: 400 }} data-testid="grid-wrapper">
                            <AgGridReact
                                columnDefs={columnDefs ?? [{ field: 'value' }]}
                                rowData={rowData ?? [{ value: 'a' }]}
                                {...rest}
                                onGridReady={(params) => {
                                    onGridReady?.(params);
                                    readyResolve(params.api);
                                }}
                            />
                        </div>
                    </AgGridContext.Provider>
                </AgGridContext.Provider>
            );

            const api = await readyPromise;
            return { api, ...renderResult };
        }

        test('inner AgGridContext completely overrides outer AgGridContext', async () => {
            const { api } = await renderNestedGrid(
                {
                    gridOptions: { rowBuffer: 1, rowHeight: 10, suppressHorizontalScroll: true },
                    mergeStrategy: 'shallow',
                },
                {
                    gridOptions: { rowBuffer: 5, cellFadeDuration: 7 },
                    mergeStrategy: 'shallow',
                }
            );

            // Inner context options are used
            expect(api.getGridOption('rowBuffer')).toBe(5);
            expect(api.getGridOption('cellFadeDuration')).toBe(7);
            // Outer context options NOT inherited (React context replaces, doesn't merge)
            // These will be undefined or their default values (not from outer context)
            expect(api.getGridOption('rowHeight')).toBeUndefined();
            // suppressHorizontalScroll defaults to false, not undefined
            expect(api.getGridOption('suppressHorizontalScroll')).toBe(false);
        });

        test('inner AgGridContext merge strategy is used', async () => {
            const { api } = await renderNestedGrid(
                {
                    gridOptions: { defaultColDef: { width: 100, editable: true } },
                    mergeStrategy: 'deep',
                },
                {
                    gridOptions: { defaultColDef: { width: 200, flex: 1 } },
                    mergeStrategy: 'shallow',
                },
                {
                    defaultColDef: { cellClass: 'test' },
                }
            );

            // Inner context uses shallow merge, so component props replace inner context nested object
            expect(api.getGridOption('defaultColDef')).toEqual({
                cellClass: 'test',
            });
        });

        test('nested contexts with deep merge at inner level', async () => {
            const { api } = await renderNestedGrid(
                {
                    gridOptions: { defaultColDef: { width: 100 } },
                    mergeStrategy: 'shallow',
                },
                {
                    gridOptions: { defaultColDef: { editable: true } },
                    mergeStrategy: 'deep',
                },
                {
                    defaultColDef: { flex: 1 },
                }
            );

            // Inner context deep merges with component props
            expect(api.getGridOption('defaultColDef')).toEqual({
                editable: true,
                flex: 1,
            });
        });
    });

    describe('gridOptions prop vs direct props', () => {
        test('direct props override gridOptions prop', async () => {
            const { api } = await renderGridWithPropsAndContext({
                gridOptions: { rowBuffer: 3, rowHeight: 20 },
                rowBuffer: 5,
            } as any);

            // Direct prop overrides gridOptions
            expect(api.getGridOption('rowBuffer')).toBe(5);
            // gridOptions-only option applied
            expect(api.getGridOption('rowHeight')).toBe(20);
        });

        test('direct props override AgGridContext gridOptions', async () => {
            const { api } = await renderGridWithPropsAndContext(
                { rowBuffer: 5 },
                {
                    gridOptions: { rowBuffer: 3, rowHeight: 20 },
                    mergeStrategy: 'shallow',
                }
            );

            // Direct prop overrides AgGridContext
            expect(api.getGridOption('rowBuffer')).toBe(5);
            // AgGridContext option applied
            expect(api.getGridOption('rowHeight')).toBe(20);
        });

        test('gridOptions prop merges with AgGridContext gridOptions (shallow)', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    gridOptions: { rowBuffer: 5, cellFadeDuration: 11 },
                } as any,
                {
                    gridOptions: { rowBuffer: 3, rowHeight: 20 },
                    mergeStrategy: 'shallow',
                }
            );

            // props.gridOptions overrides AgGridContext.gridOptions
            expect(api.getGridOption('rowBuffer')).toBe(5);
            expect(api.getGridOption('cellFadeDuration')).toBe(11);
            // AgGridContext option not overridden
            expect(api.getGridOption('rowHeight')).toBe(20);
        });

        test('gridOptions prop deep merges with AgGridContext gridOptions', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    gridOptions: { defaultColDef: { width: 200, flex: 1 } },
                } as any,
                {
                    gridOptions: { defaultColDef: { width: 100, editable: true } },
                    mergeStrategy: 'deep',
                }
            );

            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200,
                editable: true,
                flex: 1,
            });
        });
    });

    describe('context property handling', () => {
        test('context reference maintained with AgGridContext', async () => {
            const context = { foo: 'bar' };
            const { api } = await renderGridWithPropsAndContext(
                { context },
                {
                    gridOptions: { rowBuffer: 5 },
                    mergeStrategy: 'shallow',
                }
            );

            expect(api.getGridOption('context')).toBe(context);
        });

        test('component context overrides AgGridContext context', async () => {
            const componentContext = { foo: 'component' };
            const agContextContext = { bar: 'agContext' };

            const { api } = await renderGridWithPropsAndContext(
                { context: componentContext },
                {
                    gridOptions: { context: agContextContext },
                    mergeStrategy: 'shallow',
                }
            );

            expect(api.getGridOption('context')).toBe(componentContext);
            expect(api.getGridOption('context')).toEqual({ foo: 'component' });
        });

        test('deep merge combines context properties', async () => {
            const componentContext = { foo: 'component' };
            const agContextContext = { bar: 'agContext' };

            const { api } = await renderGridWithPropsAndContext(
                { context: componentContext },
                {
                    gridOptions: { context: agContextContext },
                    mergeStrategy: 'deep',
                }
            );

            expect(api.getGridOption('context')).toBe(componentContext);
            expect(api.getGridOption('context')).toEqual({
                foo: 'component',
                bar: 'agContext',
            });
        });

        test('AgGridContext context used when no component context', async () => {
            const agContextContext = { bar: 'agContext' };

            const { api } = await renderGridWithPropsAndContext(
                {},
                {
                    gridOptions: { context: agContextContext },
                    mergeStrategy: 'shallow',
                }
            );

            // Context may be copied, so use deep equality
            expect(api.getGridOption('context')).toEqual(agContextContext);
        });
    });

    describe('updates after initialization', () => {
        test('setGridOption uses provideGlobalGridOptions merge strategy (not AgGridContext)', async () => {
            // AgGridContext merge strategy only applies at initialization
            // setGridOption uses provideGlobalGridOptions strategy
            provideGlobalGridOptions({ defaultColDef: { editable: true } }, 'deep');

            const { api } = await renderGridWithPropsAndContext(
                {
                    defaultColDef: { width: 200 },
                },
                {
                    gridOptions: { defaultColDef: { flex: 5 } },
                    mergeStrategy: 'deep',
                }
            );

            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200,
                editable: true,
                flex: 5,
            });

            act(() => {
                api.setGridOption('defaultColDef', { cellClass: 'test' });
            });

            // setGridOption uses provideGlobalGridOptions deep merge
            await waitFor(() =>
                expect(api.getGridOption('defaultColDef')).toEqual({
                    cellClass: 'test',
                    editable: true,
                })
            );
        });

        test('setGridOption without provideGlobalGridOptions replaces value', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    defaultColDef: { width: 200 },
                },
                {
                    gridOptions: { defaultColDef: { editable: true } },
                    mergeStrategy: 'deep',
                }
            );

            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200,
                editable: true,
            });

            act(() => {
                api.setGridOption('defaultColDef', { flex: 1 });
            });

            // Without provideGlobalGridOptions deep merge, setGridOption replaces the value
            await waitFor(() =>
                expect(api.getGridOption('defaultColDef')).toEqual({
                    flex: 1,
                })
            );
        });

        test('setGridOption with shallow merge from AgGridContext', async () => {
            const { api } = await renderGridWithPropsAndContext(
                {
                    defaultColDef: { width: 200 },
                },
                {
                    gridOptions: { defaultColDef: { editable: true } },
                    mergeStrategy: 'shallow',
                }
            );

            expect(api.getGridOption('defaultColDef')).toEqual({
                width: 200,
            });

            act(() => {
                api.setGridOption('defaultColDef', { flex: 1 });
            });

            await waitFor(() =>
                expect(api.getGridOption('defaultColDef')).toEqual({
                    flex: 1,
                })
            );
        });
    });
});
