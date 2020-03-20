import { GridOptions } from "../../entities/gridOptions";
import { IComponent } from "../../interfaces/iComponent";
import { ColDef, ColGroupDef } from "../../entities/colDef";
import { AgGridRegisteredComponentInput } from "./userComponentRegistry";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { ToolPanelDef } from "../../entities/sideBar";
import { Promise } from "../../utils";
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
export declare type DefinitionObject = GridOptions | ColDef | ColGroupDef | ISetFilterParams | IRichCellEditorParams | ToolPanelDef | StatusPanelDef;
export declare type AgComponentPropertyInput<A extends IComponent<any>> = AgGridRegisteredComponentInput<A> | string | boolean;
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
export interface ComponentClassDef<A extends IComponent<any> & B, B> {
    component: {
        new (): A;
    } | {
        new (): B;
    };
    componentFromFramework: boolean;
    source: ComponentSource;
    paramsFromSelector: any;
}
export interface ModifyParamsCallback {
    (params: any, component: IComponent<any>): void;
}
export declare class UserComponentFactory {
    private gridOptions;
    private gridOptionsWrapper;
    private context;
    private agComponentUtils;
    private componentMetadataProvider;
    private userComponentRegistry;
    private frameworkComponentWrapper;
    newDateComponent(params: IDateParams): Promise<IDateComp>;
    newHeaderComponent(params: IHeaderParams): Promise<IHeaderComp>;
    newHeaderGroupComponent(params: IHeaderGroupParams): Promise<IHeaderGroupComp>;
    newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): Promise<ICellRendererComp>;
    newFullWidthCellRenderer(params: any, cellRendererType: string, cellRendererName: string): Promise<ICellRendererComp>;
    newCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newPinnedRowCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newCellEditor(colDef: ColDef, params: any): Promise<ICellEditorComp>;
    newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newLoadingOverlayComponent(params: any): Promise<ILoadingOverlayComp>;
    newNoRowsOverlayComponent(params: any): Promise<INoRowsOverlayComp>;
    newTooltipComponent(params: ITooltipParams): Promise<ITooltipComp>;
    newFilterComponent(colDef: ColDef, params: IFilterParams, defaultFilter: string, modifyParamsCallback: ModifyParamsCallback): Promise<IFilterComp>;
    newFloatingFilterComponent(colDef: ColDef, params: any, defaultFloatingFilter: string): Promise<IFloatingFilterComp>;
    newToolPanelComponent(toolPanelDef: ToolPanelDef, params: any): Promise<IToolPanelComp>;
    newStatusPanelComponent(def: StatusPanelDef, params: any): Promise<IToolPanelComp>;
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
    private createAndInitUserComponent;
    private addReactHacks;
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param clazz: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by ag-Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    createUserComponentFromConcreteClass<P, A extends IComponent<P>>(clazz: {
        new (): A;
    }, agGridParams: P): A;
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
    lookupComponentClassDef<A extends IComponent<any> & B, B>(definitionObject: DefinitionObject, propertyName: string, params?: any, defaultComponentName?: string): ComponentClassDef<A, B>;
    private lookupFromRegisteredComponents;
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
    createFinalParams(definitionObject: DefinitionObject, propertyName: string, paramsFromGrid: any, paramsFromSelector?: any): any;
    private createComponentInstance;
    private initComponent;
}
