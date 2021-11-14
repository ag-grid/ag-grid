import { BeanStub } from "../../context/beanStub";
import { IComponent } from "../../interfaces/iComponent";
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface RegisteredComponent {
    component: any;
    componentFromFramework: boolean;
}
export interface DeprecatedComponentName {
    propertyHolder: string;
    newComponentName: string;
}
export declare class UserComponentRegistry extends BeanStub {
    private gridOptions;
    private agGridDefaults;
    private agDeprecatedNames;
    private jsComponents;
    private frameworkComponents;
    private init;
    registerDefaultComponent(rawName: string, component: any): void;
    registerComponent(rawName: string, component: any): void;
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    registerFwComponent<A extends IComponent<any> & B, B>(rawName: string, component: {
        new (): IComponent<B>;
    }): void;
    retrieve(rawName: string): {
        componentFromFramework: boolean;
        component: any;
    } | null;
    private translateIfDeprecated;
}
