import { BeanStub } from "../../context/beanStub";
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
    private readonly agComponentUtils;
    private agGridDefaults;
    private agDeprecatedNames;
    private jsComps;
    private fwComps;
    private init;
    registerDefaultComponent(rawName: string, component: any): void;
    private registerJsComponent;
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    private registerFwComponent;
    retrieve(rawName: string): {
        componentFromFramework: boolean;
        component: any;
    } | null;
    private translateIfDeprecated;
}
