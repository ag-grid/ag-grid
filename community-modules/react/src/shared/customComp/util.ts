import type { ICellEditor, IFilter, IStatusPanel, IToolPanel } from '@ag-grid-community/core';
import { AgPromise, _warnOnce } from '@ag-grid-community/core';

/**
 * Function to retrieve the React component from an instance returned by the grid.
 * @param wrapperComponent Instance component from the grid
 * @param callback Callback which is provided the underlying React custom component
 */
export function getInstance<
    TGridComponent extends IFilter | IToolPanel | ICellEditor | IStatusPanel =
        | IFilter
        | IToolPanel
        | ICellEditor
        | IStatusPanel,
    TCustomComponent extends TGridComponent = TGridComponent,
>(wrapperComponent: TGridComponent, callback: (customComponent: TCustomComponent | undefined) => void): void {
    const promise = (wrapperComponent as any)?.getInstance?.() ?? AgPromise.resolve(undefined);
    promise.then((comp: TCustomComponent | undefined) => callback(comp));
}

export function warnReactiveCustomComponents(): void {
    _warnOnce('As of v32, using custom components with `reactiveCustomComponents = false` is deprecated.');
}
