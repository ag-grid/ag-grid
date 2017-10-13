import {Autowired, Bean, Context, Optional} from "../../context/context";
import {GridOptions} from "../../entities/gridOptions";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FrameworkComponentWrapper} from "./frameworkComponentWrapper";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
import {ColDef, ColGroupDef} from "../../entities/colDef";
import {_} from "../../utils";
import {NamedComponentResolver} from "./namedComponentResolver";
import {AgGridComponentFunctionInput, AgGridRegisteredComponentInput} from "./componentProvider";
import {AgComponentUtils} from "./agComponentUtils";
import {ComponentMetadata, ComponentMetadataProvider} from "./componentMetadataProvider";
import {ISetFilterParams} from "../../interfaces/iSetFilterParams";

export type ComponentHolder = GridOptions | ColDef | ColGroupDef | ISetFilterParams;

export type AgComponentPropertyInput<A extends IComponent<any, IAfterGuiAttachedParams>> = AgGridRegisteredComponentInput<A> | string;

export enum ComponentType {
    AG_GRID, FRAMEWORK
}

export enum ComponentSource {
    DEFAULT, REGISTERED_BY_NAME, HARDCODED
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ResolvedComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> {
    component:{new(): A}|{new(): B},
    type:ComponentType,
    source:ComponentSource
}

@Bean('componentResolver')
export class ComponentResolver {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired("context")
    private context: Context;

    @Autowired("namedComponentResolver")
    private namedComponentResolver: NamedComponentResolver;

    @Autowired ("agComponentUtils")
    private agComponentUtils: AgComponentUtils;

    @Autowired ("componentMetadataProvider")
    private componentMetadataProvider: ComponentMetadataProvider;



    @Optional ("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;


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
    public getComponentToUse<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        componentNameOpt?:string
    ):ResolvedComponent<A, B>{
        let componentName:string = componentNameOpt == null ? propertyName : componentNameOpt;

        /**
         * There are five things that can happen when resolving a component.
         *  a) HardcodedFwComponent: That holder[propertyName]Framework has associated a Framework native component
         *  b) HardcodedJsComponent: That holder[propertyName] has associate a JS component
         *  c) hardcodedJsFunction: That holder[propertyName] has associate a JS function
         *  d) hardcodedNameComponent: That holder[propertyName] has associate a string that represents a component to load
         *  e) That none of the three previous are specified, then we need to use the DefaultRegisteredComponent
         */
        let hardcodedNameComponent : string = null;
        let HardcodedJsComponent : {new(): A} = null;
        let hardcodedJsFunction : AgGridComponentFunctionInput = null;
        let HardcodedFwComponent : {new(): B} = null;

        if (holder != null){
            let componentPropertyValue : AgComponentPropertyInput<IComponent<any, IAfterGuiAttachedParams>> = (<any>holder)[propertyName];
            if (componentPropertyValue != null){
                if (typeof componentPropertyValue === 'string'){
                    hardcodedNameComponent = componentPropertyValue;
                } else if (this.agComponentUtils.doesImplementIComponent(componentPropertyValue)){
                    HardcodedJsComponent = <{new(): A}>componentPropertyValue;
                } else {
                    hardcodedJsFunction = <AgGridComponentFunctionInput>componentPropertyValue;
                }
            }
            HardcodedFwComponent = (<any>holder)[propertyName + "Framework"];
        }

        /**
         * Since we allow many types of flavors for specifying the components, let's make sure this is not an illegal
         * combination
         */

        if (
            (HardcodedJsComponent && HardcodedFwComponent) ||
            (hardcodedNameComponent && HardcodedFwComponent) ||
            (hardcodedJsFunction && HardcodedFwComponent)
        ){
            throw Error("You are trying to specify: " + propertyName + " twice as a component.")
        }

        if (HardcodedFwComponent && !this.frameworkComponentWrapper){
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName)
        }


        /**
         * At this stage we are guaranteed to either have,
         * DEPRECATED
         * - A unique HardcodedFwComponent
         * - A unique HardcodedJsComponent
         * - A unique hardcodedJsFunction
         * BY NAME- FAVOURED APPROACH
         * - A unique hardcodedNameComponent
         * - None of the previous, hence we revert to: RegisteredComponent
         */
        if (HardcodedFwComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedFwComponent}`);
            return {
                type: ComponentType.FRAMEWORK,
                component: HardcodedFwComponent,
                source: ComponentSource.HARDCODED
            }
        }

        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                type: ComponentType.AG_GRID,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED
            }
        }

        if (hardcodedJsFunction){
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return <ResolvedComponent<A,B>>this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, ComponentType.AG_GRID, ComponentSource.HARDCODED);
        }


        //^^^^^ABOVE DEPRECATED
        let componentNameToUse: string;
        if (hardcodedNameComponent){
            componentNameToUse = hardcodedNameComponent;
        } else{
            componentNameToUse = componentName;
        }

        return <ResolvedComponent<A,B>>this.namedComponentResolver.resolve(propertyName, componentNameToUse);
    }

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
    public mergeParams(
        holder: ComponentHolder,
        propertyName: string,
        agGridParams: any
    ):any{
        let customParams: any = holder ? (<any>holder)[propertyName + "Params"] : null;
        let finalParams: any = {};

        _.mergeDeep(finalParams, agGridParams);
        _.mergeDeep(finalParams, customParams);
        if (!finalParams.api){
            finalParams.api = this.gridOptions.api;
        }
        return finalParams;
    }


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
    public createAgGridComponent<A extends IComponent<any, IAfterGuiAttachedParams>> (
        holderOpt:ComponentHolder,
        agGridParams:any,
        propertyName:string,
        componentNameOpt?:string,
        mandatory:boolean = true
    ): A{
        let holder:ComponentHolder = holderOpt == null ? this.gridOptions : holderOpt;
        let componentName:string = componentNameOpt == null ? propertyName : componentNameOpt;

        //Create the component instance
        let component: A = <A>this.newAgGridComponent(holder, propertyName, componentName, mandatory);
        if (!component) return null;

        //Wire the component and call the init mehtod with the correct params
        let finalParams = this.mergeParams(holder, propertyName, agGridParams);
        this.context.wireBean(component);
        component.init(finalParams);

        return component;
    }

    private newAgGridComponent<A extends IComponent<any, IAfterGuiAttachedParams> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        componentName:string,
        mandatory:boolean = true
    ): A{
        let componentToUse:ResolvedComponent<A,B> = <ResolvedComponent<A,B>>this.getComponentToUse(holder, propertyName, componentName);


        if (!componentToUse || !componentToUse.component) {
            if (mandatory){
                debugger;
                console.error(`Error creating component ${propertyName}=>${componentName}`);
            }
            return null;
        }

        if (componentToUse.type === ComponentType.AG_GRID){
            return <any>new componentToUse.component();
        }

        //Using framework component
        let FrameworkComponentRaw: {new(): B} = componentToUse.component;

        let thisComponentConfig: ComponentMetadata= this.componentMetadataProvider.retrieve(propertyName);
        return <A>this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, componentName);
    }

}