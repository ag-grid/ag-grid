// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IAfterGuiAttachedParams, IComponent } from "../../interfaces/iComponent";
import { ComponentType } from "./componentResolver";
export declare enum RegisteredComponentSource {
    DEFAULT = 0,
    REGISTERED = 1,
}
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface RegisteredComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> {
    component: RegisteredComponentInput<A, B>;
    type: ComponentType;
    source: RegisteredComponentSource;
}
export declare type RegisteredComponentInput<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> = AgGridRegisteredComponentInput<A> | {
    new (): B;
};
export declare type AgGridRegisteredComponentInput<A extends IComponent<any, IAfterGuiAttachedParams>> = AgGridComponentFunctionInput | {
    new (): A;
};
export declare type AgGridComponentFunctionInput = (params: any) => string | HTMLElement;
export declare class ComponentProvider {
    private agGridDefaults;
    private jsComponents;
    private frameworkComponents;
    postConstruct(): void;
    registerComponent<A extends IComponent<any, IAfterGuiAttachedParams>>(name: string, component: AgGridRegisteredComponentInput<A>): void;
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    registerFwComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(name: string, component: {
        new (): IComponent<B, IAfterGuiAttachedParams>;
    }): void;
    /**
     * B the business interface (ie IHeader)
     * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
     */
    retrieve<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(name: string): RegisteredComponent<A, B>;
}
