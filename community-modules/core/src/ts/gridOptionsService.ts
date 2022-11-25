import { ComponentUtil } from "./components/componentUtil";
import { Autowired, Bean, PostConstruct } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { AgEvent } from "./events";
import { EventService } from "./eventService";
import { AgGridCommon, WithoutGridCommon } from "./interfaces/iCommon";
import { AnyGridOptions } from "./propertyKeys";
import { doOnce } from "./utils/function";

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
    private propertyEventService: EventService = new EventService();
    private gridOptionLookup: Set<string>;

    @PostConstruct
    public init(): void {
        this.gridOptionLookup = new Set([...ComponentUtil.ALL_PROPERTIES, ...ComponentUtil.getEventCallbacks()]);
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
}