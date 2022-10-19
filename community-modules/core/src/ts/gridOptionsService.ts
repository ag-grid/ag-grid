import { Autowired, Bean } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { isTrue } from "./gridOptionsWrapper";
import { AnyGridOptions } from "./propertyKeys";


type GridOptionKey = keyof GridOptions;

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

type OnlyBooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>

@Bean('gridOptionsService')
export class GridOptionsService {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    get<K extends keyof GridOptions>(property: K): GridOptions[K] {
        return this.gridOptions[property];
    }

    is(property: OnlyBooleanProps): boolean {
        return isTrue(this.gridOptions[property]);
    }

}

const c = new GridOptionsService();

c.is('sideBar') // probably dont want these included to force this business logic to be handle in the modules and not in this service.
c.is('accentedSort')