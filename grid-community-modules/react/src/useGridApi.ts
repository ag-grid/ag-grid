import { GridApi, _ } from '@ag-grid-community/core';
import { MutableRefObject, useRef } from 'react';
import { AgGridReact } from './agGridReact';

const buildStub = <T>(stub: T) => {
    _.removeAllReferences(stub, 'GridApi', (key) =>`AG Grid: api.${key} was called on a destroyed grid (api.isDestroyed() == true) resulting in a no-op.`);
    return stub;
};

export type UseGridApiRefsType<TData = any> = readonly [
    gridRef: (agGridReactRef: AgGridReact<TData>) => void, 
    apiRef: MutableRefObject<GridApi<TData> | undefined>];

/**
 * Hook to access grid / column api refs from AgGridReact component.
 * apiRef, will only be defined when the grid is fully initialised and not destroyed.
 * @returns [gridRef, apiRef]
 * @param gridRef - Pass to the AgGridReact component to setup hook
 * @param apiRef - Grid api ref that will be set when the grid is fully initialised and not destroyed.
 * @example
 * // Setup the hook
 * const [gridRef, apiRef] = useGridApis(); 
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
export const useGridApi = <TData = any>() : UseGridApiRefsType<TData> => {
    const apiRef = useRef<GridApi<TData> | undefined>();

    const gridRef = (agGridReactRef: AgGridReact<TData>) => {
        if (!agGridReactRef) {
            return;
        }
        agGridReactRef.registerApiListener((api) => {
            apiRef.current = api;
            api.addEventListener('gridPreDestroyed', () => {
                // will be called async after any user gridPreDestroyed functions have been called synchronously                
                apiRef.current = buildStub(api);
            });
        });
    };
    return [gridRef, apiRef] as const;
};
