// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptions } from "../../entities/gridOptions";
import { IAfterGuiAttachedParams, IComponent } from "../../interfaces/iComponent";
import { ColDef, ColGroupDef } from "../../entities/colDef";
import { AgGridRegisteredComponentInput } from "./componentProvider";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
export declare type ComponentHolder = GridOptions | ColDef | ColGroupDef | ISetFilterParams;
export declare type AgComponentPropertyInput<A extends IComponent<any, IAfterGuiAttachedParams>> = AgGridRegisteredComponentInput<A> | string;
export declare enum ComponentType {
    AG_GRID = 0,
    FRAMEWORK = 1,
}
export declare enum ComponentSource {
    DEFAULT = 0,
    REGISTERED_BY_NAME = 1,
    HARDCODED = 2,
}
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ResolvedComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> {
    component: {
        new (): A;
    } | {
        new (): B;
    };
    type: ComponentType;
    source: ComponentSource;
}
export declare class ComponentResolver {
    private gridOptions;
    private gridOptionsWrapper;
    private context;
    private namedComponentResolver;
    private agComponentUtils;
    private componentMetadataProvider;
    private frameworkComponentWrapper;
    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy for different reasons, for example if you want to check if a component has a particular
     * method implemented without having to create the component, just by inspecting the source component
     *
     * It takes
     *  @param holder: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param componentNameOpt: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     */
    getComponentToUse<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(holder: ComponentHolder, propertyName: string, componentNameOpt?: string): ResolvedComponent<A, B>;
    /**
     * Useful to check what would be the resultant params for a given object
     *  @param holder: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {any} It merges the user agGridParams with the actual params specified by the user.
     */
    mergeParams(holder: ComponentHolder, propertyName: string, agGridParams: any): any;
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param holderOpt: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param componentNameOpt: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     */
    createAgGridComponent<A extends IComponent<any, IAfterGuiAttachedParams>>(holderOpt: ComponentHolder, agGridParams: any, propertyName: string, componentNameOpt?: string, mandatory?: boolean): A;
    private newAgGridComponent<A, B>(holder, propertyName, componentName, mandatory?);
}
