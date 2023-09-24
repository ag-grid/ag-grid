import { ColumnApi } from "./columns/columnApi";
import { DomLayoutType, GridOptions } from "./entities/gridOptions";
import { GetGroupAggFilteringParams, GetGroupIncludeFooterParams } from "./interfaces/iCallbackParams";
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
export interface PropertyChangeSet {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof GridOptions)[];
}
export interface PropertyChangedEvent extends AgEvent {
    type: 'gridPropertyChanged';
    changeSet: PropertyChangeSet | undefined;
}
/**
 * For boolean properties the changed value will have been coerced to a boolean, so we do not want the type to include the undefined value.
 */
declare type GridOptionsOrBooleanCoercedValue<K extends keyof GridOptions> = K extends BooleanProps ? boolean : GridOptions[K];
export interface PropertyValueChangedEvent<K extends keyof GridOptions> extends AgEvent {
    type: K;
    changeSet: PropertyChangeSet | undefined;
    currentValue: GridOptionsOrBooleanCoercedValue<K>;
    previousValue: GridOptionsOrBooleanCoercedValue<K>;
}
export declare type PropertyChangedListener = (event: PropertyChangedEvent) => void;
export declare type PropertyValueChangedListener<K extends keyof GridOptions> = (event: PropertyValueChangedEvent<K>) => void;
export declare class GridOptionsService {
    private readonly gridOptions;
    private readonly eventService;
    private readonly environment;
    private eGridDiv;
    private destroyed;
    private scrollbarWidth;
    private domDataKey;
    private static readonly alwaysSyncGlobalEvents;
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
     * DO NOT USE - only for use for ComponentUtil applyChanges via GridApi.
     * Use `set` method instead.
     * Only update the property value, don't fire any events. This enables all properties
     * that have been updated together to be updated before any events get triggered to avoid
     * out of sync issues.
     * @param key - key of the GridOption property to update
     * @param newValue - new value for this property
     * @returns The `true` if the previous value is not equal to the new value.
     */
    __setPropertyOnly<K extends keyof GridOptions>(key: K, newValue: GridOptions[K]): boolean;
    /**
     *
     * @param key - key of the GridOption property to update
     * @param newValue - new value for this property
     * @param force - force the property change Event to be fired even if the value has not changed
     * @param eventParams - additional params to merge into the property changed event
     * @param changeSetId - Change set id used to identify keys that have been updated in the same framework lifecycle update.
     */
    set<K extends keyof GridOptions>(key: K, newValue: GridOptions[K], force?: boolean, eventParams?: object, changeSet?: PropertyChangeSet | undefined): void;
    addEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void;
    removeEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void;
    globalEventHandlerFactory: (restrictToSyncOnly?: boolean | undefined) => (eventName: string, event?: any) => void;
    getGridId(): string;
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
    getWindow(): Window & typeof globalThis;
    getRootNode(): Document | ShadowRoot;
    getAsyncTransactionWaitMillis(): number | undefined;
    isAnimateRows(): boolean;
    isGroupRowsSticky(): boolean;
    isColumnsSortingCoupledToGroup(): boolean;
    getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined;
    isGroupIncludeFooterTrueOrCallback(): boolean;
    getGroupIncludeFooter(): (params: WithoutGridCommon<GetGroupIncludeFooterParams>) => boolean;
    isGroupMultiAutoColumn(): boolean;
    isGroupUseEntireRow(pivotMode: boolean): boolean;
}
export {};
