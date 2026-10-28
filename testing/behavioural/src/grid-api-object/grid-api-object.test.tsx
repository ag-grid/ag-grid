import { cleanup, render, waitFor } from '@testing-library/react';
import { ALL_SEVERITIES, asyncSetTimeout, waitForMissingModuleReports } from 'ag-test-utils';
import React from 'react';
import type { MockInstance } from 'vitest';

import type { AgPublicEventType, ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    EventApiModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
    createGrid,
    enableDevValidations,
    getGridApi,
    getGridElement,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('grid api object', () => {
    let consoleWarnSpy: MockInstance | undefined;
    let consoleErrorSpy: MockInstance | undefined;

    function createMyGrid(gridOptions: GridOptions = {}, element = document.getElementById('myGrid')!) {
        return createGrid(element, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, EventApiModule, ValidationModule, RowApiModule]);
    });

    beforeEach(() => {
        resetGrids();
    });

    afterEach(() => {
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    test('grid api is a simple JS object and has core methods', () => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        const api = createMyGrid();

        expect(api).toBeDefined();
        expect(typeof api).toBe('object');

        // It has all Object.prototype methods
        for (const key of Object.getOwnPropertyNames(Object.prototype)) {
            if (key !== 'constructor' && key !== '__proto__') {
                expect((api as any)[key]).toBe((Object.prototype as Record<string, unknown>)[key]);
            }
        }
        expect(typeof api.constructor).toBe('function');

        // It has a class name

        expect(api.constructor.name).toBe('GridApi');

        // It has functions
        expect(typeof api.isDestroyed).toBe('function');
        expect(typeof api.destroy).toBe('function');
        expect(typeof api.getRowNode).toBe('function');
        expect(typeof api.dispatchEvent).toBe('function');

        // It passes "in" check
        expect('isDestroyed' in api).toBe(true);
        expect('destroy' in api).toBe(true);
        expect('getRowNode' in api).toBe(true);
        expect('dispatchEvent' in api).toBe(true);

        // It has Object.keys
        const keys = Object.keys(api);
        expect(keys).toContain('isDestroyed');
        expect(keys).toContain('destroy');
        expect(keys).toContain('getRowNode');
        expect(keys).toContain('dispatchEvent');

        const getOwnPropertyNames = Object.getOwnPropertyNames(api);
        expect(getOwnPropertyNames).toContain('isDestroyed');
        expect(getOwnPropertyNames).toContain('destroy');
        expect(getOwnPropertyNames).toContain('getRowNode');
        expect(getOwnPropertyNames).toContain('dispatchEvent');

        // Always the same instance is returned
        expect(api.isDestroyed).toBe(api.isDestroyed);
        expect(api.destroy).toBe(api.destroy);
        expect(api.getRowNode).toBe(api.getRowNode);
        expect(api.dispatchEvent).toBe(api.dispatchEvent);

        // All API function names are correct
        expect(api.isDestroyed.name).toBe('isDestroyed');
        expect(api.destroy.name).toBe('destroy');
        expect(api.getRowNode.name).toBe('getRowNode');
        expect(api.dispatchEvent.name).toBe('dispatchEvent');

        // It has different instances for different functions
        expect(api.getRowNode).not.toBe(api.getAllGridColumns);

        expect(api.isDestroyed()).toBe(false);

        // Properties can be set
        expect('myProperty' in api).toBe(false);
        expect((api as any).myProperty).toBe(undefined);
        (api as any).myProperty = 123;
        expect((api as any).myProperty).toBe(123);
        expect('myProperty' in api).toBe(true);

        // Methods can be overridden (or spied with testing frameworks)
        const oldGetRowNode = api.getRowNode;
        api.getRowNode = () => 'xxxx' as any;
        expect((api.getRowNode as any)()).toBe('xxxx');
        api.getRowNode = oldGetRowNode;
        expect(api.getRowNode).toBe(oldGetRowNode);

        // Methods can be deleted
        delete (api as Partial<GridApi>).getRowNode;
        expect('getRowNode' in api).toBe(false);
        api.getRowNode = oldGetRowNode;

        // Methods are bound to the grid
        const { isDestroyed, getRowNode } = api;
        expect(isDestroyed()).toBe(false);
        expect(getRowNode('123')).toBe(undefined);

        // No warnings or errors
        expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    test('destruction warnings', () => {
        // Deliberately calls an API on a destroyed grid to verify the destruction warning.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [26] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = createMyGrid();
        expect(api.isDestroyed()).toBe(false);

        expect(api.getRowNode('123')).toBeUndefined();

        api.destroy();
        expect(api.isDestroyed()).toBe(true);

        api.destroy();
        expect(api.isDestroyed()).toBe(true);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(0);

        expect(api.getRowNode('123')).toBe(undefined);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #26',
            expect.stringContaining(`Grid API function \`getRowNode()\` cannot be called as the grid has been destroyed.
 Either clear local references to the grid api, when it is destroyed, or check \`gridApi.isDestroyed()\` to avoid calling methods against a destroyed grid.
 To run logic when the grid is about to be destroyed use the \`gridPreDestroyed\` event.`),
            expect.stringContaining('/javascript-data-grid/errors/26')
        );

        expect(api.getRowNode('123')).toBe(undefined);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    test('missing module warning', async () => {
        // Deliberately calls an API whose module is not registered (error #200), then on a destroyed grid (warning #26).
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200, 26] });
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = createMyGrid();

        expect(typeof api.exportDataAsExcel).toBe('function');
        expect('exportDataAsExcel' in api).toBe(true);
        expect(api.exportDataAsExcel).toBe(api.exportDataAsExcel);

        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);

        expect(api.exportDataAsExcel()).toBeUndefined();
        await waitForMissingModuleReports();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'AG Grid: error #200',
            expect.stringContaining('Unable to use `api.exportDataAsExcel` as `ExcelExportModule` is not registered'),
            expect.stringContaining('/javascript-data-grid/errors/200')
        );

        expect(api.exportDataAsExcel()).toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        api.destroy();

        expect(api.exportDataAsExcel()).toBeUndefined();
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #26',
            expect.stringContaining(`Grid API function \`exportDataAsExcel()\` cannot be called as the grid has been destroyed.
 Either clear local references to the grid api, when it is destroyed, or check \`gridApi.isDestroyed()\` to avoid calling methods against a destroyed grid.
 To run logic when the grid is about to be destroyed use the \`gridPreDestroyed\` event.`),
            expect.stringContaining('/javascript-data-grid/errors/26')
        );

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    test('can get gridApi reference from DOM node', () => {
        const element = document.getElementById('myGrid')!;

        const api = createMyGrid(undefined, element);

        const apiFromDOM = getGridApi('#myGrid');

        const elementFromApi = getGridElement(api);

        expect(elementFromApi?.parentElement).toBe(element);
        expect(apiFromDOM).toBe(api);

        // create a second grid in the same parent element
        const api2 = createMyGrid(undefined, element);

        const api2FromDOM = getGridApi(element.children[1]);
        const element2FromApi = getGridElement(api2);

        expect(api2FromDOM).toBe(api2);
        expect(element2FromApi?.parentElement).toBe(element);

        // destroy second grid
        api2.destroy();

        expect(getGridApi(element.children[1])).toBeUndefined();
        expect(getGridApi('#myGrid')).toBe(api);

        // destroy first grid
        api.destroy();
        expect(getGridApi('#myGrid')).toBeUndefined();
    });

    test('a listener added twice is called once per event and removed by one remove', async () => {
        const api = createMyGrid({ columnDefs: [{ field: 'a' }] });
        const calls: string[] = [];
        const listener = () => calls.push('event');
        const globalListener = (eventType: string) => eventType === 'rowDataUpdated' && calls.push('global');
        api.addEventListener('rowDataUpdated', listener);
        api.addEventListener('rowDataUpdated', listener);
        api.addGlobalListener(globalListener);
        api.addGlobalListener(globalListener);

        api.setGridOption('rowData', [{ a: 1 }]);
        await asyncSetTimeout(0);
        expect(calls).toEqual(['event', 'global']);

        api.removeEventListener('rowDataUpdated', listener);
        api.removeGlobalListener(globalListener);
        api.setGridOption('rowData', [{ a: 2 }]);
        await asyncSetTimeout(0);
        expect(calls).toEqual(['event', 'global']);

        api.destroy();
    });

    test('a global listener gets always-sync events during the call and the rest after it, internal ones included, until removed', async () => {
        const api = createMyGrid({ columnDefs: [{ field: 'a' }], rowData: [{ a: 1 }] });
        const watched = new Set(['rowDataUpdated', 'rowContainerHeightChanged', 'gridPreDestroyed', 'customEvent']);
        let inCall = false;
        const received: string[] = [];
        const record = (name: string) => (eventType: string) => {
            if (watched.has(eventType)) {
                received.push(`${name}: ${eventType} ${inCall ? 'during' : 'after'} the call`);
            }
        };
        const kept = record('kept');
        const removed = record('removed');
        api.addGlobalListener(kept);
        api.addGlobalListener(removed);
        // the API types name only the grid's events, but an application may dispatch and listen to its own
        api.addEventListener('customEvent' as AgPublicEventType, () => record('type listener')('customEvent'));
        const call = async (action: () => void) => {
            inCall = true;
            action();
            inCall = false;
            await asyncSetTimeout(0);
        };

        await call(() => api.setGridOption('rowData', [{ a: 2 }, { a: 3 }]));
        await call(() => api.dispatchEvent({ type: 'customEvent' }));
        await call(() => api.removeGlobalListener(removed));
        await call(() => api.setGridOption('rowData', [{ a: 4 }]));
        await call(() => api.addGlobalListener(removed));
        await call(() => api.destroy());

        expect(received).toEqual([
            'kept: rowDataUpdated after the call',
            'removed: rowDataUpdated after the call',
            'kept: rowContainerHeightChanged after the call',
            'removed: rowContainerHeightChanged after the call',
            'type listener: customEvent after the call',
            'kept: customEvent after the call',
            'removed: customEvent after the call',
            'kept: rowDataUpdated after the call',
            'kept: rowContainerHeightChanged after the call',
            'kept: gridPreDestroyed during the call',
            'removed: gridPreDestroyed during the call',
        ]);
    });

    test('a gridOptions handler runs after the call raising its event, after api listeners, and never for an internal event', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [307, 310] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        const calls: string[] = [];
        let ready = false;
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'a' }],
            onGridReady: () => {
                ready = true;
            },
            onRowDataUpdated: () => calls.push('rowDataUpdated: gridOptions'),
        };
        // internal events are not on the GridOptions type
        Object.assign(gridOptions, { onDisplayedRowsChanged: () => calls.push('displayedRowsChanged: gridOptions') });
        const api = createMyGrid(gridOptions);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #307',
            expect.stringContaining('Invalid `gridOptions` property `onDisplayedRowsChanged`'),
            expect.anything()
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #310',
            expect.stringContaining('One or more `gridOptions` properties are not recognised'),
            expect.anything()
        );
        await waitFor(() => expect(ready).toBe(true));
        api.addEventListener('rowDataUpdated', () => calls.push('rowDataUpdated: api'));
        api.addGlobalListener((eventType: string) => {
            if (eventType === 'rowDataUpdated' || eventType === 'displayedRowsChanged') {
                calls.push(`${eventType}: api global`);
            }
        });

        api.setGridOption('rowData', [{ a: 1 }]);
        expect(calls).toEqual([]);

        await asyncSetTimeout(0);
        expect(calls.filter((call) => call.startsWith('rowDataUpdated'))).toEqual([
            'rowDataUpdated: api',
            'rowDataUpdated: gridOptions',
            'rowDataUpdated: api global',
        ]);
        expect(calls.filter((call) => call.startsWith('displayedRowsChanged'))).toEqual([
            'displayedRowsChanged: api global',
        ]);

        api.destroy();
    });

    test('a gridOptions handler set before its event is delivered receives it, and none runs once the grid is destroyed', async () => {
        const calls: string[] = [];
        let ready = false;
        const api = createMyGrid({
            columnDefs: [{ field: 'a' }],
            onGridReady: () => {
                ready = true;
            },
        });
        await waitFor(() => expect(ready).toBe(true));

        api.setGridOption('rowData', [{ a: 1 }]);
        api.setGridOption('onRowDataUpdated', () => calls.push('rowDataUpdated'));
        await asyncSetTimeout(0);
        expect(calls).toEqual(['rowDataUpdated']);

        api.setGridOption('rowData', [{ a: 2 }]);
        api.destroy();
        await asyncSetTimeout(0);
        expect(calls).toEqual(['rowDataUpdated']);
    });

    test('a gridOptions handler runs before a timer set after a row data update earlier in the same turn', async () => {
        const calls: string[] = [];
        let ready = false;
        const api = createMyGrid({
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
            onGridReady: () => {
                ready = true;
            },
            onRowDataUpdated: () => calls.push('rowDataUpdated'),
        });
        await waitFor(() => expect(ready).toBe(true));
        await asyncSetTimeout(0);
        calls.length = 0;

        api.getDisplayedRowAtIndex(0)!.updateData({ a: 2 });
        setTimeout(() => calls.push('timer'), 0);
        api.setGridOption('rowData', [{ a: 3 }]);
        await asyncSetTimeout(0);

        expect(calls).toEqual(['rowDataUpdated', 'timer']);
        api.destroy();
    });

    test('events raised before gridReady reach their gridOptions handlers after onGridReady, in order', async () => {
        const calls: string[] = [];
        createMyGrid({
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
            onGridReady: () => calls.push('gridReady'),
            onRowDataUpdated: () => calls.push('rowDataUpdated'),
            onFirstDataRendered: () => calls.push('firstDataRendered'),
        });
        expect(calls).toEqual([]);

        await waitFor(() => expect(calls).toEqual(['gridReady', 'rowDataUpdated', 'firstDataRendered']));
    });

    test('onGridPreDestroyed is called for a grid destroyed in or after onGridReady, and neither for one destroyed before', async () => {
        const calls: string[] = [];
        const createNamedGrid = (name: string, onReady?: (api: GridApi) => void) => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            return createMyGrid(
                {
                    columnDefs: [{ field: 'a' }],
                    onGridReady: ({ api }) => {
                        calls.push(`${name}: ready`);
                        onReady?.(api);
                    },
                    onGridPreDestroyed: () => calls.push(`${name}: preDestroyed`),
                },
                element
            );
        };

        createNamedGrid('before').destroy();
        createNamedGrid('in', (api) => api.destroy());
        const after = createNamedGrid('after');
        await waitFor(() => expect(calls).toContain('after: ready'));
        after.destroy();

        expect(calls).toEqual(['in: ready', 'in: preDestroyed', 'after: ready', 'after: preDestroyed']);
    });

    test('a throwing onGridPreDestroyed handler still lets the grid be destroyed, and its error reaches the caller', async () => {
        const element = document.getElementById('myGrid')!;
        let ready = false;
        const api = createMyGrid({
            columnDefs: [{ field: 'a' }],
            onGridReady: () => {
                ready = true;
            },
            onGridPreDestroyed: () => {
                throw new Error('handler failed');
            },
        });
        await waitFor(() => expect(ready).toBe(true));
        expect(element.childElementCount).toBe(1);

        expect(() => api.destroy()).toThrow('handler failed');
        expect(api.isDestroyed()).toBe(true);
        expect(element.childElementCount).toBe(0);
    });

    test('api.getGridElement() returns the correct wrapping DOM element', () => {
        const element = document.getElementById('myGrid')!;

        const api = createMyGrid(undefined, element);

        const gridElement = api.getGridElement();
        const helperElement = getGridElement(api);

        expect(gridElement).toBeDefined();
        expect(gridElement!.parentElement).toBe(element);
        expect(gridElement).toBe(helperElement);

        api.destroy();
    });

    test('an event handler prop dropped on re-render is no longer called, other dropped props keep their value (React)', async () => {
        cleanup();
        let gridRef: AgGridReact | null = null;
        let handlerCalls = 0;
        let apiListenerCalls = 0;
        const onRowDataUpdated = () => handlerCalls++;
        const columnDefs: ColDef[] = [{ field: 'a' }];
        const ref = (r: AgGridReact | null) => {
            gridRef = r;
        };

        const { rerender } = render(
            <AgGridReact
                ref={ref}
                columnDefs={columnDefs}
                rowData={[{ a: 1 }]}
                rowHeight={40}
                onRowDataUpdated={onRowDataUpdated}
            />
        );
        await waitFor(() => expect(handlerCalls).toBe(1));
        // an api listener is called in the same batch as, and before, the gridOptions handler
        gridRef!.api.addEventListener('rowDataUpdated', () => apiListenerCalls++);

        rerender(
            <AgGridReact
                ref={ref}
                columnDefs={columnDefs}
                rowData={[{ a: 2 }]}
                rowHeight={40}
                onRowDataUpdated={onRowDataUpdated}
            />
        );
        await waitFor(() => expect(apiListenerCalls).toBe(1));
        expect(handlerCalls).toBe(2);

        rerender(<AgGridReact ref={ref} columnDefs={columnDefs} rowData={[{ a: 3 }]} />);
        await waitFor(() => expect(apiListenerCalls).toBe(2));
        expect(handlerCalls).toBe(2);
        // only handlers are cleared: a dropped option keeps its value
        expect(gridRef!.api.getGridOption('rowHeight')).toBe(40);
    });

    test('can get gridApi reference from DOM node (React)', () => {
        cleanup();

        let ref: any | null = null;

        const page = render(
            <AgGridReact
                ref={(e) => {
                    ref = e;
                }}
                gridId="myGrid"
            />
        );

        const apiFromDOM = getGridApi('myGrid');

        const elementFromApi = getGridElement(ref.api);

        expect(apiFromDOM).toBe(ref.api);
        expect(elementFromApi?.parentElement).toBe(page.container);
    });
});
