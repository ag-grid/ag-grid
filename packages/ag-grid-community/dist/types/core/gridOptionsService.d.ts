import { DomLayoutType, GridOptions } from "./entities/gridOptions";
import { GetGroupAggFilteringParams, GetGroupIncludeFooterParams } from "./interfaces/iCallbackParams";
import { AgEvent } from "./events";
import { AgGridCommon, WithoutGridCommon } from "./interfaces/iCommon";
import { RowModelType } from "./interfaces/iRowModel";
import { AnyGridOptions } from "./propertyKeys";
import { IRowNode } from "./interfaces/iRowNode";
import { GRID_OPTION_DEFAULTS } from "./validation/rules/gridOptionsValidations";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
type GetKeys<T, U> = {
    [K in keyof T]: T[K] extends U | undefined ? K : never;
}[keyof T];
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
export type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;
type BooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>;
type NoArgFuncs = KeysOfType<() => any>;
type AnyArgFuncs = KeysOfType<(arg: 'NO_MATCH') => any>;
type CallbackProps = Exclude<KeysOfType<(params: AgGridCommon<any, any>) => any>, NoArgFuncs | AnyArgFuncs>;
type ExtractParamsFromCallback<TCallback> = TCallback extends (params: infer PA) => any ? PA : never;
type ExtractReturnTypeFromCallback<TCallback> = TCallback extends (params: AgGridCommon<any, any>) => infer RT ? RT : never;
type WrappedCallback<K extends CallbackProps, OriginalCallback extends GridOptions[K]> = undefined | ((params: WithoutGridCommon<ExtractParamsFromCallback<OriginalCallback>>) => ExtractReturnTypeFromCallback<OriginalCallback>);
export interface PropertyChangeSet {
    /** Unique id which can be used to link changes of multiple properties that were updated together.
     * i.e a user updated multiple properties at the same time.
     */
    id: number;
    /** All the properties that have been updated in this change set */
    properties: (keyof GridOptions)[];
}
export type PropertyChangedSource = 'api' | 'gridOptionsUpdated';
export interface PropertyChangedEvent extends AgEvent {
    type: 'gridPropertyChanged';
    changeSet: PropertyChangeSet | undefined;
    source: PropertyChangedSource;
}
/**
 * For boolean properties the changed value will have been coerced to a boolean, so we do not want the type to include the undefined value.
 */
type GridOptionsOrBooleanCoercedValue<K extends keyof GridOptions> = K extends BooleanProps ? boolean : GridOptions[K];
export interface PropertyValueChangedEvent<K extends keyof GridOptions> extends AgEvent {
    type: K;
    changeSet: PropertyChangeSet | undefined;
    currentValue: GridOptionsOrBooleanCoercedValue<K>;
    previousValue: GridOptionsOrBooleanCoercedValue<K>;
    source: PropertyChangedSource;
}
export type PropertyChangedListener = (event: PropertyChangedEvent) => void;
export type PropertyValueChangedListener<K extends keyof GridOptions> = (event: PropertyValueChangedEvent<K>) => void;
export declare class GridOptionsService {
    private readonly gridOptions;
    private readonly eventService;
    private readonly environment;
    frameworkOverrides: IFrameworkOverrides;
    private eGridDiv;
    private validationService;
    private destroyed;
    private scrollbarWidth;
    private domDataKey;
    private readonly api;
    /** @deprecated v31 ColumnApi has been deprecated and all methods moved to the api. */
    private columnApi;
    private get context();
    private propertyEventService;
    init(): void;
    private destroy;
    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    get<K extends keyof GridOptions>(property: K): K extends keyof typeof GRID_OPTION_DEFAULTS ? NonNullable<GridOptions[K]> : GridOptions[K];
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
     * Handles value coercion including validation of ranges etc. If value is invalid, undefined is set, allowing default to be used.
     */
    private static PROPERTY_COERCIONS;
    private static toBoolean;
    private static toNumber;
    private static toConstrainedNum;
    private static getCoercedValue;
    static getCoercedGridOptions(gridOptions: GridOptions): GridOptions;
    private static changeSetId;
    updateGridOptions({ options, source }: {
        options: Partial<GridOptions>;
        source?: PropertyChangedSource;
    }): void;
    addEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void;
    removeEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void;
    globalEventHandlerFactory: (restrictToSyncOnly?: boolean) => (eventName: string, event?: any) => void;
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
    getActiveDomElement(): Element | null;
    getAsyncTransactionWaitMillis(): number | undefined;
    isAnimateRows(): NonNullable<boolean | undefined>;
    isGroupRowsSticky(): boolean;
    isColumnsSortingCoupledToGroup(): boolean;
    getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined;
    getGrandTotalRow(): 'top' | 'bottom' | undefined;
    getGroupTotalRowCallback(): (params: WithoutGridCommon<GetGroupIncludeFooterParams>) => 'top' | 'bottom' | undefined;
    isGroupMultiAutoColumn(): NonNullable<boolean | undefined>;
    isGroupUseEntireRow(pivotMode: boolean): boolean;
    getGridCommonParams<TData = any, TContext = any>(): AgGridCommon<TData, TContext>;
    addGridCommonParams<T extends AgGridCommon<TData, TContext>, TData = any, TContext = any>(params: WithoutGridCommon<T>): T;
}
export {};
