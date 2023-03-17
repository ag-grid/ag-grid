import { ColumnApi } from "./columns/columnApi";
import { DomLayoutType, GridOptions } from "./entities/gridOptions";
import { GetGroupAggFilteringParams, GetRowIdParams } from "./interfaces/iCallbackParams";
import { AgEvent } from "./events";
import { GridApi } from "./gridApi";
import { AgGridCommon, WithoutGridCommon } from "./interfaces/iCommon";
import { RowModelType } from "./interfaces/iRowModel";
import { AnyGridOptions } from "./propertyKeys";
import { IRowNode } from "./interfaces/iRowNode";
declare type GetKeys<T, U> = {
    [K in keyof T]: T[K] extends U | undefined ? K : never;
}[keyof T];
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
export declare type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;
declare type BooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>;
declare type NumberProps = Exclude<KeysOfType<number>, AnyGridOptions>;
declare type NoArgFuncs = KeysOfType<() => any>;
declare type AnyArgFuncs = KeysOfType<(arg: 'NO_MATCH') => any>;
declare type CallbackProps = Exclude<KeysOfType<(params: AgGridCommon<any, any>) => any>, NoArgFuncs | AnyArgFuncs>;
declare type NonPrimitiveProps = Exclude<keyof GridOptions, BooleanProps | NumberProps | CallbackProps | 'api' | 'columnApi' | 'context'>;
declare type ExtractParamsFromCallback<TCallback> = TCallback extends (params: infer PA) => any ? PA : never;
declare type ExtractReturnTypeFromCallback<TCallback> = TCallback extends (params: AgGridCommon<any, any>) => infer RT ? RT : never;
declare type WrappedCallback<K extends CallbackProps, OriginalCallback extends GridOptions[K]> = undefined | ((params: WithoutGridCommon<ExtractParamsFromCallback<OriginalCallback>>) => ExtractReturnTypeFromCallback<OriginalCallback>);
export interface PropertyChangedEvent extends AgEvent {
    type: keyof GridOptions;
    currentValue: any;
    previousValue: any;
}
export declare type PropertyChangedListener<T extends PropertyChangedEvent> = (event: T) => void;
export declare class GridOptionsService {
    private readonly gridOptions;
    private readonly eventService;
    private readonly environment;
    private eGridDiv;
    private destroyed;
    private scrollbarWidth;
    private domDataKey;
    api: GridApi;
    columnApi: ColumnApi;
    get context(): any;
    private propertyEventService;
    private gridOptionLookup;
    private agWire;
    init(): void;
    private destroy;
    /**
     * Is the given GridOption property set to true.
     * @param property GridOption property that has the type `boolean | undefined`
     */
    is(property: BooleanProps): boolean;
    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    get<K extends NonPrimitiveProps>(property: K): GridOptions[K];
    /**
     * Get the GridOption property as a number, raw value is returned via a toNumber coercion function.
     * @param property GridOption property that has the type `number | undefined`
     */
    getNum<K extends NumberProps>(property: K): number | undefined;
    /**
     * Get the GridOption callback but wrapped so that the common params of api,columnApi and context are automatically applied to the params.
     * @param property GridOption callback properties based on the fact that this property has a callback with params extending AgGridCommon
     */
    getCallback<K extends CallbackProps>(property: K): WrappedCallback<K, GridOptions[K]>;
    /**
     * Returns `true` if a value has been specified for this GridOption.
     * @param property GridOption property
     */
    exists(property: keyof GridOptions): boolean;
    /**
    * Wrap the user callback and attach the api, columnApi and context to the params object on the way through.
    * @param callback User provided callback
    * @returns Wrapped callback where the params object not require api, columnApi and context
    */
    private mergeGridCommonParams;
    /**
     *
     * @param key - key of the GridOption property to update
     * @param newValue - new value for this property
     * @param force - force the property change Event to be fired even if the value has not changed
     * @param eventParams - additional params to merge into the property changed event
     */
    set<K extends keyof GridOptions>(key: K, newValue: GridOptions[K], force?: boolean, eventParams?: object): void;
    addEventListener<T extends PropertyChangedEvent>(key: keyof GridOptions, listener: PropertyChangedListener<T>): void;
    removeEventListener<T extends PropertyChangedEvent>(key: keyof GridOptions, listener: PropertyChangedListener<T>): void;
    globalEventHandler(eventName: string, event?: any): void;
    getScrollbarWidth(): number;
    isRowModelType(rowModelType: RowModelType): boolean;
    isDomLayout(domLayout: DomLayoutType): boolean;
    isRowSelection(): boolean;
    useAsyncEvents(): boolean;
    isGetRowHeightFunction(): boolean;
    getRowHeightForNode(rowNode: IRowNode, allowEstimate?: boolean, defaultRowHeight?: number): {
        height: number;
        estimated: boolean;
    };
    private getMasterDetailRowHeight;
    getRowHeightAsNumber(): number;
    private isNumeric;
    getDomDataKey(): string;
    getDomData(element: Node | null, key: string): any;
    setDomData(element: Element, key: string, value: any): any;
    getDocument(): Document;
    getRootNode(): Document | ShadowRoot;
    getRowIdFunc(): ((params: WithoutGridCommon<GetRowIdParams>) => string) | undefined;
    getAsyncTransactionWaitMillis(): number | undefined;
    isAnimateRows(): boolean;
    isTreeData(): boolean;
    isMasterDetail(): boolean;
    isEnableRangeSelection(): boolean;
    isColumnsSortingCoupledToGroup(): boolean;
    getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined;
    isGroupMultiAutoColumn(): boolean;
    isGroupUseEntireRow(pivotMode: boolean): boolean;
}
export {};
