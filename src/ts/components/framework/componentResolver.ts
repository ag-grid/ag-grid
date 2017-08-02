import {Autowired, Bean, Context, Optional, PostConstruct} from "../../context/context";
import {GridOptions} from "../../entities/gridOptions";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {FrameworkComponentWrapper} from "./frameworkComponentWrapper";
import {IComponent} from "../../interfaces/iComponent";
import {ColDef, ColGroupDef} from "../../entities/colDef";
import {_} from "../../utils";
import {ComponentProvider} from "./componentProvider";

export interface ComponentConfig {
    mandatoryMethodList:string[],
    optionalMethodList:string[]
}

export type ComponentHolder = GridOptions | ColDef | ColGroupDef;

export enum ComponentType {
    AG_GRID, FRAMEWORK
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ComponentToUse<A extends IComponent<any> & B, B> {
    component:{new(): A}|{new(): B},
    type:ComponentType
}

@Bean('componentResolver')
export class ComponentResolver {
    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;


    @Autowired("context")
    private context: Context;

    @Autowired("componentProvider")
    private componentProvider: ComponentProvider;


    @Optional ("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;

    private componentMetaData :{[key:string]:ComponentConfig};

    @PostConstruct
    public postConstruct (){
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: []
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached']
            },
            floatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            filterComponent:{
                mandatoryMethodList: ['isFilterActive','doesFilterPass','getModel','setModel'],
                optionalMethodList: ['afterGuiAttached','onNewRowsLoaded','getModelAsString','onFloatingFilterChanged']
            }
        }
    }

    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param holder: This is the context for which this component needs to be created, it can be gridOptions
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
    public createAgGridComponent<A extends IComponent<any>> (
        holder:ComponentHolder,
        agGridParams:any,
        propertyName:string,
        componentNameOpt?:string,
        mandatory:boolean = true
    ): A{
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
    public getComponentToUse<A extends IComponent<any> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        componentNameOpt?:string
    ):ComponentToUse<A, B>{
        let componentName:string = componentNameOpt == null ? propertyName : componentNameOpt;

        /**
         * There are four things that can happen when resolving a component.
         *  a) HardcodedFwComponent: That holder[propertyName]Framework has associated a Framework native component
         *  b) HardcodedJsComponent: That holder[propertyName] has associate a JS component
         *  c) hardcodedNameComponent: That holder[propertyName] has associate a string that represents a component to load
         *  d) That none of the three previous are specified, then we need to use the DefaultRegisteredComponent
         */
        let RegisteredDefaultComponent : ComponentToUse<A, B>  = this.componentProvider.retrieve<A,B>(componentName);
        let hardcodedNameComponent : string = null;
        let HardcodedJsComponent : {new(): A} = null;
        let HardcodedFwComponent : {new(): B} = null;

        if (holder != null){
            let componentPropertyValue : {new(): A} | string = (<any>holder)[propertyName];
            if (componentPropertyValue != null){
                if (typeof componentPropertyValue === 'string'){
                    hardcodedNameComponent = componentPropertyValue;
                } else {
                    HardcodedJsComponent = componentPropertyValue;
                }
            }
            HardcodedFwComponent = (<any>holder)[propertyName + "Framework"];
        }

        /**
         * Since we allow many types of flavors for specifying the components, let's make sure this is not an illegal
         * combination
         */

        if (HardcodedJsComponent && HardcodedFwComponent){
            throw Error("You are trying to specify: " + propertyName + " twice as a component.")
        }

        if (hardcodedNameComponent && HardcodedFwComponent){
            throw Error("You are trying to specify: " + propertyName + " twice as a component.")
        }

        if (HardcodedFwComponent && !this.frameworkComponentWrapper){
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName)
        }


        /**
         * At this stage we are guaranteed to either have,
         * - A unique HardcodedFwComponent
         * - A unique HardcodedJsComponent
         * - A unique hardcodedNameComponent
         * - None of the previous, hence we revert to: RegisteredComponent
         */
        if (HardcodedFwComponent) {
            return {
                type: ComponentType.FRAMEWORK,
                component: HardcodedFwComponent
            }
        }

        if (HardcodedJsComponent) {
            return {
                type: ComponentType.AG_GRID,
                component: HardcodedJsComponent
            }
        }

        if (hardcodedNameComponent){
            return this.componentProvider.retrieve<A,B>(hardcodedNameComponent);
        }

        return RegisteredDefaultComponent;


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
        holder: GridOptions|ColDef|ColGroupDef,
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

    private newAgGridComponent<A extends IComponent<any> & B, B>
    (
        holder:ComponentHolder,
        propertyName:string,
        componentName:string,
        mandatory:boolean = true
    ): A{
        let componentToUse:ComponentToUse<A,B> = <ComponentToUse<A,B>>this.getComponentToUse(holder, propertyName, componentName);


        if (!componentToUse || !componentToUse.component) {
            if (mandatory){
                console.error(`Error creating component ${propertyName}=>${componentName}`);
            }
            return null;
        }

        if (componentToUse.type === ComponentType.AG_GRID){
            return <any>new componentToUse.component();
        }

        //Using framework component
        let FrameworkComponentRaw: {new(): B} = componentToUse.component;

        let thisComponentConfig: ComponentConfig= this.componentMetaData[propertyName];
        return <A>this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList);
    }
}