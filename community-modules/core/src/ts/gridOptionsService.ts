import { ComponentUtil } from "./components/componentUtil";
import { Autowired, Bean } from "./context/context";
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

export type PropertyChangedListener = (event?: PropertyChangedEvent) => void

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
    private coercionLookup: Record<keyof GridOptions, 'number' | 'boolean' | 'none'>;

    private agWire(): void {
        [
            ...ComponentUtil.ARRAY_PROPERTIES,
            ...ComponentUtil.OBJECT_PROPERTIES,
            ...ComponentUtil.STRING_PROPERTIES,
            ...ComponentUtil.getEventCallbacks(),
        ]
            .forEach((key: keyof GridOptions) => this.coercionLookup[key] = 'none');
        ComponentUtil.BOOLEAN_PROPERTIES
            .forEach(key => this.coercionLookup[key] = 'boolean');
        ComponentUtil.NUMBER_PROPERTIES
            .forEach(key => this.coercionLookup[key] = 'number');
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
    public mergeGridCommonParams<P extends AgGridCommon<any>, T>(callback: ((params: P) => T) | undefined):
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


    public set<K extends keyof GridOptions>(key: K, value: GridOptions[K], force = false): void {
        const previousValue = this.gridOptions[key];

        const coercionStep = this.coercionLookup[key];

        if (coercionStep) {
            let newValue = value;
            switch (coercionStep) {
                case 'number':
                    // local toNumber is using parseInt whereas the ComponentUtils version using Number() which can behave differently.  
                    // GridOptionsWrapper used the local toNumber so was different to ComponentUtils
                    newValue = ComponentUtil.toNumber(value);
                case 'boolean':
                    // This toBoolean converts empty string '' to true to handle component attributes. 
                    // We might not want that within this function???
                    // However, using the same means that we will get consistent change detection in the following diff
                    // because we are using the same coercion as applied when copy attributes to gridOptions in setup.
                    newValue = ComponentUtil.toBoolean(value);
            }


            if (force || previousValue !== value) {
                this.gridOptions[key] = value;
                const event: PropertyChangedEvent = {
                    type: key,
                    currentValue: value,
                    previousValue: previousValue
                };
                this.propertyEventService.dispatchEvent(event);
            }

        } else {
            doOnce(() => {
                console.warn(`You tried to set the property "${key}" on GridOptions but this is not a valid property name.`)
            }, key)
        }

    }

    addEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.addEventListener(key, listener);
    }
    removeEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.removeEventListener(key, listener);
    }
}