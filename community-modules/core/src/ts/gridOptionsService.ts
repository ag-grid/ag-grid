import { ColumnApi } from "./columns/columnApi";
import { ComponentUtil } from "./components/componentUtil";
import { Autowired, Bean, PostConstruct, PreDestroy, Qualifier } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { AgEvent } from "./events";
import { EventService } from "./eventService";
import { GridApi } from "./gridApi";
import { AgGridCommon, WithoutGridCommon } from "./interfaces/iCommon";
import { AnyGridOptions } from "./propertyKeys";

type GetKeys<T, U> = {
    [K in keyof T]: T[K] extends U | undefined ? K : never
}[keyof T];

/**
 * Get all the GridOptions properties of the provided type.
 * Will also include `any` properties. 
 */
export type KeysLike<U> = Exclude<GetKeys<GridOptions, U>, undefined>;
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
export type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;

type BooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>;
type NumberProps = Exclude<KeysOfType<number>, AnyGridOptions>;
type NoArgFuncs = KeysOfType<() => any>;
type AnyArgFuncs = KeysOfType<(arg: 'NO_MATCH') => any>;
type CallbackProps = Exclude<KeysOfType<(params: AgGridCommon<any>) => any>, NoArgFuncs | AnyArgFuncs>;
type NonPrimitiveProps = Exclude<keyof GridOptions, BooleanProps | NumberProps | CallbackProps>;


type ExtractParamsFromCallback<TCallback> = TCallback extends (params: infer PA) => any ? PA : never;
type ExtractReturnTypeFromCallback<TCallback> = TCallback extends (params: AgGridCommon<any>) => infer RT ? RT : never;
type WrappedCallback<K extends CallbackProps, OriginalCallback extends GridOptions[K]> = undefined | ((params: WithoutGridCommon<ExtractParamsFromCallback<OriginalCallback>>) => ExtractReturnTypeFromCallback<OriginalCallback>)
export interface PropertyChangedEvent extends AgEvent {
    type: keyof GridOptions,
    currentValue: any;
    previousValue: any;
}

export type PropertyChangedListener = (event: PropertyChangedEvent) => void

export function toNumber(value: any): number | undefined {
    if (typeof value == 'number') {
        return value;
    }

    if (typeof value == 'string') {
        return parseInt(value, 10);
    }
}

export function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

@Bean('gridOptionsService')
export class GridOptionsService {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('eventService') private readonly eventService: EventService;

    private destroyed = false;

    private propertyEventService: EventService = new EventService();
    private gridOptionLookup: Set<string>;

    private agWire(@Qualifier('gridApi') gridApi: GridApi, @Qualifier('columnApi') columnApi: ColumnApi): void {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
    }

    @PostConstruct
    public init(): void {
        this.gridOptionLookup = new Set([...ComponentUtil.ALL_PROPERTIES, ...ComponentUtil.EVENT_CALLBACKS]);
        const async = !this.is('suppressAsyncEvents');
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);

    }
    @PreDestroy
    private destroy(): void {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;

        this.destroyed = true;
    }

    public is(property: BooleanProps): boolean {
        return isTrue(this.gridOptions[property]);
    }

    public get<K extends NonPrimitiveProps>(property: K): GridOptions[K] {
        return this.gridOptions[property];
    }

    public getNum<K extends NumberProps>(property: K): number | undefined {
        return toNumber(this.gridOptions[property]);
    }

    public getCallback<K extends CallbackProps>(property: K): WrappedCallback<K, GridOptions[K]> {
        return this.mergeGridCommonParams(this.gridOptions[property]);
    }
    /**
    * Wrap the user callback and attach the api, columnApi and context to the params object on the way through.
    * @param callback User provided callback
    * @returns Wrapped callback where the params object not require api, columnApi and context
    */
    private mergeGridCommonParams<P extends AgGridCommon<any>, T>(callback: ((params: P) => T) | undefined):
        ((params: WithoutGridCommon<P>) => T) | undefined {
        if (callback) {
            const wrapped = (callbackParams: WithoutGridCommon<P>): T => {
                const mergedParams = { ...callbackParams, api: this.gridOptions.api!, columnApi: this.gridOptions.columnApi!, context: this.gridOptions.context } as P;
                return callback(mergedParams);
            };
            return wrapped;
        }
        return callback;
    }

    public set<K extends keyof GridOptions>(key: K, newValue: GridOptions[K], force = false, eventParams: object = {}): void {
        if (this.gridOptionLookup.has(key)) {
            const previousValue = this.gridOptions[key];
            if (force || previousValue !== newValue) {
                this.gridOptions[key] = newValue;
                const event: PropertyChangedEvent = {
                    type: key,
                    currentValue: newValue,
                    previousValue: previousValue,
                    ...eventParams
                };
                this.propertyEventService.dispatchEvent(event);
            }
        }
    }

    addEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.addEventListener(key, listener);
    }
    removeEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.removeEventListener(key, listener);
    }

    // responsible for calling the onXXX functions on gridOptions
    globalEventHandler(eventName: string, event?: any): void {
        // prevent events from being fired _after_ the grid has been destroyed
        if (this.destroyed) {
            return;
        }

        const callbackMethodName = ComponentUtil.getCallbackForEvent(eventName);
        if (typeof (this.gridOptions as any)[callbackMethodName] === 'function') {
            (this.gridOptions as any)[callbackMethodName](event);
        }
    }
}