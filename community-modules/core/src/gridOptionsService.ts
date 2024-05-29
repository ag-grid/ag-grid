import { ComponentUtil } from './components/componentUtil';
import { BeanStub } from './context/beanStub';
import type { BeanCollection, BeanName } from './context/context';
import type { DomLayoutType, GridOptions } from './entities/gridOptions';
import type { Environment } from './environment';
import type { AgEvent, GridOptionsChangedEvent } from './events';
import { ALWAYS_SYNC_GLOBAL_EVENTS, Events } from './events';
import type { GridApi } from './gridApi';
import type {
    GetGroupAggFilteringParams,
    GetGroupIncludeFooterParams,
    RowHeightParams,
} from './interfaces/iCallbackParams';
import type { AgGridCommon, WithoutGridCommon } from './interfaces/iCommon';
import type { RowModelType } from './interfaces/iRowModel';
import type { IRowNode } from './interfaces/iRowNode';
import { LocalEventService } from './localEventService';
import type { AnyGridOptions } from './propertyKeys';
import { INITIAL_GRID_OPTION_KEYS, PropertyKeys } from './propertyKeys';
import { _getScrollbarWidth } from './utils/browser';
import { _warnOnce } from './utils/function';
import { _exists, _missing } from './utils/generic';
import { GRID_OPTION_DEFAULTS } from './validation/rules/gridOptionsValidations';
import type { ValidationService } from './validation/validationService';

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
type ExtractReturnTypeFromCallback<TCallback> = TCallback extends (params: AgGridCommon<any, any>) => infer RT
    ? RT
    : never;
type WrappedCallback<K extends CallbackProps, OriginalCallback extends GridOptions[K]> =
    | undefined
    | ((
          params: WithoutGridCommon<ExtractParamsFromCallback<OriginalCallback>>
      ) => ExtractReturnTypeFromCallback<OriginalCallback>);
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

export class GridOptionsService extends BeanStub {
    beanName: BeanName = 'gos';

    private gridOptions: GridOptions;
    private eGridDiv: HTMLElement;
    private validationService: ValidationService;
    private environment: Environment;
    private api: GridApi;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.gridOptions = beans.gridOptions;
        this.eGridDiv = beans.eGridDiv;
        this.validationService = beans.validationService;
        this.environment = beans.environment;
        this.api = beans.gridApi;
    }

    // we store this locally, so we are not calling getScrollWidth() multiple times as it's an expensive operation
    private scrollbarWidth: number;
    private domDataKey = '__AG_' + Math.random().toString();

    // This is quicker then having code call gridOptionsService.get('context')
    private get gridOptionsContext() {
        return this.gridOptions['context'];
    }

    private propertyEventService: LocalEventService = new LocalEventService();

    public postConstruct(): void {
        const async = !this.get('suppressAsyncEvents');
        this.eventService.addGlobalListener(this.globalEventHandlerFactory().bind(this), async);
        this.eventService.addGlobalListener(this.globalEventHandlerFactory(true).bind(this), false);

        // Ensure the propertyEventService has framework overrides set so that it can fire events outside of angular
        this.propertyEventService.setFrameworkOverrides(this.frameworkOverrides);
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();

        this.addManagedListener(
            this.eventService,
            Events.EVENT_GRID_OPTIONS_CHANGED,
            ({ options }: GridOptionsChangedEvent) => {
                this.updateGridOptions({ options, force: true, source: 'gridOptionsUpdated' });
            }
        );
    }

    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    public get<K extends keyof GridOptions>(
        property: K
    ): K extends keyof typeof GRID_OPTION_DEFAULTS ? NonNullable<GridOptions[K]> : GridOptions[K] {
        return (
            this.gridOptions[property] ??
            (GRID_OPTION_DEFAULTS[property as keyof typeof GRID_OPTION_DEFAULTS] as GridOptions[K])
        );
    }

    /**
     * Get the GridOption callback but wrapped so that the common params of api and context are automatically applied to the params.
     * @param property GridOption callback properties based on the fact that this property has a callback with params extending AgGridCommon
     */
    public getCallback<K extends CallbackProps>(property: K): WrappedCallback<K, GridOptions[K]> {
        return this.mergeGridCommonParams(this.gridOptions[property]);
    }

    /**
     * Returns `true` if a value has been specified for this GridOption.
     * @param property GridOption property
     */
    public exists(property: keyof GridOptions): boolean {
        return _exists(this.gridOptions[property]);
    }

    private setupGridOptionListener<K extends keyof GridOptions>(
        event: keyof GridOptions,
        listener: PropertyValueChangedListener<K>
    ): () => null {
        this.gos.addPropertyEventListener(event, listener);
        const destroyFunc: () => null = () => {
            this.gos.removePropertyEventListener(event, listener);
            return null;
        };
        this.addDestroyFunc(destroyFunc);

        return destroyFunc;
    }

    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    public addManagedPropertyListener<K extends keyof GridOptions>(
        event: K,
        listener: PropertyValueChangedListener<K>
    ): () => null {
        if (!this.isAlive()) {
            return () => null;
        }

        return this.setupGridOptionListener(event, listener);
    }

    private propertyListenerId = 0;
    // Enable multiple grid properties to be updated together by the user but only trigger shared logic once.
    // Closely related to logic in ComponentUtil.ts
    private lastChangeSetIdLookup: Record<string, number> = {};
    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    public addManagedPropertyListeners(events: (keyof GridOptions)[], listener: PropertyChangedListener): void {
        if (!this.isAlive()) {
            return;
        }

        // Ensure each set of events can run for the same changeSetId
        const eventsKey = events.join('-') + this.propertyListenerId++;

        const wrappedListener = (event: PropertyValueChangedEvent<any>) => {
            if (event.changeSet) {
                // ChangeSet is only set when the property change is part of a group of changes from ComponentUtils
                // Direct api calls should always be run as
                if (event.changeSet && event.changeSet.id === this.lastChangeSetIdLookup[eventsKey]) {
                    // Already run the listener for this set of prop changes so don't run again
                    return;
                }
                this.lastChangeSetIdLookup[eventsKey] = event.changeSet.id;
            }
            // Don't expose the underlying event value changes to the group listener.
            const propertiesChangeEvent: PropertyChangedEvent = {
                type: 'gridPropertyChanged',
                changeSet: event.changeSet,
                source: event.source,
            };
            listener(propertiesChangeEvent);
        };

        events.forEach((event) => this.setupGridOptionListener(event, wrappedListener));
    }

    /**
     * Wrap the user callback and attach the api and context to the params object on the way through.
     * @param callback User provided callback
     * @returns Wrapped callback where the params object not require api and context
     */
    private mergeGridCommonParams<P extends AgGridCommon<any, any>, T>(
        callback: ((params: P) => T) | undefined
    ): ((params: WithoutGridCommon<P>) => T) | undefined {
        if (callback) {
            const wrapped = (callbackParams: WithoutGridCommon<P>): T => {
                const mergedParams = callbackParams as P;
                mergedParams.api = this.api;
                mergedParams.context = this.gridOptionsContext;

                return callback(mergedParams);
            };
            return wrapped;
        }
        return callback;
    }

    /**
     * Handles value coercion including validation of ranges etc. If value is invalid, undefined is set, allowing default to be used.
     */
    private static PROPERTY_COERCIONS: Map<keyof GridOptions, (value: any) => GridOptions[keyof GridOptions]> = new Map(
        [
            ...PropertyKeys.BOOLEAN_PROPERTIES.map((key) => [key as keyof GridOptions, GridOptionsService.toBoolean]),
            ...PropertyKeys.NUMBER_PROPERTIES.map((key) => [key as keyof GridOptions, GridOptionsService.toNumber]),
            ['groupAggFiltering', (val: any) => (typeof val === 'function' ? val : GridOptionsService.toBoolean(val))],
            ['pageSize', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['autoSizePadding', GridOptionsService.toConstrainedNum(0, Number.MAX_VALUE)],
            ['keepDetailRowsCount', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['rowBuffer', GridOptionsService.toConstrainedNum(0, Number.MAX_VALUE)],
            ['infiniteInitialRowCount', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['cacheOverflowSize', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['cacheBlockSize', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['serverSideInitialRowCount', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['viewportRowModelPageSize', GridOptionsService.toConstrainedNum(1, Number.MAX_VALUE)],
            ['viewportRowModelBufferSize', GridOptionsService.toConstrainedNum(0, Number.MAX_VALUE)],
        ] as [keyof GridOptions, (value: any) => GridOptions[keyof GridOptions]][]
    );

    private static toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // no value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        }

        return false;
    }

    private static toNumber(value: any): number | undefined {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const parsed = parseInt(value);
            if (isNaN(parsed)) {
                return undefined;
            }
            return parsed;
        }
        return undefined;
    }

    private static toConstrainedNum(min: number, max: number): (value: any) => number | undefined {
        return (value: any) => {
            const num = GridOptionsService.toNumber(value);
            if (num == null || num < min || num > max) {
                return undefined; // return undefined if outside bounds, this will then be coerced to the default value.
            }
            return num;
        };
    }

    private static getCoercedValue<K extends keyof GridOptions>(key: K, value: GridOptions[K]): GridOptions[K] {
        const coerceFunc = GridOptionsService.PROPERTY_COERCIONS.get(key);

        if (!coerceFunc) {
            return value;
        }

        return coerceFunc(value);
    }

    public static getCoercedGridOptions(gridOptions: GridOptions): GridOptions {
        const newGo: GridOptions = {};
        Object.entries(gridOptions).forEach(([key, value]: [keyof GridOptions, any]) => {
            const coercedValue = GridOptionsService.getCoercedValue(key, value);
            newGo[key] = coercedValue;
        });
        return newGo;
    }

    private static changeSetId = 0;
    public updateGridOptions({
        options,
        force,
        source = 'api',
    }: {
        options: Partial<GridOptions>;
        force?: boolean;
        source?: PropertyChangedSource;
    }): void {
        const changeSet: PropertyChangeSet = { id: GridOptionsService.changeSetId++, properties: [] };
        // all events are fired after grid options has finished updating.
        const events: PropertyValueChangedEvent<keyof GridOptions>[] = [];
        Object.entries(options).forEach(([key, value]) => {
            if (source === 'api' && (INITIAL_GRID_OPTION_KEYS as any)[key]) {
                _warnOnce(`${key} is an initial property and cannot be updated.`);
            }
            const coercedValue = GridOptionsService.getCoercedValue(key as keyof GridOptions, value);
            const shouldForce = force || (typeof coercedValue === 'object' && source === 'api'); // force objects as they could have been mutated.

            const previousValue = this.gridOptions[key as keyof GridOptions];
            if (shouldForce || previousValue !== coercedValue) {
                this.gridOptions[key as keyof GridOptions] = coercedValue;
                const event: PropertyValueChangedEvent<keyof GridOptions> = {
                    type: key as keyof GridOptions,
                    currentValue: coercedValue,
                    previousValue,
                    changeSet,
                    source,
                };
                events.push(event);
            }
        });

        this.validationService.processGridOptions(this.gridOptions);

        // changeSet should just include the properties that have changed.
        changeSet.properties = events.map((event) => event.type);

        events.forEach((event) => {
            if (this.gridOptions.debug) {
                console.log(
                    `AG Grid: Updated property ${event.type} from `,
                    event.previousValue,
                    ' to  ',
                    event.currentValue
                );
            }
            this.propertyEventService.dispatchEvent(event);
        });
    }

    addPropertyEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void {
        this.propertyEventService.addEventListener(key, listener as any);
    }
    removePropertyEventListener<K extends keyof GridOptions>(key: K, listener: PropertyValueChangedListener<K>): void {
        this.propertyEventService.removeEventListener(key, listener as any);
    }

    // responsible for calling the onXXX functions on gridOptions
    // It forces events defined in GridOptionsService.alwaysSyncGlobalEvents to be fired synchronously.
    // This is required for events such as GridPreDestroyed.
    // Other events can be fired asynchronously or synchronously depending on config.
    globalEventHandlerFactory = (restrictToSyncOnly?: boolean) => {
        return (eventName: string, event?: any) => {
            // prevent events from being fired _after_ the grid has been destroyed
            if (!this.isAlive()) {
                return;
            }

            const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventName);
            if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                return;
            }

            const eventHandlerName = ComponentUtil.getCallbackForEvent(eventName);
            const eventHandler = (this.gridOptions as any)[eventHandlerName];
            if (typeof eventHandler === 'function') {
                this.frameworkOverrides.wrapOutgoing(() => {
                    eventHandler(event);
                });
            }
        };
    };

    // *************** Helper methods ************************** //
    // Methods to share common GridOptions related logic that goes above accessing a single property

    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    public getScrollbarWidth() {
        if (this.scrollbarWidth == null) {
            const useGridOptions =
                typeof this.gridOptions.scrollbarWidth === 'number' && this.gridOptions.scrollbarWidth >= 0;
            const scrollbarWidth = useGridOptions ? this.gridOptions.scrollbarWidth : _getScrollbarWidth();

            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;

                this.eventService.dispatchEvent({
                    type: Events.EVENT_SCROLLBAR_WIDTH_CHANGED,
                });
            }
        }

        return this.scrollbarWidth;
    }

    public isRowModelType(rowModelType: RowModelType): boolean {
        return (
            this.gridOptions.rowModelType === rowModelType ||
            (rowModelType === 'clientSide' && _missing(this.gridOptions.rowModelType))
        );
    }

    public isDomLayout(domLayout: DomLayoutType) {
        const gridLayout = this.gridOptions.domLayout ?? 'normal';
        return gridLayout === domLayout;
    }

    public isRowSelection() {
        return this.gridOptions.rowSelection === 'single' || this.gridOptions.rowSelection === 'multiple';
    }

    public useAsyncEvents() {
        return !this.get('suppressAsyncEvents');
    }

    public isGetRowHeightFunction(): boolean {
        return typeof this.gridOptions.getRowHeight === 'function';
    }

    public getRowHeightForNode(
        rowNode: IRowNode,
        allowEstimate = false,
        defaultRowHeight?: number
    ): { height: number; estimated: boolean } {
        if (defaultRowHeight == null) {
            defaultRowHeight = this.environment.getDefaultRowHeight();
        }

        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.

        if (this.isGetRowHeightFunction()) {
            if (allowEstimate) {
                return { height: defaultRowHeight, estimated: true };
            }

            const params: WithoutGridCommon<RowHeightParams> = {
                node: rowNode,
                data: rowNode.data,
            };

            const height = this.getCallback('getRowHeight')!(params);

            if (this.isNumeric(height)) {
                if (height === 0) {
                    _warnOnce(
                        'The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.'
                    );
                }
                return { height: Math.max(1, height), estimated: false };
            }
        }

        if (rowNode.detail && this.get('masterDetail')) {
            return this.getMasterDetailRowHeight();
        }

        const rowHeight =
            this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight)
                ? this.gridOptions.rowHeight
                : defaultRowHeight;

        return { height: rowHeight, estimated: false };
    }

    private getMasterDetailRowHeight(): { height: number; estimated: boolean } {
        // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
        // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
        // (due to auto height) which looks bad, especially if doing row animation.
        if (this.get('detailRowAutoHeight')) {
            return { height: 1, estimated: false };
        }

        if (this.isNumeric(this.gridOptions.detailRowHeight)) {
            return { height: this.gridOptions.detailRowHeight, estimated: false };
        }

        return { height: 300, estimated: false };
    }

    // we don't allow dynamic row height for virtual paging
    public getRowHeightAsNumber(): number {
        if (!this.gridOptions.rowHeight || _missing(this.gridOptions.rowHeight)) {
            return this.environment.getDefaultRowHeight();
        }

        const rowHeight = this.environment.refreshRowHeightVariable();

        if (rowHeight !== -1) {
            return rowHeight;
        }

        console.warn('AG Grid row height must be a number if not using standard row model');
        return this.environment.getDefaultRowHeight();
    }

    private isNumeric(value: any): value is number {
        return !isNaN(value) && typeof value === 'number' && isFinite(value);
    }

    public getDomDataKey(): string {
        return this.domDataKey;
    }

    // returns the dom data, or undefined if not found
    public getDomData(element: Node | null, key: string): any {
        const domData = (element as any)[this.getDomDataKey()];

        return domData ? domData[key] : undefined;
    }

    public setDomData(element: Element, key: string, value: any): any {
        const domDataKey = this.getDomDataKey();
        let domData = (element as any)[domDataKey];

        if (_missing(domData)) {
            domData = {};
            (element as any)[domDataKey] = domData;
        }
        domData[key] = value;
    }

    public getDocument(): Document {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        let result: Document | null = null;
        if (this.gridOptions.getDocument && _exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        } else if (this.eGridDiv) {
            result = this.eGridDiv.ownerDocument;
        }

        if (result && _exists(result)) {
            return result;
        }

        return document;
    }

    public getWindow() {
        const eDocument = this.getDocument();
        return eDocument.defaultView || window;
    }

    public getRootNode(): Document | ShadowRoot {
        return this.eGridDiv.getRootNode() as Document | ShadowRoot;
    }

    public getActiveDomElement(): Element | null {
        return this.getRootNode().activeElement;
    }

    public getAsyncTransactionWaitMillis(): number | undefined {
        return _exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : 50;
    }

    public isAnimateRows() {
        // never allow animating if enforcing the row order
        if (this.get('ensureDomOrder')) {
            return false;
        }

        return this.get('animateRows');
    }

    public isGroupRowsSticky(): boolean {
        if (this.get('paginateChildRows') || this.get('groupHideOpenParents') || this.isDomLayout('print')) {
            return false;
        }

        return true;
    }

    public isColumnsSortingCoupledToGroup(): boolean {
        const autoGroupColumnDef = this.gridOptions.autoGroupColumnDef;
        return !autoGroupColumnDef?.comparator && !this.get('treeData');
    }

    public getGroupAggFiltering(): ((params: WithoutGridCommon<GetGroupAggFilteringParams>) => boolean) | undefined {
        const userValue = this.gridOptions.groupAggFiltering;

        if (typeof userValue === 'function') {
            return this.getCallback('groupAggFiltering' as any) as any;
        }

        if (userValue === true) {
            return () => true;
        }

        return undefined;
    }

    public getGrandTotalRow(): 'top' | 'bottom' | undefined {
        const userValue = this.gridOptions.grandTotalRow;
        if (userValue) {
            return userValue;
        }

        const legacyValue = this.gridOptions.groupIncludeTotalFooter;
        if (legacyValue) {
            return 'bottom';
        }
        return undefined;
    }

    public getGroupTotalRowCallback(): (
        params: WithoutGridCommon<GetGroupIncludeFooterParams>
    ) => 'top' | 'bottom' | undefined {
        const userValue = this.get('groupTotalRow');

        if (typeof userValue === 'function') {
            return this.getCallback('groupTotalRow' as any) as any;
        }

        if (userValue) {
            return () => userValue;
        }

        const legacyValue = this.get('groupIncludeFooter');
        if (typeof legacyValue === 'function') {
            const legacyCallback = this.getCallback('groupIncludeFooter' as any) as any;
            return (p: GetGroupIncludeFooterParams) => {
                return legacyCallback(p) ? 'bottom' : undefined;
            };
        }
        return () => (legacyValue ? 'bottom' : undefined);
    }

    public isGroupMultiAutoColumn() {
        if (this.gridOptions.groupDisplayType) {
            return this.gridOptions.groupDisplayType === 'multipleColumns';
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return this.get('groupHideOpenParents');
    }

    public isGroupUseEntireRow(pivotMode: boolean): boolean {
        // we never allow groupDisplayType = 'groupRows' if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) {
            return false;
        }

        return this.gridOptions.groupDisplayType === 'groupRows';
    }

    public getGridCommonParams<TData = any, TContext = any>(): AgGridCommon<TData, TContext> {
        return {
            api: this.api,
            context: this.gridOptionsContext,
        };
    }

    public addGridCommonParams<T extends AgGridCommon<TData, TContext>, TData = any, TContext = any>(
        params: WithoutGridCommon<T>
    ): T {
        const updatedParams = params as T;
        updatedParams.api = this.api;
        updatedParams.context = this.gridOptionsContext;
        return updatedParams;
    }
}
