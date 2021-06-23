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

export interface ComponentAndParams {
    component: any;
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
        return this.createAndInitUserComponent(this.gridOptions, params, DateComponent, 'agDateInput');
    }

    public newHeaderComponent(params: IHeaderParams): AgPromise<IHeaderComp> | null {
        return this.createAndInitUserComponent(params.column.getColDef(), params, HeaderComponent, 'agColumnHeader');
    }

    public newHeaderGroupComponent(params: IHeaderGroupParams): AgPromise<IHeaderGroupComp> | null {
        return this.createAndInitUserComponent(
            params.columnGroup.getColGroupDef(), params, HeaderGroupComponent, 'agColumnGroupHeader');
    }

    public newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.createAndInitUserComponent(this.gridOptions.groupRowRendererParams, params, InnerRendererComponent, null, true);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public newFullWidthCellRenderer(
        params: ICellRendererParams, cellRendererType: string, cellRendererName: string): AgPromise<ICellRendererComp> | null {
        return this.createAndInitUserComponent(
            null,
            params,
            { propertyName: cellRendererType, isCellRenderer: () => true },
            cellRendererName);
    }

    public newCellRenderer(
        target: ColDef | IRichCellEditorParams,
        params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.createAndInitUserComponent(target, params, CellRendererComponent, null, true);
    }

    public getCellRendererDetails(defObject: ColDef | IRichCellEditorParams, params: ICellRendererParams): any {
        return this.getCompDetails(defObject, CellRendererComponent.propertyName, params);
    }

    public newCellEditor(colDef: ColDef, params: ICellEditorParams): AgPromise<ICellEditorComp> | null {
        return this.createAndInitUserComponent(colDef, params, CellEditorComponent, 'agCellEditor');
    }

    public newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.createAndInitUserComponent(target, params, InnerRendererComponent, null);
    }

    public newLoadingOverlayComponent(params: ILoadingOverlayParams): AgPromise<ILoadingOverlayComp> | null {
        return this.createAndInitUserComponent(this.gridOptions, params, LoadingOverlayComponent, 'agLoadingOverlay');
    }

    public newNoRowsOverlayComponent(params: INoRowsOverlayParams): AgPromise<INoRowsOverlayComp> | null {
        return this.createAndInitUserComponent(this.gridOptions, params, NoRowsOverlayComponent, 'agNoRowsOverlay');
    }

    public newTooltipComponent(params: ITooltipParams): AgPromise<ITooltipComp> | null {
        return this.createAndInitUserComponent(params.colDef, params, TooltipComponent, 'agTooltipComponent');
    }

    public newFilterComponent(def: IFilterDef, params: IFilterParams, defaultFilter: string): AgPromise<IFilterComp> | null {
        return this.createAndInitUserComponent(def, params, FilterComponent, defaultFilter, false);
    }

    public newSetFilterCellRenderer(
        target: ISetFilterParams, params: ISetFilterCellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.createAndInitUserComponent(target, params, CellRendererComponent, null, true);
    }

    public newFloatingFilterComponent(
        def: IFilterDef, params: IFloatingFilterParams, defaultFloatingFilter: string | null): AgPromise<IFloatingFilterComp> | null {
        return this.createAndInitUserComponent(def, params, FloatingFilterComponent, defaultFloatingFilter, true);
    }

    public newToolPanelComponent(toolPanelDef: ToolPanelDef, params: IToolPanelParams): AgPromise<IToolPanelComp> | null {
        return this.createAndInitUserComponent(toolPanelDef, params, ToolPanelComponent);
    }

    public newStatusPanelComponent(def: StatusPanelDef, params: IStatusPanelParams): AgPromise<IStatusPanelComp> | null {
        return this.createAndInitUserComponent(def, params, StatusPanelComponent);
    }

    public getCompDetails(defObject: DefinitionObject, propName: string, params: ICellRendererParams, mandatory = false): ComponentAndParams | null {
        const compClassDef = this.lookupComponentClassDef(defObject, propName, params);
        if (!compClassDef || !compClassDef.component) {
            if (mandatory) {
                this.logComponentMissing(defObject, propName);
            }
            return null;
        }
        const paramsMerged = this.mergeParmsWithApplicationProvidedParams(
            defObject, propName, params, compClassDef.paramsFromSelector);

        return {
            component: compClassDef.component,
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
    public createAndInitUserComponent<A extends IComponent<TParams>, TParams>(
        definitionObject: DefinitionObject | null,
        paramsFromGrid: TParams,
        componentType: ComponentType,
        defaultComponentName?: string | null,
        // optional items are: FloatingFilter, CellComp (for cellRenderer)
        optional = false,
    ): AgPromise<A> | null {
        if (!definitionObject) {
            definitionObject = this.gridOptions;
        }

        // Create the component instance
        const componentAndParams: { componentInstance: A, paramsFromSelector: TParams; } | null
            = this.createComponentInstance(definitionObject, componentType, paramsFromGrid, defaultComponentName, optional);

        if (!componentAndParams) {
            return null;
        }

        const componentInstance = componentAndParams.componentInstance;

        // Wire the component and call the init method with the correct params
        const params = this.mergeParmsWithApplicationProvidedParams(
            definitionObject, componentType.propertyName, paramsFromGrid, componentAndParams.paramsFromSelector);

        this.addReactHacks(params);

        const deferredInit = this.initComponent(componentInstance, params);

        if (deferredInit == null) {
            return AgPromise.resolve(componentInstance);
        }
        return (deferredInit as AgPromise<void>).then(() => componentInstance);
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
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    public createUserComponentFromConcreteClass<A extends IComponent<TParams>, TParams>(
        clazz: { new(): A; }, agGridParams: TParams): A {
        const internalComponent = new clazz();

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
    public lookupComponentClassDef(
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

    private lookupFromRegisteredComponents<A extends IComponent<TParams> & B, B, TParams>(
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
                component: registeredComponent.component as { new(): B; },
                componentFromFramework: true,
                source: ComponentSource.REGISTERED_BY_NAME,
                paramsFromSelector: null
            };
        }

        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component)) {
            return {
                component: registeredComponent.component as { new(): A; },
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
    public mergeParmsWithApplicationProvidedParams<TParams>(
        definitionObject: DefinitionObject,
        propertyName: string,
        paramsFromGrid: TParams,
        paramsFromSelector: any = null): TParams {
        const params = {} as TParams;

        mergeDeep(params, paramsFromGrid);

        const userParams: TParams = definitionObject ? (definitionObject as any)[propertyName + "Params"] : null;

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
        holder: DefinitionObject,
        componentType: ComponentType,
        paramsForSelector: any,
        defaultComponentName: string | null | undefined,
        optional: boolean
    ): { componentInstance: any, paramsFromSelector: any; } | null {
        const propertyName = componentType.propertyName;

        const componentToUse =
            this.lookupComponentClassDef(holder, propertyName, paramsForSelector, defaultComponentName);

        if (!componentToUse || !componentToUse.component) {
            if (!optional) {
                this.logComponentMissing(holder, propertyName, defaultComponentName);
            }
            return null;
        }

        let componentInstance: any;

        if (componentToUse.componentFromFramework) {
            // Using framework component
            const FrameworkComponentRaw: any = componentToUse.component;
            const thisComponentConfig: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
            componentInstance = this.frameworkComponentWrapper.wrap(
                FrameworkComponentRaw,
                thisComponentConfig.mandatoryMethodList,
                thisComponentConfig.optionalMethodList,
                componentType,
                defaultComponentName
            );
        } else {
            // Using plain JavaScript component
            componentInstance = new componentToUse.component!();
        }

        return { componentInstance: componentInstance, paramsFromSelector: componentToUse.paramsFromSelector };
    }

    private initComponent<A extends IComponent<TParams>, TParams>(component: A, params: TParams): AgPromise<void> | void {
        this.context.createBean(component);

        if (component.init == null) {
            return;
        }

        return component.init(params);
    }
}
