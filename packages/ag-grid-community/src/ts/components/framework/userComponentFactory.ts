import { Autowired, Bean, Context, Optional } from "../../context/context";
import { GridOptions } from "../../entities/gridOptions";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { FrameworkComponentWrapper } from "./frameworkComponentWrapper";
import { IComponent } from "../../interfaces/iComponent";
import { ColDef, ColGroupDef } from "../../entities/colDef";
import {
    AgGridComponentFunctionInput,
    AgGridRegisteredComponentInput,
    RegisteredComponent,
    RegisteredComponentSource,
    UserComponentRegistry
} from "./userComponentRegistry";
import { AgComponentUtils } from "./agComponentUtils";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ToolPanelDef } from "../../entities/sideBar";
import { _, Promise } from "../../utils";
import { IDateComp, IDateParams } from "../../rendering/dateComponent";
import { IHeaderComp, IHeaderParams } from "../../headerRendering/header/headerComp";
import { IHeaderGroupComp, IHeaderGroupParams } from "../../headerRendering/headerGroup/headerGroupComp";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRenderer";
import { ILoadingOverlayComp } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../../rendering/overlays/noRowsOverlayComponent";
import { ITooltipComp, ITooltipParams } from "../../rendering/tooltipComponent";
import { IFilterComp, IFilterParams } from "../../interfaces/iFilter";
import { IFloatingFilterComp } from "../../filter/floating/floatingFilter";
import { ICellEditorComp } from "../../interfaces/iCellEditor";
import { IToolPanelComp } from "../../interfaces/iToolPanel";
import { StatusPanelDef } from "../../interfaces/iStatusPanel";

export type DefinitionObject =
    GridOptions
    | ColDef
    | ColGroupDef
    | ISetFilterParams
    | IRichCellEditorParams
    | ToolPanelDef
    | StatusPanelDef;

export type AgComponentPropertyInput<A extends IComponent<any>> = AgGridRegisteredComponentInput<A> | string | boolean;

export enum ComponentSource {
    DEFAULT, REGISTERED_BY_NAME, HARDCODED
}

export interface ComponentSelectorResult {
    component?: string;
    params?: any;
}

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ComponentClassDef<A extends IComponent<any> & B, B> {
    component: { new(): A } | { new(): B };
    componentFromFramework: boolean; // true if component came from framework eg React or Angular
    source: ComponentSource; // [Default, Registered by Name, Hard Coded]
    paramsFromSelector: any; // Params the selector function provided, if any
}

export interface ModifyParamsCallback { (params: any, component: IComponent<any>): void; }

@Bean('userComponentFactory')
export class UserComponentFactory {

    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridOptionsWrapper")
    private gridOptionsWrapper: GridOptionsWrapper;

    @Autowired("context")
    private context: Context;

    @Autowired("agComponentUtils")
    private agComponentUtils: AgComponentUtils;

    @Autowired("componentMetadataProvider")
    private componentMetadataProvider: ComponentMetadataProvider;

    @Autowired("userComponentRegistry")
    private userComponentRegistry: UserComponentRegistry;

    @Optional("frameworkComponentWrapper")
    private frameworkComponentWrapper: FrameworkComponentWrapper;

    public newDateComponent(params: IDateParams): Promise<IDateComp> {
        return this.createAndInitUserComponent<IDateComp>(
            this.gridOptions, params, "dateComponent", "agDateInput");
    }

    public newHeaderComponent(params:IHeaderParams): Promise<IHeaderComp> {
        return this.createAndInitUserComponent<IHeaderComp>(
            params.column.getColDef(), params, "headerComponent", "agColumnHeader");
    }

    public newHeaderGroupComponent(params:IHeaderGroupParams): Promise<IHeaderGroupComp> {
        return this.createAndInitUserComponent(
            params.columnGroup.getColGroupDef(), params, "headerGroupComponent", "agColumnGroupHeader");
    }

    public newFullWidthGroupRowInnerCellRenderer(params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.createAndInitUserComponent<ICellRendererComp>(
            this.gridOptions, params, "groupRowInnerRenderer", null, true);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public newFullWidthCellRenderer(params: any, cellRendererType: string, cellRendererName: string):Promise<ICellRendererComp> {
        return this.createAndInitUserComponent<ICellRendererComp>(null, params, cellRendererType, cellRendererName);
    }

    public newCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.createAndInitUserComponent<ICellRendererComp>(
            target, params, "cellRenderer", null, true);
    }

    public newPinnedRowCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.createAndInitUserComponent<ICellRendererComp>(
            target, params, "pinnedRowCellRenderer", null, true);
    }

    public newCellEditor(colDef: ColDef, params: any): Promise<ICellEditorComp> {
        return this.createAndInitUserComponent (colDef, params, 'cellEditor', 'agCellEditor');
    }

    public newInnerCellRenderer(target: GroupCellRendererParams, params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.createAndInitUserComponent<ICellRendererComp>(
            target, params, "innerRenderer", null);
    }

    public newLoadingOverlayComponent(params: any): Promise<ILoadingOverlayComp> {
        return this.createAndInitUserComponent<ILoadingOverlayComp>(
            this.gridOptions, params, "loadingOverlayComponent", "agLoadingOverlay");
    }

    public newNoRowsOverlayComponent(params: any): Promise<INoRowsOverlayComp> {
        return this.createAndInitUserComponent<INoRowsOverlayComp>(
            this.gridOptions, params, "noRowsOverlayComponent", "agNoRowsOverlay");
    }

    public newTooltipComponent(params: ITooltipParams): Promise<ITooltipComp> {
        const colDef = params.colDef;
        return this.createAndInitUserComponent<ITooltipComp>(
            colDef, params, "tooltipComponent", 'agTooltipComponent');
    }

    public newFilterComponent(colDef: ColDef, params: IFilterParams, defaultFilter: string,
                              modifyParamsCallback: ModifyParamsCallback): Promise<IFilterComp> {
        return this.createAndInitUserComponent<IFilterComp>(
            colDef, params, 'filter', defaultFilter, false, modifyParamsCallback);
    }

    public newFloatingFilterComponent(colDef: ColDef, params: any, defaultFloatingFilter: string): Promise<IFloatingFilterComp> {
        return this.createAndInitUserComponent<IFloatingFilterComp>(
            colDef, params, "floatingFilterComponent", defaultFloatingFilter, true);
    }

    public newToolPanelComponent(toolPanelDef: ToolPanelDef, params: any): Promise<IToolPanelComp> {
        return this.createAndInitUserComponent(toolPanelDef, params, 'toolPanel');
    }

    public newStatusPanelComponent(def: StatusPanelDef, params: any): Promise<IToolPanelComp> {
        return this.createAndInitUserComponent(def, params, 'statusPanel');
    }

    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param paramsFromGrid: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param optional: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    private createAndInitUserComponent<A extends IComponent<any>>(definitionObject: DefinitionObject,
                                                          paramsFromGrid: any,
                                                          propertyName: string,
                                                          defaultComponentName?: string,

                                                          // optional items are: FloatingFilter, CellComp (for cellRenderer)
                                                          optional = false,

                                                          // used by FilterManager only
                                                          modifyParamsCallback?: ModifyParamsCallback
                                                    ): Promise<A> {

        if (!definitionObject) {
            definitionObject = this.gridOptions;
        }

        // Create the component instance
        const componentAndParams: {componentInstance: A, paramsFromSelector: any}
            = this.createComponentInstance(definitionObject, propertyName, paramsFromGrid, defaultComponentName, optional);
        if (!componentAndParams) { return null; }
        const componentInstance = componentAndParams.componentInstance;

        // Wire the component and call the init method with the correct params
        const params = this.createFinalParams(definitionObject, propertyName, paramsFromGrid,
            componentAndParams.paramsFromSelector);

        this.addReactHacks(params);

        // give caller chance to set any params that depend on the componentInstance (need here as the
        // componentInstance was not available when createUserComponent was called)
        const paramsAfterCallback = modifyParamsCallback ? modifyParamsCallback(params, componentInstance) : params;

        const deferredInit: void | Promise<void> = this.initComponent(componentInstance, paramsAfterCallback);
        if (deferredInit == null) {

            // const p = new Promise<A>(resolve => {
            //     setTimeout( ()=> {
            //         resolve(componentInstance);
            //     }, 1000);
            // });
            // return p;

            return Promise.resolve(componentInstance);
        } else {
            const asPromise: Promise<void> = deferredInit as Promise<void>;
            return asPromise.map(notRelevant => componentInstance);
        }
    }

    private addReactHacks(params: any): void {
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        const agGridReact = this.context.getBean('agGridReact');
        if (agGridReact) {
            params.agGridReact = _.cloneObject(agGridReact);
        }
        // AG-1716 - directly related to AG-1574 and AG-1715
        const frameworkComponentWrapper = this.context.getBean('frameworkComponentWrapper');
        if (frameworkComponentWrapper) {
            params.frameworkComponentWrapper = frameworkComponentWrapper;
        }
    }

    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    public createUserComponentFromConcreteClass<P, A extends IComponent<P>>(clazz: { new(): A }, agGridParams: P): A {

        const internalComponent: A = new clazz() as A;

        this.initComponent(
            internalComponent,
            agGridParams
        );

        return internalComponent;
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
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param params: Params to be passed to the dynamic component function in case it needs to be
     *      invoked
     *  @param defaultComponentName: The name of the component to load if there is no component specified
     */
    public lookupComponentClassDef<A extends IComponent<any> & B, B>(
        definitionObject: DefinitionObject,
        propertyName: string,
        params: any = null,
        defaultComponentName?: string
    ): ComponentClassDef<A, B> {
        /**
         * There are five things that can happen when resolving a component.
         *  a) HardcodedFwComponent: That holder[propertyName]Framework has associated a Framework native component
         *  b) HardcodedJsComponent: That holder[propertyName] has associate a JS component
         *  c) hardcodedJsFunction: That holder[propertyName] has associate a JS function
         *  d) hardcodedNameComponent: That holder[propertyName] has associate a string that represents a component to load
         *  e) That none of the three previous are specified, then we need to use the DefaultRegisteredComponent
         */
        let hardcodedNameComponent: string = null;
        let HardcodedJsComponent: { new(): A } = null;
        let hardcodedJsFunction: AgGridComponentFunctionInput = null;
        let HardcodedFwComponent: { new(): B } = null;
        let componentSelectorFunc: (params: any) => ComponentSelectorResult;

        if (definitionObject != null) {
            const componentPropertyValue: AgComponentPropertyInput<IComponent<any>> = (definitionObject as any)[propertyName];
            // for filters only, we allow 'true' for the component, which means default filter to be used
            const usingDefaultComponent = componentPropertyValue === true;
            if (componentPropertyValue != null && !usingDefaultComponent) {
                if (typeof componentPropertyValue === 'string') {
                    hardcodedNameComponent = componentPropertyValue;
                } else if (typeof componentPropertyValue === 'boolean') {
                    // never happens, as we test for usingDefaultComponent above,
                    // however it's needed for the next block to compile
                } else if (this.agComponentUtils.doesImplementIComponent(componentPropertyValue)) {
                    HardcodedJsComponent = componentPropertyValue as { new(): A };
                } else {
                    hardcodedJsFunction = componentPropertyValue as AgGridComponentFunctionInput;
                }
            }
            HardcodedFwComponent = (definitionObject as any)[propertyName + "Framework"];
            componentSelectorFunc = (definitionObject as any)[propertyName + "Selector"];
        }

        /**
         * Since we allow many types of flavors for specifying the components, let's make sure this is not an illegal
         * combination
         */

        if (
            (HardcodedJsComponent && HardcodedFwComponent) ||
            (hardcodedNameComponent && HardcodedFwComponent) ||
            (hardcodedJsFunction && HardcodedFwComponent)
        ) {
            throw Error("ag-grid: you are trying to specify: " + propertyName + " twice as a component.");
        }

        if (HardcodedFwComponent && !this.frameworkComponentWrapper) {
            throw Error("ag-grid: you are specifying a framework component but you are not using a framework version of ag-grid for : " + propertyName);
        }

        if (componentSelectorFunc && (hardcodedNameComponent || HardcodedJsComponent || hardcodedJsFunction || HardcodedFwComponent)) {
            throw Error("ag-grid: you can't specify both, the selector and the component of ag-grid for : " + propertyName);
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
                componentFromFramework: true,
                component: HardcodedFwComponent,
                source: ComponentSource.HARDCODED,
                paramsFromSelector: null
            };
        }

        if (HardcodedJsComponent) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a component directly is deprecated, you should register the component by name`);
            // console.warn(`${HardcodedJsComponent}`);
            return {
                componentFromFramework: false,
                component: HardcodedJsComponent,
                source: ComponentSource.HARDCODED,
                paramsFromSelector: null
            };
        }

        if (hardcodedJsFunction) {
            // console.warn(`ag-grid: Since version 12.1.0 specifying a function directly is deprecated, you should register the component by name`);
            // console.warn(`${hardcodedJsFunction}`);
            return this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, false, ComponentSource.HARDCODED) as ComponentClassDef<A, B>;
        }

        const selectorResult = componentSelectorFunc ? componentSelectorFunc(params) : null;

        let componentNameToUse: string;
        if (selectorResult && selectorResult.component) {
            componentNameToUse = selectorResult.component;
        } else if (hardcodedNameComponent) {
            componentNameToUse = hardcodedNameComponent;
        } else {
            componentNameToUse = defaultComponentName;
        }

        if (!componentNameToUse) { return null; }

        const registeredCompClassDef = this.lookupFromRegisteredComponents(propertyName, componentNameToUse) as ComponentClassDef<A, B>;

        return {
            componentFromFramework: registeredCompClassDef.componentFromFramework,
            component: registeredCompClassDef.component,
            source: registeredCompClassDef.source,
            paramsFromSelector: selectorResult ? selectorResult.params : null
        };
    }

    private lookupFromRegisteredComponents<A extends IComponent<any> & B, B>(propertyName: string,
                                                            componentNameOpt?: string): ComponentClassDef<A, B> {
        const componentName: string = componentNameOpt != null ? componentNameOpt : propertyName;

        const registeredComponent: RegisteredComponent<A, B> = this.userComponentRegistry.retrieve(componentName);
        if (registeredComponent == null) { return null; }

        //If it is a FW it has to be registered as a component
        if (registeredComponent.componentFromFramework) {
            return {
                component: registeredComponent.component as { new(): B },
                componentFromFramework: true,
                source: ComponentSource.REGISTERED_BY_NAME,
                paramsFromSelector: null
            };
        }

        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component as AgGridRegisteredComponentInput<A>)) {
            return {
                component: registeredComponent.component as { new(): A },
                componentFromFramework: false,
                source: (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT,
                paramsFromSelector: null
            };
        }

        // This is a function
        return this.agComponentUtils.adaptFunction(
            propertyName,
            registeredComponent.component as AgGridComponentFunctionInput,
            registeredComponent.componentFromFramework,
            (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT
        );
    }

    /**
     * Useful to check what would be the resultant params for a given object
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param paramsFromGrid: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {any} It merges the user agGridParams with the actual params specified by the user.
     */
    public createFinalParams(definitionObject: DefinitionObject,
                       propertyName: string,
                       paramsFromGrid: any,
                       paramsFromSelector: any = null): any {

        const res: any = {};
        _.mergeDeep(res, paramsFromGrid);

        const userParams: any = definitionObject ? (definitionObject as any)[propertyName + "Params"] : null;

        if (userParams != null) {
            if (typeof userParams === 'function') {
                _.mergeDeep(res, userParams(paramsFromGrid));
            } else if (typeof userParams === 'object') {
                _.mergeDeep(res, userParams);
            }
        }

        _.mergeDeep(res, paramsFromSelector);

        return res;
    }

    private createComponentInstance<A extends IComponent<any> & B, B>(holder: DefinitionObject,
        propertyName: string,
        paramsForSelector: any,
        defaultComponentName: string,
        optional: boolean
    ): {componentInstance: A, paramsFromSelector: any} {
        const componentToUse: ComponentClassDef<A, B> =
            this.lookupComponentClassDef(holder, propertyName, paramsForSelector, defaultComponentName) as ComponentClassDef<A, B>;

        const missing = !componentToUse || !componentToUse.component;
        if (missing) {
            if (!optional) { console.error(`Error creating component ${propertyName}=>${defaultComponentName}`); }
            return null;
        }

        let componentInstance: A;

        if (componentToUse.componentFromFramework) {
            // Using framework component
            const FrameworkComponentRaw: { new(): B } = componentToUse.component;
            const thisComponentConfig: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
            componentInstance = this.frameworkComponentWrapper.wrap(FrameworkComponentRaw,
                thisComponentConfig.mandatoryMethodList,
                thisComponentConfig.optionalMethodList,
                defaultComponentName) as A;
        } else {
            // Using plain JavaScript component
            componentInstance = new componentToUse.component() as A;
        }

        return {componentInstance: componentInstance, paramsFromSelector: componentToUse.paramsFromSelector};
    }

    private initComponent<A extends IComponent<any>>(component: A, finalParams: any): Promise<void> | void {
        this.context.wireBean(component);
        if (component.init == null) {
            return;
        } else {
            return component.init(finalParams);
        }
    }

}