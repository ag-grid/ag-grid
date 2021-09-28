import { GridOptions } from "../../entities/gridOptions";
import { ColDef, ColGroupDef } from "../../entities/colDef";
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
import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { IToolPanelComp, IToolPanelParams } from "../../interfaces/iToolPanel";
import { IStatusPanelComp, IStatusPanelParams, StatusPanelDef } from "../../interfaces/iStatusPanel";
import { ComponentType } from "./componentTypes";
import { BeanStub } from "../../context/beanStub";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRendererCtrl";
import { IHeaderGroupParams } from "../../headerRendering/cells/columnGroup/headerGroupComp";
import { IHeaderParams } from "../../headerRendering/cells/column/headerComp";
export declare type DefinitionObject = GridOptions | ColDef | ColGroupDef | IFilterDef | ISetFilterParams | IRichCellEditorParams | ToolPanelDef | StatusPanelDef;
export interface UserCompDetails {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
}
export declare class UserComponentFactory extends BeanStub {
    private readonly gridOptions;
    private readonly agComponentUtils;
    private readonly componentMetadataProvider;
    private readonly userComponentRegistry;
    private readonly frameworkComponentWrapper;
    getHeaderCompDetails(colDef: ColDef, params: IHeaderParams): UserCompDetails | undefined;
    getHeaderGroupCompDetails(params: IHeaderGroupParams): UserCompDetails | undefined;
    getFullWidthCellRendererDetails(params: ICellRendererParams, cellRendererType: string, cellRendererName: string): UserCompDetails | undefined;
    getInnerRendererDetails(def: GroupCellRendererParams, params: ICellRendererParams): UserCompDetails | undefined;
    getFullWidthGroupRowInnerCellRenderer(def: any, params: ICellRendererParams): UserCompDetails | undefined;
    getCellRendererDetails(def: ColDef | IRichCellEditorParams, params: ICellRendererParams): UserCompDetails | undefined;
    getCellEditorDetails(def: ColDef, params: ICellEditorParams): UserCompDetails | undefined;
    newCellRenderer(def: ColDef | IRichCellEditorParams, params: ICellRendererParams): AgPromise<ICellRendererComp> | null;
    newDateComponent(params: IDateParams): AgPromise<IDateComp> | null;
    newLoadingOverlayComponent(params: ILoadingOverlayParams): AgPromise<ILoadingOverlayComp> | null;
    newNoRowsOverlayComponent(params: INoRowsOverlayParams): AgPromise<INoRowsOverlayComp> | null;
    newTooltipComponent(params: ITooltipParams): AgPromise<ITooltipComp> | null;
    newFilterComponent(def: IFilterDef, params: IFilterParams, defaultFilter: string): AgPromise<IFilterComp> | null;
    newSetFilterCellRenderer(def: ISetFilterParams, params: ISetFilterCellRendererParams): AgPromise<ICellRendererComp> | null;
    newFloatingFilterComponent(def: IFilterDef, params: IFloatingFilterParams, defaultFloatingFilter: string | null): AgPromise<IFloatingFilterComp> | null;
    newToolPanelComponent(toolPanelDef: ToolPanelDef, params: IToolPanelParams): AgPromise<IToolPanelComp> | null;
    newStatusPanelComponent(def: StatusPanelDef, params: IStatusPanelParams): AgPromise<IStatusPanelComp> | null;
    private lookupComponent;
    createInstanceFromCompDetails(compDetails: UserCompDetails, defaultComponentName?: string | null): AgPromise<any> | null;
    /**
     * This method creates a component given everything needed to guess what sort of component needs to be instantiated
     * It takes
     *  @param CompClass: The class to instantiate,
     *  @param agGridParams: Params to be passed to the component and passed by AG Grid. This will get merged with any params
     *      specified by the user in the configuration
     *  @param modifyParamsCallback: A chance to customise the params passed to the init method. It receives what the current
     *  params are and the component that init is about to get called for
     */
    createUserComponentFromConcreteClass(CompClass: any, agGridParams: any): any;
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
    mergeParamsWithApplicationProvidedParams(definitionObject: DefinitionObject, propertyName: string, paramsFromGrid: any, paramsFromSelector?: any): any;
    private getCompDetails;
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
    private lookupAndCreateComponent;
    private addReactHacks;
    private logComponentMissing;
    private createComponentInstance;
    private initComponent;
}
