import { Autowired, Bean, Optional } from "../../context/context";
import { GridOptions } from "../../entities/gridOptions";
import { FrameworkComponentWrapper } from "./frameworkComponentWrapper";
import { IComponent } from "../../interfaces/iComponent";
import { ColDef, ColGroupDef } from "../../entities/colDef";
import {
    RegisteredComponent,
    RegisteredComponentSource,
    UserComponentRegistry
} from "./userComponentRegistry";
import { AgComponentUtils } from "./agComponentUtils";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ToolPanelDef } from "../../entities/sideBar";
import { AgPromise } from "../../utils";
import { IDateComp, IDateParams } from "../../rendering/dateComponent";
import { IHeaderComp, IHeaderParams } from "../../headerRendering/header/headerComp";
import { IHeaderGroupComp, IHeaderGroupParams } from "../../headerRendering/headerGroup/headerGroupComp";
import { ICellRendererComp, ICellRendererParams, ISetFilterCellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRenderer";
import { ILoadingOverlayComp, ILoadingOverlayParams } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp, INoRowsOverlayParams } from "../../rendering/overlays/noRowsOverlayComponent";
import { ITooltipComp, ITooltipParams } from "../../rendering/tooltipComponent";
import { IFilterComp, IFilterParams, IFilterDef } from "../../interfaces/iFilter";
import { IFloatingFilterComp, IFloatingFilterParams } from "../../filter/floating/floatingFilter";
import { ICellEditorComp, ICellEditorParams } from "../../interfaces/iCellEditor";
import { IToolPanelComp, IToolPanelParams } from "../../interfaces/iToolPanel";
import { IStatusPanelComp, IStatusPanelParams, StatusPanelDef } from "../../interfaces/iStatusPanel";
import {
    CellEditorComponent,
    CellRendererComponent,
    ComponentType,
    DateComponent,
    FilterComponent,
    FloatingFilterComponent,
    HeaderComponent,
    HeaderGroupComponent,
    InnerRendererComponent,
    LoadingOverlayComponent,
    NoRowsOverlayComponent,
    StatusPanelComponent,
    ToolPanelComponent,
    TooltipComponent
} from "./componentTypes";
import { BeanStub } from "../../context/beanStub";
import { cloneObject, mergeDeep } from '../../utils/object';

export type DefinitionObject =
    GridOptions
    | ColDef
    | ColGroupDef
    | IFilterDef
    | ISetFilterParams
    | IRichCellEditorParams
    | ToolPanelDef
    | StatusPanelDef;

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
export interface ComponentClassDef {
    component: any; // not typing, as can be component from any framework
    componentFromFramework: boolean; // true if component came from framework eg React or Angular
    source: ComponentSource; // [Default, Registered by Name, Hard Coded]
    paramsFromSelector: any; // Params the selector function provided, if any
}

export interface CompClassAndParams {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
}

@Bean('userComponentFactory')
export class UserComponentFactory extends BeanStub {
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('agComponentUtils') private readonly agComponentUtils: AgComponentUtils;
    @Autowired('componentMetadataProvider') private readonly componentMetadataProvider: ComponentMetadataProvider;
    @Autowired('userComponentRegistry') private readonly userComponentRegistry: UserComponentRegistry;
    @Optional('frameworkComponentWrapper') private readonly frameworkComponentWrapper: FrameworkComponentWrapper;

    public newDateComponent(params: IDateParams): AgPromise<IDateComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, DateComponent, 'agDateInput');
    }

    public newHeaderComponent(params: IHeaderParams): AgPromise<IHeaderComp> | null {
        return this.lookupAndCreateComponent(params.column.getColDef(), params, HeaderComponent, 'agColumnHeader');
    }

    public newHeaderGroupComponent(params: IHeaderGroupParams): AgPromise<IHeaderGroupComp> | null {
        return this.lookupAndCreateComponent(
            params.columnGroup.getColGroupDef()!, params, HeaderGroupComponent, 'agColumnGroupHeader');
    }

    public newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions.groupRowRendererParams, params, InnerRendererComponent, null, true);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public newFullWidthCellRenderer(
        params: ICellRendererParams, cellRendererType: string, cellRendererName: string): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(
            this.gridOptions,
            params,
            { propertyName: cellRendererType, isCellRenderer: () => true },
            cellRendererName);
    }

    // CELL RENDERER
    public newCellRenderer(
        def: ColDef | IRichCellEditorParams,
        params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(def, params, CellRendererComponent, null, true);
    }
    public getCellRendererDetails(def: ColDef | IRichCellEditorParams, params: ICellRendererParams): CompClassAndParams | undefined {
        return this.getCompDetails(def, CellRendererComponent.propertyName, null, params);
    }
    public createCellRenderer(compClassAndParams: CompClassAndParams): AgPromise<ICellRendererComp> | null {
        return this.createAndInitComponent(compClassAndParams, CellRendererComponent)
    }

    // CELL EDITOR
    public newCellEditor(colDef: ColDef, params: ICellEditorParams): AgPromise<ICellEditorComp> | null {
        return this.lookupAndCreateComponent(colDef, params, CellEditorComponent, 'agCellEditor');
    }
    public getCellEditorDetails(def: ColDef, params: ICellEditorParams): CompClassAndParams | undefined {
        return this.getCompDetails(def, CellEditorComponent.propertyName, 'agCellEditor', params, true);
    }
    public createCellEditor(compClassAndParams: CompClassAndParams): AgPromise<ICellEditorComp> | null {
        return this.createAndInitComponent(compClassAndParams, CellEditorComponent)
    }



    public newInnerCellRenderer(def: GroupCellRendererParams, params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(def, params, InnerRendererComponent, null);
    }

    public newLoadingOverlayComponent(params: ILoadingOverlayParams): AgPromise<ILoadingOverlayComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, LoadingOverlayComponent, 'agLoadingOverlay');
    }

    public newNoRowsOverlayComponent(params: INoRowsOverlayParams): AgPromise<INoRowsOverlayComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, NoRowsOverlayComponent, 'agNoRowsOverlay');
    }

    public newTooltipComponent(params: ITooltipParams): AgPromise<ITooltipComp> | null {
        return this.lookupAndCreateComponent(params.colDef, params, TooltipComponent, 'agTooltipComponent');
    }

    public newFilterComponent(def: IFilterDef, params: IFilterParams, defaultFilter: string): AgPromise<IFilterComp> | null {
        return this.lookupAndCreateComponent(def, params, FilterComponent, defaultFilter, false);
    }

    public newSetFilterCellRenderer(
        def: ISetFilterParams, params: ISetFilterCellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(def, params, CellRendererComponent, null, true);
    }

    public newFloatingFilterComponent(
        def: IFilterDef, params: IFloatingFilterParams, defaultFloatingFilter: string | null): AgPromise<IFloatingFilterComp> | null {
        return this.lookupAndCreateComponent(def, params, FloatingFilterComponent, defaultFloatingFilter, true);
    }

    public newToolPanelComponent(toolPanelDef: ToolPanelDef, params: IToolPanelParams): AgPromise<IToolPanelComp> | null {
        return this.lookupAndCreateComponent(toolPanelDef, params, ToolPanelComponent);
    }

    public newStatusPanelComponent(def: StatusPanelDef, params: IStatusPanelParams): AgPromise<IStatusPanelComp> | null {
        return this.lookupAndCreateComponent(def, params, StatusPanelComponent);
    }

    private getCompDetails(defObject: DefinitionObject, propName: string, defaultName: string | null | undefined, params: any, mandatory = false): CompClassAndParams | undefined {
        const compClassDef = this.lookupComponent(defObject, propName, params, defaultName);
        if (!compClassDef || !compClassDef.component) {
            if (mandatory) {
                this.logComponentMissing(defObject, propName);
            }
            return undefined;
        }

        const paramsMerged = this.mergeParamsWithApplicationProvidedParams(
            defObject, propName, params, compClassDef.paramsFromSelector);

        return {
            componentClass: compClassDef.component,
            componentFromFramework: compClassDef.componentFromFramework,
            params: paramsMerged
        };
    }

    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param definitionObject: This is the context for which this component needs to be created, it can be gridOptions
     *      (global) or columnDef mostly.
     *  @param paramsFromGrid: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param propertyName: The name of the property used in ag-grid as a convention to refer to the component, it can be:
     *      'floatingFilter', 'cellRenderer', is used to find if the user is specifying a custom component
     *  @param defaultComponentName: The actual name of the component to instantiate, this is usually the same as propertyName, but in
     *      some cases is not, like floatingFilter, if it is the same is not necessary to specify
     *  @param optional: Handy method to tell if this should return a component ALWAYS. if that is the case, but there is no
     *      component found, it throws an error, by default all components are MANDATORY
     */
    private lookupAndCreateComponent(
        def: DefinitionObject,
        paramsFromGrid: any,
        componentType: ComponentType,
        defaultComponentName?: string | null,
        // optional items are: FloatingFilter, CellComp (for cellRenderer)
        optional = false
    ): AgPromise<any> | null {

        const compClassAndParams = this.getCompDetails(
            def, componentType.propertyName, defaultComponentName, paramsFromGrid, !optional);

        if (!compClassAndParams) { return null; }

        return this.createAndInitComponent(compClassAndParams, componentType, defaultComponentName);
    }

    private createAndInitComponent(compClassAndParams: CompClassAndParams, componentType: ComponentType, defaultComponentName?: string | null): AgPromise<any> | null {
        if (!compClassAndParams) { return null; }

        const {params, componentClass, componentFromFramework} = compClassAndParams;

        // Create the component instance
        const instance = this.createComponentInstance(componentType, defaultComponentName, componentClass, componentFromFramework);

        this.addReactHacks(params);

        const deferredInit = this.initComponent(instance, params);

        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return (deferredInit as AgPromise<void>).then(() => instance);
    }

    private addReactHacks(params: any): void {
        // a temporary fix for AG-1574
        // AG-1715 raised to do a wider ranging refactor to improve this
        const agGridReact = this.context.getBean('agGridReact');

        if (agGridReact) {
            params.agGridReact = cloneObject(agGridReact);
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
     *  @param CompClass: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    public createUserComponentFromConcreteClass(CompClass: any, agGridParams: any): any {
        const internalComponent = new CompClass();

        this.initComponent(internalComponent, agGridParams);

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
    public lookupComponent(
        definitionObject: DefinitionObject,
        propertyName: string,
        params: any = null,
        defaultComponentName?: string | null
    ): ComponentClassDef | null {
        /**
         * There are five things that can happen when resolving a component.
         *  a) HardcodedFwComponent: That holder[propertyName]Framework has associated a Framework native component
         *  b) HardcodedJsComponent: That holder[propertyName] has associate a JS component
         *  c) hardcodedJsFunction: That holder[propertyName] has associate a JS function
         *  d) hardcodedNameComponent: That holder[propertyName] has associate a string that represents a component to load
         *  e) That none of the three previous are specified, then we need to use the DefaultRegisteredComponent
         */
        let hardcodedNameComponent: string | null = null;
        let HardcodedJsComponent: any = null;
        let hardcodedJsFunction: any = null;
        let HardcodedFwComponent: any = null;
        let componentSelectorFunc: ((params: any) => ComponentSelectorResult) | null = null;

        const componentSelectorFuncKey = propertyName + "Selector";

        if (definitionObject != null) {
            const componentPropertyValue = (definitionObject as any)[propertyName];
            // for filters only, we allow 'true' for the component, which means default filter to be used
            const usingDefaultComponent = componentPropertyValue === true;
            if (componentPropertyValue != null && !usingDefaultComponent) {
                if (typeof componentPropertyValue === 'string') {
                    hardcodedNameComponent = componentPropertyValue;
                } else if (typeof componentPropertyValue === 'boolean') {
                    // never happens, as we test for usingDefaultComponent above,
                    // however it's needed for the next block to compile
                } else if (this.agComponentUtils.doesImplementIComponent(componentPropertyValue)) {
                    HardcodedJsComponent = componentPropertyValue;
                } else {
                    hardcodedJsFunction = componentPropertyValue;
                }
            }
            HardcodedFwComponent = (definitionObject as any)[propertyName + "Framework"];
            componentSelectorFunc = (definitionObject as any)[componentSelectorFuncKey];
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
            return this.agComponentUtils.adaptFunction(propertyName, hardcodedJsFunction, false, ComponentSource.HARDCODED);
        }

        let componentNameToUse: string | null | undefined;
        let paramsFromSelector: any;

        if (componentSelectorFunc) {
            const selectorResult = componentSelectorFunc ? componentSelectorFunc(params) : null;
            if (selectorResult == null || selectorResult.component == null) {
                console.warn(`AG Grid - ${componentSelectorFuncKey} must return something. If you don't want a particular row to use a Cell Renderer, then return a simple Cell Renderer that just displays the value.`, params);
            } else {
                componentNameToUse = selectorResult.component;
                paramsFromSelector = selectorResult.params;
            }
        }

        if (componentNameToUse == null) {
            componentNameToUse = hardcodedNameComponent;
        }

        if (componentNameToUse == null) {
            componentNameToUse = defaultComponentName;
        }

        if (!componentNameToUse) {
            return null;
        }

        const registeredCompClassDef = this.lookupFromRegisteredComponents(propertyName, componentNameToUse);

        if (!registeredCompClassDef) {
            return null;
        }

        return {
            componentFromFramework: registeredCompClassDef.componentFromFramework,
            component: registeredCompClassDef.component,
            source: registeredCompClassDef.source,
            paramsFromSelector: paramsFromSelector
        };
    }

    private lookupFromRegisteredComponents(
        propertyName: string,
        componentNameOpt?: string
    ): any {
        const componentName: string = componentNameOpt != null ? componentNameOpt : propertyName;
        const registeredComponent: any = this.userComponentRegistry.retrieve(componentName);

        if (registeredComponent == null) {
            return null;
        }

        //If it is a FW it has to be registered as a component
        if (registeredComponent.componentFromFramework) {
            return {
                component: registeredComponent.component,
                componentFromFramework: true,
                source: ComponentSource.REGISTERED_BY_NAME,
                paramsFromSelector: null
            };
        }

        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component)) {
            return {
                component: registeredComponent.component,
                componentFromFramework: false,
                source: (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT,
                paramsFromSelector: null
            };
        }

        // This is a function
        return this.agComponentUtils.adaptFunction(
            propertyName,
            registeredComponent.component,
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
     *  @param paramsFromGrid: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     * @returns {TParams} It merges the user agGridParams with the actual params specified by the user.
     */
    public mergeParamsWithApplicationProvidedParams(
        definitionObject: DefinitionObject,
        propertyName: string,
        paramsFromGrid: any,
        paramsFromSelector: any = null): any {
        const params = {} as any;

        mergeDeep(params, paramsFromGrid);

        const userParams = definitionObject ? (definitionObject as any)[propertyName + "Params"] : null;

        if (userParams != null) {
            if (typeof userParams === 'function') {
                const userParamsFromFunc = userParams(paramsFromGrid);
                mergeDeep(params, userParamsFromFunc);
            } else if (typeof userParams === 'object') {
                mergeDeep(params, userParams);
            }
        }

        mergeDeep(params, paramsFromSelector);

        return params;
    }

    private logComponentMissing(holder: any, propertyName: string, defaultComponentName?: string | null): void {
        // to help the user, we print out the name they are looking for, rather than the default name.
        // i don't know why the default name was originally printed out (that doesn't help the user)
        const overrideName = holder ? (holder as any)[propertyName] : defaultComponentName;
        const nameToReport = overrideName ? overrideName : defaultComponentName;
        console.error(`Could not find component ${nameToReport}, did you forget to configure this component?`);
    }

    private createComponentInstance(
        componentType: ComponentType,
        defaultComponentName: string | null | undefined,
        component: any,
        componentFromFramework: boolean
    ): any {
        const propertyName = componentType.propertyName;

        // using javascript component
        const jsComponent = !componentFromFramework;
        if (jsComponent) {
            return new component!();
        }

        // Using framework component
        const FrameworkComponentRaw: any = component;
        const thisComponentConfig: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        return this.frameworkComponentWrapper.wrap(
            FrameworkComponentRaw,
            thisComponentConfig.mandatoryMethodList,
            thisComponentConfig.optionalMethodList,
            componentType,
            defaultComponentName
        );
    }

    private initComponent(component: any, params: any): AgPromise<void> | void {
        this.context.createBean(component);

        if (component.init == null) {
            return;
        }

        return component.init(params);
    }
}
