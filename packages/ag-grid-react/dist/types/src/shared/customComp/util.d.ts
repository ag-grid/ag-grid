import type { ICellEditor, IFilter, IStatusPanel, IToolPanel } from 'ag-grid-community';
/**
 * Function to retrieve the React component from an instance returned by the grid.
 * @param wrapperComponent Instance component from the grid
 * @param callback Callback which is provided the underlying React custom component
 */
export declare function getInstance<TGridComponent extends IFilter | IToolPanel | ICellEditor | IStatusPanel = IFilter | IToolPanel | ICellEditor | IStatusPanel, TCustomComponent extends TGridComponent = TGridComponent>(wrapperComponent: TGridComponent, callback: (customComponent: TCustomComponent | undefined) => void): void;
export declare function warnReactiveCustomComponents(): void;
