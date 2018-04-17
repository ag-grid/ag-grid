import {Autowired, Bean, Context, Optional} from "../../context/context";
import {GridOptions} from "../../entities/gridOptions";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FrameworkComponentWrapper} from "./frameworkComponentWrapper";
import {IComponent} from "../../interfaces/iComponent";
import {ColDef, ColGroupDef} from "../../entities/colDef";
import {_, Promise} from "../../utils";

import {
    AgGridComponentFunctionInput, AgGridRegisteredComponentInput, ComponentProvider,
    RegisteredComponent, RegisteredComponentSource
} from "./componentProvider";
import {AgComponentUtils} from "./agComponentUtils";
import {ComponentMetadata, ComponentMetadataProvider} from "./componentMetadataProvider";
import {ISetFilterParams} from "../../interfaces/iSetFilterParams";
import {IRichCellEditorParams} from "../../interfaces/iRichCellEditorParams";
import {RowNode} from "../../entities/rowNode";
import {Column} from "../../entities/column";
import {GridApi} from "../../gridApi";
import {ColumnApi} from "../../columnController/columnApi";

export type ComponentHolder = GridOptions | ColDef | ColGroupDef | ISetFilterParams | IRichCellEditorParams;

export type AgComponentPropertyInput<A extends IComponent<any>> = AgGridRegisteredComponentInput<A> | string;

export enum ComponentType {
    AG_GRID, FRAMEWORK
}

export enum ComponentSource {
    DEFAULT, REGISTERED_BY_NAME, HARDCODED
}

export interface DynamicComponentParams {
    data?: any,
    node?: RowNode,
    colDef?: ColDef,
    column?: Column,
    $scope?: any,
    rowIndex?: number,
    api: GridApi,
    columnApi: ColumnApi
}

export interface DynamicComponentDef {
    component?: string,
    params?: any
}


/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ResolvedComponent<A extends IComponent<any> & B, B> {
    component:{new(): A}|{new(): B},
    type:ComponentType,
    source:ComponentSource,
    dynamicParams:any
}

@Bean('componentResolver')
export class ComponentResolver {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired("context")
    private context: Context;

    @Autowired ("agComponentUtils")
    private agComponentUtils: AgComponentUtils;

    @Autowired ("componentMetadataProvider")
    private componentMetadataProvider: ComponentMetadataProvider;

    @Autowired("componentProvider")
    private componentProvider: ComponentProvider;



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
     *  @param dynamicComponentParams: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The name of the component to load if there is no component specified
     */
    public getComponentToUse<A extends IComponent<any> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        dynamicComponentParams: DynamicComponentParams,
        defaultComponentName?:string
    ):ResolvedComponent<A, B>{
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
        let dynamicComponentFn: (params:DynamicComponentParams)=>DynamicComponentDef;

        if (holder != null){
            let componentPropertyValue : AgComponentPropertyInput<IComponent<any>> = (<any>holder)[propertyName];
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
            dynamicComponentFn = (<any>holder)[propertyName + "Selector"];
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
            throw Error("ag-grid: you are trying to specify: " + propertyName + " twice as a component.")
        }

        if (HardcodedFwComponent && !this.frameworkComponentWrapper){
            throw Error("ag-grid: you are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName)
        }

        if (dynamicComponentFn && (hardcodedNameComponent || HardcodedJsComponent || hardcodedJsFunction || HardcodedFwComponent)) {
            throw Error("ag-grid: you can't specify both, the selector and the component of ag-grid for : " + propertyName)
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
                source: ComponentSource.HARDCODED,
                dynamicParams: null
            }
        }

        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                type: ComponentType.AG_GRID,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED,
                dynamicParams: null
            }
        }

        if (hardcodedJsFunction){
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return <ResolvedComponent<A,B>>this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, ComponentType.AG_GRID, ComponentSource.HARDCODED);
        }

        if (dynamicComponentFn){
            let dynamicComponentDef = dynamicComponentFn(dynamicComponentParams);
            if (dynamicComponentDef != null){
                if (dynamicComponentDef.component == null){
                    dynamicComponentDef.component = defaultComponentName;
                }
                let dynamicComponent:ResolvedComponent<A,B> = <ResolvedComponent<A,B>>this.resolveByName(propertyName, dynamicComponentDef.component);
                return _.assign(
                    dynamicComponent,{
                        dynamicParams:dynamicComponentDef.params
                    }
                );
            }
        }


        //^^^^^ABOVE DEPRECATED - AT THIS POINT WE ARE RESOLVING BY NAME
        let componentNameToUse: string;
        if (hardcodedNameComponent){
            componentNameToUse = hardcodedNameComponent;
        } else{
            componentNameToUse = defaultComponentName;
        }

        return componentNameToUse == null ? null : <ResolvedComponent<A,B>>this.resolveByName(propertyName, componentNameToUse);
    }

    private resolveByName<A extends IComponent<any> & B, B> (
        propertyName:string,
        componentNameOpt?:string
    ):ResolvedComponent<A, B>{
        let componentName:string = componentNameOpt != null ? componentNameOpt : propertyName;

        let registeredComponent:RegisteredComponent<A,B> = this.componentProvider.retrieve(componentName);
        if (registeredComponent == null) return null;

        //If it is a FW it has to be registered as a component
        if (registeredComponent.type == ComponentType.FRAMEWORK){
            return {
                component: <{new(): B}>registeredComponent.component,
                type: ComponentType.FRAMEWORK,
                source: ComponentSource.REGISTERED_BY_NAME,
                dynamicParams: null
            }
        }


        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(<AgGridRegisteredComponentInput<A>>registeredComponent.component)){
            return {
                component: <{new(): A}>registeredComponent.component,
                type: ComponentType.AG_GRID,
                source: (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT,
                dynamicParams: null
            }
        }

        // This is a function
        return this.agComponentUtils.adaptFunction(
            propertyName,
            <AgGridComponentFunctionInput>registeredComponent.component,
            registeredComponent.type,
            (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT
        );
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
        agGridParams: any,
        dynamicCustomParams: any,
        dynamicParams: any = null
    ):any{
        let customParamsRaw: any = holder ? (<any>holder)[propertyName + "Params"] : null;
        let finalParams: any = {};

        _.mergeDeep(finalParams, agGridParams);
        if (customParamsRaw != null){
            let customParams:any = null;
            if (typeof customParamsRaw === 'function'){
                customParams = customParamsRaw (dynamicCustomParams);
            }
            else {
                customParams = customParamsRaw;
            }
            _.mergeDeep(finalParams, customParams);

        }
        _.mergeDeep(finalParams, dynamicParams);
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
     *  @param dynamicComponentParams: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param mandatory: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     *  @param customInitParamsCb: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    public createAgGridComponent<A extends IComponent<any>> (
        holderOpt:ComponentHolder,
        agGridParams:any,
        propertyName:string,
        dynamicComponentParams:DynamicComponentParams,
        defaultComponentName?:string,
        mandatory:boolean = true,
        customInitParamsCb?:(params:any, component:A)=>any
    ): Promise<A>{
        let holder:ComponentHolder = holderOpt == null ? this.gridOptions : holderOpt;

        //Create the component instance
        let componentAndParams: [A, any] = <[A, any]>this.newAgGridComponent(holder, propertyName, dynamicComponentParams, defaultComponentName, mandatory);
        if (!componentAndParams) return null;

        // Wire the component and call the init method with the correct params
        let finalParams = this.mergeParams(holder, propertyName, agGridParams, dynamicComponentParams, componentAndParams[1]);

        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        finalParams.agGridReact = this.context.getBean('agGridReact') ? _.cloneObject(this.context.getBean('agGridReact')) : {};
        // AG-1716 - directly related to AG-1574 and AG-1715
        finalParams.frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper') ? this.context.getBean('frameworkComponentWrapper') : {};

        let deferredInit : void | Promise<void> = this.initialiseComponent(componentAndParams[0], finalParams, customInitParamsCb);
        if (deferredInit == null){
            return Promise.resolve(componentAndParams[0]);
        } else {
            let asPromise:Promise<void> = <Promise<void>> deferredInit;
            return asPromise.map(notRelevant=>componentAndParams[0]);
        }
    }


    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param customInitParamsCb: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    public createInternalAgGridComponent<A extends IComponent<any>> (
        clazz:{new(): A},
        agGridParams:any,
        customInitParamsCb?:(params:any, component:A)=>any
    ): A{
        let internalComponent:A = <A>new clazz();

        this.initialiseComponent(
            internalComponent,
            agGridParams,
            customInitParamsCb
        );

        return internalComponent;
    }

    private newAgGridComponent<A extends IComponent<any> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        dynamicComponentParams:DynamicComponentParams,
        defaultComponentName?:string,
        mandatory:boolean = true
    ): [A, any]{
        let componentToUse:ResolvedComponent<A,B> = <ResolvedComponent<A,B>>this.getComponentToUse(holder, propertyName, dynamicComponentParams, defaultComponentName);


        if (!componentToUse || !componentToUse.component) {
            if (mandatory){
                console.error(`Error creating component ${propertyName}=>${defaultComponentName}`);
            }
            return null;
        }

        if (componentToUse.type === ComponentType.AG_GRID){
            return [
                <A>new componentToUse.component(),
                componentToUse.dynamicParams
            ];
        }

        //Using framework component
        let FrameworkComponentRaw: {new(): B} = componentToUse.component;

        let thisComponentConfig: ComponentMetadata= this.componentMetadataProvider.retrieve(propertyName);
        return [
            <A>this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList, defaultComponentName),
            componentToUse.dynamicParams
        ];
    }

    private initialiseComponent <A extends IComponent<any>>(
        component : A,
        agGridParams:any,
        customInitParamsCb?:(params:any, component:A)=>any
    ):Promise<void> | void{
        this.context.wireBean(component);
        if (customInitParamsCb == null){
            return component.init(agGridParams);
        } else {
            return component.init(customInitParamsCb(agGridParams, component));
        }
    }

}