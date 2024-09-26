import type { GridApi } from './api/gridApi';
import { ComponentUtil } from './components/componentUtil';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { GridOptions } from './entities/gridOptions';
import type { Environment } from './environment';
import type { AgEventType } from './eventTypes';
import type { AgEvent } from './events';
import { ALWAYS_SYNC_GLOBAL_EVENTS } from './events';
import type { GridOptionOrDefault } from './gridOptionsDefaults';
import { GRID_OPTION_DEFAULTS } from './gridOptionsDefaults';
import type { AgGridCommon, WithoutGridCommon } from './interfaces/iCommon';
import { LocalEventService } from './localEventService';
import type { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import type { AnyGridOptions } from './propertyKeys';
import { INITIAL_GRID_OPTION_KEYS, PropertyKeys } from './propertyKeys';
import { _log, _warnOnce } from './utils/function';
import { _exists, toBoolean } from './utils/generic';
import { toConstrainedNum, toNumber } from './utils/number';
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

export type ExtractParamsFromCallback<TCallback> = TCallback extends (params: infer PA) => any ? PA : never;
export type ExtractReturnTypeFromCallback<TCallback> = TCallback extends (params: AgGridCommon<any, any>) => infer RT
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

/**
 * Handles value coercion including validation of ranges etc. If value is invalid, undefined is set, allowing default to be used.
 */
const PROPERTY_COERCIONS: Map<keyof GridOptions, (value: any) => GridOptions[keyof GridOptions]> = new Map([
    ...PropertyKeys.BOOLEAN_PROPERTIES.map((key) => [key as keyof GridOptions, toBoolean]),
    ...PropertyKeys.NUMBER_PROPERTIES.map((key) => [key as keyof GridOptions, toNumber]),
    ['groupAggFiltering', (val: any) => (typeof val === 'function' ? val : toBoolean(val))],
    ['pageSize', toConstrainedNum(1)],
    ['autoSizePadding', toConstrainedNum(0)],
    ['keepDetailRowsCount', toConstrainedNum(1)],
    ['rowBuffer', toConstrainedNum(0)],
    ['infiniteInitialRowCount', toConstrainedNum(1)],
    ['cacheOverflowSize', toConstrainedNum(1)],
    ['cacheBlockSize', toConstrainedNum(1)],
    ['serverSideInitialRowCount', toConstrainedNum(1)],
    ['viewportRowModelPageSize', toConstrainedNum(1)],
    ['viewportRowModelBufferSize', toConstrainedNum(0)],
] as [keyof GridOptions, (value: any) => GridOptions[keyof GridOptions]][]);

function getCoercedValue<K extends keyof GridOptions>(key: K, value: GridOptions[K]): GridOptions[K] {
    const coerceFunc = PROPERTY_COERCIONS.get(key);

    if (!coerceFunc) {
        return value;
    }

    return coerceFunc(value);
}

export function getCoercedGridOptions(gridOptions: GridOptions): GridOptions {
    const newGo: GridOptions = {};
    Object.entries(gridOptions).forEach(([key, value]: [keyof GridOptions, any]) => {
        const coercedValue = getCoercedValue(key, value);
        newGo[key] = coercedValue;
    });
    return newGo;
}

export class GridOptionsService extends BeanStub implements NamedBean {
    beanName = 'gos' as const;

    private gridOptions: GridOptions;
    public eGridDiv: HTMLElement;
    private validationService?: ValidationService;
    public environment: Environment;
    private api: GridApi;
    private gridId: string;

    public wireBeans(beans: BeanCollection): void {
        this.gridOptions = beans.gridOptions;
        this.eGridDiv = beans.eGridDiv;
        this.validationService = beans.validationService;
        this.environment = beans.environment;
        this.api = beans.gridApi;
        this.gridId = beans.context.getGridId();
    }
    private domDataKey = '__AG_' + Math.random().toString();

    // This is quicker then having code call gridOptionsService.get('context')
    private get gridOptionsContext() {
        return this.gridOptions['context'];
    }

    private propertyEventService: LocalEventService<keyof GridOptions> = new LocalEventService();

    public postConstruct(): void {
        const async = !this.get('suppressAsyncEvents');
        this.eventService.addGlobalListener(this.globalEventHandlerFactory().bind(this), async);
        this.eventService.addGlobalListener(this.globalEventHandlerFactory(true).bind(this), false);

        // Ensure the propertyEventService has framework overrides set so that it can fire events outside of angular
        this.propertyEventService.setFrameworkOverrides(this.frameworkOverrides);

        this.addManagedEventListeners({
            gridOptionsChanged: ({ options }) => {
                this.updateGridOptions({ options, force: true, source: 'gridOptionsUpdated' });
            },
        });
    }

    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    public get<K extends keyof GridOptions>(property: K): GridOptionOrDefault<K> {
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
            const coercedValue = getCoercedValue(key as keyof GridOptions, value);
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

        this.validationService?.processGridOptions(this.gridOptions);

        // changeSet should just include the properties that have changed.
        changeSet.properties = events.map((event) => event.type);

        events.forEach((event) => {
            if (this.gridOptions.debug) {
                _log(`Updated property ${event.type} from`, event.previousValue, ` to `, event.currentValue);
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
        return (eventName: AgEventType, event?: any) => {
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

    public getDomDataKey(): string {
        return this.domDataKey;
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

    public assertModuleRegistered(moduleName: ModuleNames, reason: string): boolean {
        return ModuleRegistry.__assertRegistered(moduleName, reason, this.gridId);
    }

    public isModuleRegistered(moduleName: ModuleNames): boolean {
        return ModuleRegistry.__isRegistered(moduleName, this.gridId);
    }
}
