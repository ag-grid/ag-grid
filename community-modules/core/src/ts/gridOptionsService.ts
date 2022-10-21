import { Autowired, Bean } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { AgEvent } from "./events";
import { EventService } from "./eventService";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
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

type OnlyBooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>;
type OnlyNumberProps = Exclude<KeysOfType<number>, AnyGridOptions>;
type NonPrimitiveProps = Exclude<keyof GridOptions, OnlyBooleanProps | OnlyNumberProps>;

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

    public get<K extends NonPrimitiveProps>(property: K): GridOptions[K] {
        return this.gridOptions[property];
    }

    public getNum<K extends OnlyNumberProps>(property: K, defaultValue?: number): GridOptions[K] {
        return toNumber(this.gridOptions[property]) || defaultValue;
    }

    private isOverrides: Partial<Record<OnlyBooleanProps, () => boolean>> = {
        'embedFullWidthRows': () => {
            return isTrue(this.gridOptions.embedFullWidthRows) || isTrue(this.gridOptions.deprecatedEmbedFullWidthRows);
        },
        'animateRows': () => {
            // never allow animating if enforcing the row order
            return !isTrue(this.gridOptions.ensureDomOrder) && isTrue(this.gridOptions.animateRows);
        },
        'masterDetail': () => {
            // The module assertion should be part of Validation really not here?
            return isTrue(this.gridOptions.masterDetail) && ModuleRegistry.assertRegistered(ModuleNames.MasterDetailModule, 'masterDetail');
        }
    }

    public is(property: OnlyBooleanProps): boolean {

        // TODO
        // -- assertion of modules registered based on properties NO - should be part of validation
        // -- cross referenced properties

        // Do we need to think about performance of adding a lookup into every is method when before
        // it was just a direct call to the property.
        const overrideIsFunc = this.isOverrides[property];
        if (overrideIsFunc !== undefined) {
            return overrideIsFunc();
        }

        return isTrue(this.gridOptions[property]);
    }

    public set<K extends keyof GridOptions>(key: K, value: GridOptions[K], force = false): void {
        const previousValue = this.gridOptions[key];

        if (force || previousValue !== value) {
            this.gridOptions[key] = value;
            const event: PropertyChangedEvent = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event);
        }
    }

    addEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.addEventListener(key, listener);
    }
    removeEventListener(key: keyof GridOptions, listener: PropertyChangedListener): void {
        this.propertyEventService.removeEventListener(key, listener);
    }
}