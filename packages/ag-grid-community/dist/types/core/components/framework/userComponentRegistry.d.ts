import { BeanStub } from "../../context/beanStub";
export declare class UserComponentRegistry extends BeanStub {
    private agGridDefaults;
    /** Used to provide useful error messages if a user is trying to use an enterprise component without loading the module. */
    private enterpriseAgDefaultCompsModule;
    private jsComps;
    private init;
    registerDefaultComponent(name: string, component: any): void;
    private registerJsComponent;
    retrieve(propertyName: string, name: string): {
        componentFromFramework: boolean;
        component: any;
    } | null;
    private warnAboutMissingComponent;
}
