import { Autowired, Bean } from "./context/context";
import { GridOptions } from "./entities/gridOptions";
import { AnyGridOptions, KeysOfType } from "./propertyKeys";

type Filter<T> = Exclude<{
    [P in keyof T]: T[P] extends boolean | undefined ? P : never
}[keyof T], undefined>

type OnlyBooleanProps = Exclude<KeysOfType<boolean>, AnyGridOptions>

@Bean('gridOptionsService')
export class GridOptionsService {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    get<K extends keyof GridOptions>(property: K): GridOptions[K] {
        return this.gridOptions[property];
    }

    is(property: OnlyBooleanProps): boolean {
        return this.gridOptions[property];
    }

}

const c = new GridOptionsService();

c.is('sideBar') // probably dont want these included to force this business logic to be handle in the modules and not in this service.