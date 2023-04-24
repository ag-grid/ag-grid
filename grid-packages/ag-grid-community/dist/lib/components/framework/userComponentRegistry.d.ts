import { BeanStub } from "../../context/beanStub";
export declare class UserComponentRegistry extends BeanStub {
    private gridOptions;
    private agGridDefaults;
    /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
    private enterpriseAgDefaultCompsModule;
    private deprecatedAgGridDefaults;
    private jsComps;
    private fwComps;
    private init;
    registerDefaultComponent(name: string, component: any): void;
    private registerJsComponent;
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    private registerFwComponent;
    retrieve(propertyName: string, name: string): {
        componentFromFramework: boolean;
        component: any;
    } | null;
    private warnAboutMissingComponent;
}
