import { Autowired, Bean } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { EventService } from "./eventService";
import { isTrue, PropertyChangedEvent } from "./gridOptionsWrapper";
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
type NonBooleanProps = Exclude<keyof GridOptions, OnlyBooleanProps>;

@Bean('gridOptionsService')
export class GridOptionsService {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    private propertyEventService: EventService = new EventService();

    public get<K extends NonBooleanProps>(property: K): GridOptions[K] {
        return this.gridOptions[property];
    }

    public is(property: OnlyBooleanProps): boolean {
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

    addPropertyChangeListener(key: keyof GridOptions, listener: EventListener): void {
        this.propertyEventService.addEventListener(key, listener);
    }
    removePropertyChangeListener(key: keyof GridOptions, listener: EventListener): void {
        this.propertyEventService.removeEventListener(key, listener);
    }
}