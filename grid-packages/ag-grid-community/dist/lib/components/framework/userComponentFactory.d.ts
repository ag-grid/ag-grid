import { GridOptions } from "../../entities/gridOptions";
import { IComponent } from "../../interfaces/iComponent";
import { ColDef, ColGroupDef } from "../../entities/colDef";
import { AgGridRegisteredComponentInput } from "./userComponentRegistry";
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
import { ComponentType } from "./componentTypes";
import { BeanStub } from "../../context/beanStub";
export declare type DefinitionObject = GridOptions | ColDef | ColGroupDef | IFilterDef | ISetFilterParams | IRichCellEditorParams | ToolPanelDef | StatusPanelDef;
export declare type AgComponentPropertyInput<A extends IComponent<TParams>, TParams> = AgGridRegisteredComponentInput<A> | string | boolean;
export declare enum ComponentSource {
    DEFAULT = 0,
    REGISTERED_BY_NAME = 1,
    HARDCODED = 2
}
export interface ComponentSelectorResult {
    component?: string;
    params?: any;
}
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface ComponentClassDef<A extends IComponent<TParams> & B, B, TParams> {
    component: {
        new (): A;
    } | {
        new (): B;
    } | null;
    componentFromFramework: boolean;
    source: ComponentSource;
    paramsFromSelector: TParams | null;
}
export declare class UserComponentFactory extends BeanStub {
    private readonly gridOptions;
    private readonly agComponentUtils;
    private readonly componentMetadataProvider;
    private readonly userComponentRegistry;
    private readonly frameworkComponentWrapper;
    newDateComponent(params: IDateParams): AgPromise<IDateComp> | null;
    newHeaderComponent(params: IHeaderParams): AgPromise<IHeaderComp> | null;
    newHeaderGroupComponent(params: IHeaderGroupParams): AgPromise<IHeaderGroupComp> | null;
    newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): AgPromise<ICellRendererComp> | null;
    newFullWidthCellRenderer(params: ICellRendererParams, cellRendererType: string, cellRendererName: string): AgPromise<ICellRendererComp> | null;
    newCellRenderer(target: ColDef | IRichCellEditorParams, params: ICellRendererParams, isPinned?: boolean): AgPromise<ICellRendererComp> | null;
    newCellEditor(colDef: ColDef, params: ICellEditorParams): AgPromise<ICellEditorComp> | null;
    newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): AgPromise<ICellRendererComp> | null;
    newLoadingOverlayComponent(params: ILoadingOverlayParams): AgPromise<ILoadingOverlayComp> | null;
    newNoRowsOverlayComponent(params: INoRowsOverlayParams): AgPromise<INoRowsOverlayComp> | null;
    newTooltipComponent(params: ITooltipParams): AgPromise<ITooltipComp> | null;
    newFilterComponent(def: IFilterDef, params: IFilterParams, defaultFilter: string): AgPromise<IFilterComp> | null;
    newSetFilterCellRenderer(target: ISetFilterParams, params: ISetFilterCellRendererParams): AgPromise<ICellRendererComp> | null;
    newFloatingFilterComponent(def: IFilterDef, params: IFloatingFilterParams, defaultFloatingFilter: string | null): AgPromise<IFloatingFilterComp> | null;
    newToolPanelComponent(toolPanelDef: ToolPanelDef, params: IToolPanelParams): AgPromise<IToolPanelComp> | null;
    newStatusPanelComponent(def: StatusPanelDef, params: IStatusPanelParams): AgPromise<IStatusPanelComp> | null;
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
    createAndInitUserComponent<A extends IComponent<TParams>, TParams>(definitionObject: DefinitionObject | null, paramsFromGrid: TParams, componentType: ComponentType, defaultComponentName?: string | null, optional?: boolean): AgPromise<A> | null;
    private addReactHacks;
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    createUserComponentFromConcreteClass<A extends IComponent<TParams>, TParams>(clazz: {
        new (): A;
    }, agGridParams: TParams): A;
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
    lookupComponentClassDef<A extends IComponent<TParams> & B, B, TParams>(definitionObject: DefinitionObject, propertyName: string, params?: TParams | null, defaultComponentName?: string | null): ComponentClassDef<A, B, TParams> | null;
    private lookupFromRegisteredComponents;
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
    createFinalParams<TParams>(definitionObject: DefinitionObject, propertyName: string, paramsFromGrid: TParams, paramsFromSelector?: any): TParams;
    private createComponentInstance;
    private initComponent;
}
