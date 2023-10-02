import { ColumnApi, GridApi, _ } from '@ag-grid-community/core';
import { MutableRefObject, useRef, useState } from 'react';
import { AgGridReact } from './agGridReact';

/* type ApiStatus = 'initialising' | 'initialised' | 'destroyed';
const buildStub = <T>(initialisedRef: MutableRefObject<ApiStatus>, stub: T) => {
    _.removeAllReferences(stub, 'GridApi', (key) => {
        switch (initialisedRef.current) {
            case 'initialising':
                return `AG Grid: Grid api cannot be used until the AgGridReact component is initialised completely. i.e 'gridReady' event has fired. You called api.${key} too early.`;
            case 'initialised':
                return `AG Grid: Grid api reference is stale did you forget to include "api" in the dependency array when calling api.${key}?`;
            case 'destroyed':
                return `AG Grid: Grid api has been destroyed. You called api.${key} on a destroyed grid.`;
        }
    }) as any;
    return stub;
};
 */
export type UseGridApisType<TData = any> = readonly [
    gridRef: (agGridReactRef: AgGridReact<TData>) => void,
    api: GridApi<TData> | undefined, 
    columnApi: ColumnApi | undefined
];
/**
 * Hook to get the grid api and column api from the AgGridReact component that is passed the gridRef.
 * api, columnApi - will be set when the grid is fully initialised and ready for use.
 * api, columnApi need to be included in the dependencies array of any hooks they are part of.
 * Will cause a re-render when the api and columnApi are set.
 * @returns [gridRef, api, columnApi]
 * @param gridRef - Pass to the AgGridReact component to setup hook
 * @param apiRef - Grid api: set when the grid is fully initialised and not destroyed.
 * @param columnApiRef - Column api: set when the grid is fully initialised and not destroyed.
 */
export const useGridApis = <TData = any>() : UseGridApisType<TData> => {
    //const initialisedRef = useRef<ApiStatus>('initialising');
    //const destroyedRef = useRef<ApiStatus>('destroyed');
    //const [apiStub] = useState<GridApi>(() => buildStub(initialisedRef, new GridApi()));
    //const [columnApiStub] = useState<ColumnApi>(() => buildStub(initialisedRef, new ColumnApi()));

    const [apis, setApis] = useState<{ api: GridApi<TData> | undefined; columnApi: ColumnApi | undefined }>(
        //{        api: apiStub,        columnApi: columnApiStub,    }
        { api: undefined, columnApi: undefined }
        );

    const gridRef = (agGridReactRef: AgGridReact<TData>) => {
        if (!agGridReactRef) {
            return;
        }
        agGridReactRef.registerApiListener(({ api, columnApi }) => {
           // initialisedRef.current = 'initialised';
            setApis({ api, columnApi });
            api.addEventListener('gridPreDestroyed', () => {
                // will be called async after any user gridPreDestroyed functions have been called synchronously
                setApis({
                    api: undefined,
                    columnApi: undefined,
                });
            });
        });
    };

    return [gridRef, apis.api, apis.columnApi] as const;
};

export type UseGridApiRefsType<TData = any> = readonly [
    gridRef: (agGridReactRef: AgGridReact<TData>) => void, 
    apiRef: MutableRefObject<GridApi<TData> | undefined>, 
    columnApiRef: MutableRefObject<ColumnApi | undefined>];

/**
 * Hook to access grid / column api refs from AgGridReact component.
 * apiRef, columnApiRef - will only be defined when the grid is fully initialised and not destroyed.
 * @returns [gridRef, apiRef, columnApiRef]
 * @param gridRef - Pass to the AgGridReact component to setup hook
 * @param apiRef - Grid api ref that will be set when the grid is fully initialised and not destroyed.
 * @param columnApiRef - Column api ref that will be set when the grid is fully initialised and not destroyed.
 * @example
 * // Setup the hook
 * const [gridRef, apiRef, columnApiRef] = useGridApis(); 
 * // Use the hook
 * const onButtonClick = () => {
 *  if (apiRef.current) {
 *      apiRef.current.selectAll();
 *  }
 * // Pass gridRef to AgGridReact
 * <AgGridReact
 * gridRef={gridRef}
 * ...
 * />
 */
export const useGridApiRefs = <TData = any>() : UseGridApiRefsType<TData> => {
   // const destroyedRef = useRef<ApiStatus>('destroyed');

    const apiRef = useRef<GridApi<TData> | undefined>();
    const columnApiRef = useRef<ColumnApi | undefined>();

    const gridRef = (agGridReactRef: AgGridReact<TData>) => {
        if (!agGridReactRef) {
            return;
        }
        agGridReactRef.registerApiListener(({ api, columnApi }) => {
            apiRef.current = api;
            columnApiRef.current = columnApi;
            api.addEventListener('gridPreDestroyed', () => {
                // will be called async after any user gridPreDestroyed functions have been called synchronously
                // TODO: Decide if we want to set these to undefined or a stub
                apiRef.current = undefined //buildStub(destroyedRef, new GridApi());
                columnApiRef.current = undefined // buildStub(destroyedRef, new ColumnApi());
            });
        });
    };
    return [gridRef, apiRef, columnApiRef] as const;
};
