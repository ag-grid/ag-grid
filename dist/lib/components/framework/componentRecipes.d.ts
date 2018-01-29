// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IDateComp, IDateParams } from "../../rendering/dateComponent";
import { ColDef } from "../../entities/colDef";
import { IHeaderGroupComp, IHeaderGroupParams } from "../../headerRendering/headerGroup/headerGroupComp";
import { IHeaderComp, IHeaderParams } from "../../headerRendering/header/headerComp";
import { IFloatingFilterParams } from "../../filter/floatingFilter";
import { IFloatingFilterWrapperComp } from "../../filter/floatingFilterWrapper";
import { Column } from "../../entities/column";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRenderer";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { Promise } from "../../utils";
import { IOverlayWrapperComp } from "../../rendering/overlays/overlayWrapperComponent";
import { ILoadingOverlayComp } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../../rendering/overlays/noRowsOverlayComponent";
export declare class ComponentRecipes {
    private componentResolver;
    private gridOptions;
    private gridApi;
    private columnApi;
    private gridOptionsWrapper;
    private filterManager;
    private static filterToFloatingFilterNames;
    newDateComponent(params: IDateParams): Promise<IDateComp>;
    newHeaderComponent(params: IHeaderParams): Promise<IHeaderComp>;
    newHeaderGroupComponent(params: IHeaderGroupParams): Promise<IHeaderGroupComp>;
    newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>>(column: Column, params: IFloatingFilterParams<M, any>): IFloatingFilterWrapperComp<M, any, any, any>;
    newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): Promise<ICellRendererComp>;
    newCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newFullRowGroupRenderer(params: ICellRendererParams): Promise<ICellRendererComp>;
    newOverlayWrapperComponent(): IOverlayWrapperComp;
    newLoadingOverlayComponent(): Promise<ILoadingOverlayComp>;
    newNoRowsOverlayComponent(): Promise<INoRowsOverlayComp>;
    private getFilterComponentPrototype<A, B>(colDef);
    private newEmptyFloatingFilterWrapperComponent(column);
}
