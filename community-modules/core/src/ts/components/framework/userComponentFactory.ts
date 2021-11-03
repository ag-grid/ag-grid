import { Autowired, Bean, Optional } from "../../context/context";
import { GridOptions } from "../../entities/gridOptions";
import { FrameworkComponentWrapper } from "./frameworkComponentWrapper";
import { ColDef, ColGroupDef, CellEditorSelectorFunc, CellRendererSelectorFunc, CellEditorSelectorResult } from "../../entities/colDef";
import { UserComponentRegistry } from "./userComponentRegistry";
import { AgComponentUtils } from "./agComponentUtils";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ToolPanelDef } from "../../entities/sideBar";
import { AgPromise } from "../../utils";
import { IDateComp, IDateParams } from "../../rendering/dateComponent";
import { ICellRendererComp, ICellRendererParams, ISetFilterCellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
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
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRendererCtrl";
import { IHeaderGroupComp, IHeaderGroupParams } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { IHeaderComp, IHeaderParams } from "../../headerRendering/cells/column/headerComp";

export type DefinitionObject =
    GridOptions
    | ColDef
    | ColGroupDef
    | IFilterDef
    | ISetFilterParams
    | IRichCellEditorParams
    | ToolPanelDef
    | StatusPanelDef;

export interface UserCompDetails {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
}

@Bean('userComponentFactory')
export class UserComponentFactory extends BeanStub {
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('agComponentUtils') private readonly agComponentUtils: AgComponentUtils;
    @Autowired('componentMetadataProvider') private readonly componentMetadataProvider: ComponentMetadataProvider;
    @Autowired('userComponentRegistry') private readonly userComponentRegistry: UserComponentRegistry;
    @Optional('frameworkComponentWrapper') private readonly frameworkComponentWrapper: FrameworkComponentWrapper;

    //////// NEW (after React UI)

    public getHeaderCompDetails(colDef: ColDef, params: IHeaderParams): UserCompDetails | undefined {
        return this.getCompDetails(colDef, HeaderComponent, 'agColumnHeader', params);
    }

    public getHeaderGroupCompDetails(params: IHeaderGroupParams): UserCompDetails | undefined {
        const colGroupDef = params.columnGroup.getColGroupDef()!;
        return this.getCompDetails(colGroupDef, HeaderGroupComponent, 'agColumnGroupHeader', params);
    }

    // this one is unusual, as it can be LoadingCellRenderer, DetailCellRenderer, FullWidthCellRenderer or GroupRowRenderer.
    // so we have to pass the type in.
    public getFullWidthCellRendererDetails(params: ICellRendererParams, cellRendererType: string, cellRendererName: string): UserCompDetails | undefined {
        return this.getCompDetails(this.gridOptions, { propertyName: cellRendererType, isCellRenderer: () => true }, cellRendererName, params);
    }

    // CELL RENDERER
    public getInnerRendererDetails(def: GroupCellRendererParams, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getFullWidthGroupRowInnerCellRenderer(def: any, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, InnerRendererComponent, null, params);
    }
    public getCellRendererDetails(def: ColDef | IRichCellEditorParams, params: ICellRendererParams): UserCompDetails | undefined {
        return this.getCompDetails(def, CellRendererComponent, null, params);
    }

    // CELL EDITOR
    public getCellEditorDetails(def: ColDef, params: ICellEditorParams): UserCompDetails | undefined {
        return this.getCompDetails(def, CellEditorComponent, 'agCellEditor', params, true);
    }

    // FILTER
    public getFilterDetails(def: IFilterDef, params: IFilterParams, defaultFilter: string): UserCompDetails | undefined {
        return this.getCompDetails(def, FilterComponent, defaultFilter, params, true);
    }


    ////////
    //////// OLD (before React UI)
    ////////

    // used by richSelectEditor
    public newCellRenderer(
        def: ColDef | IRichCellEditorParams,
        params: ICellRendererParams): AgPromise<ICellRendererComp> | null {
        return this.lookupAndCreateComponent(def, params, CellRendererComponent, null, true);
    }

    public newDateComponent(params: IDateParams): AgPromise<IDateComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, DateComponent, 'agDateInput');
    }

    public newLoadingOverlayComponent(params: ILoadingOverlayParams): AgPromise<ILoadingOverlayComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, LoadingOverlayComponent, 'agLoadingOverlay');
    }

    public newNoRowsOverlayComponent(params: INoRowsOverlayParams): AgPromise<INoRowsOverlayComp> | null {
        return this.lookupAndCreateComponent(this.gridOptions, params, NoRowsOverlayComponent, 'agNoRowsOverlay');
    }

    public newTooltipComponent(params: ITooltipParams): AgPromise<ITooltipComp> | null {
        return this.lookupAndCreateComponent(params.colDef!, params, TooltipComponent, 'agTooltipComponent');
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

    private lookupComponent(defObject: DefinitionObject, type: ComponentType,
        params: any = null, defaultComponentName?: string | null): UserCompDetails | null {

        const propertyName = type.propertyName;

        let paramsFromSelector: any;
        let comp: any;
        let frameworkComp: any;

        // pull from defObject if available
        if (defObject) {
            let defObjectAny = defObject as any;

            // if selector, use this
            const selectorFunc: CellEditorSelectorFunc | CellRendererSelectorFunc = defObjectAny[propertyName + 'Selector'];
            const selectorRes = selectorFunc ? selectorFunc(params) : null;
            if (selectorRes) {
                comp = selectorRes.component;
                frameworkComp = selectorRes.frameworkComponent;
                paramsFromSelector = selectorRes.params;
            } else {
                // if no selector, or result of selector is empty, take from defObject
                comp = defObjectAny[propertyName];
                frameworkComp = defObjectAny[propertyName + 'Framework'];
            }

            // for filters only, we allow 'true' for the component, which means default filter to be used
            if (comp === true) {
                comp = undefined;
            }
        }

        const lookupFromRegistry = (key: string) => {
            const item = this.userComponentRegistry.retrieve(key);
            if (item) {
                comp = !item.componentFromFramework ? item.component : undefined;
                frameworkComp = item.componentFromFramework ? item.component : undefined;
            } else {
                comp = undefined;
                frameworkComp = undefined;
            }
        };

        // if compOption is a string, means we need to look the item up
        if (typeof comp === 'string') {
            lookupFromRegistry(comp);
        }

        // if lookup brought nothing back, and we have a default, lookup the default
        if (comp == null && frameworkComp == null && defaultComponentName != null) {
            lookupFromRegistry(defaultComponentName);
        }

        // if we have a comp option, and it's a function, replace it with an object equivalent adaptor
        if (comp && !this.agComponentUtils.doesImplementIComponent(comp)) {
            comp = this.agComponentUtils.adaptFunction(propertyName, comp);
        }

        if (!comp && !frameworkComp) {
            return null;
        }

        return {
            componentFromFramework: comp == null,
            componentClass: comp ? comp : frameworkComp,
            params: paramsFromSelector,
            type: type
        };
    }

    public createInstanceFromCompDetails(compDetails: UserCompDetails, defaultComponentName?: string | null): AgPromise<any> | null {
        if (!compDetails) { return null; }

        const { params, componentClass, componentFromFramework } = compDetails;

        // Create the component instance
        const instance = this.createComponentInstance(compDetails.type, defaultComponentName, componentClass, componentFromFramework);
        if (!instance) { return null; }

        this.addReactHacks(params);

        const deferredInit = this.initComponent(instance, params);

        if (deferredInit == null) {
            return AgPromise.resolve(instance);
        }
        return (deferredInit as AgPromise<void>).then(() => instance);
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

    private getCompDetails(defObject: DefinitionObject, type: ComponentType, defaultName: string | null | undefined, params: any, mandatory = false): UserCompDetails | undefined {
        const propName = type.propertyName;
        const compDetails = this.lookupComponent(defObject, type, params, defaultName);
        if (!compDetails || !compDetails.componentClass) {
            if (mandatory) {
                this.logComponentMissing(defObject, propName);
            }
            return undefined;
        }

        const paramsMerged = this.mergeParamsWithApplicationProvidedParams(
            defObject, propName, params, compDetails.params);

        return { ...compDetails, params: paramsMerged };
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

        const compDetails = this.getCompDetails(
            def, componentType, defaultComponentName, paramsFromGrid, !optional);

        if (!compDetails) { return null; }

        return this.createInstanceFromCompDetails(compDetails, defaultComponentName);
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
        if (component.init == null) { return; }
        return component.init(params);
    }
}
