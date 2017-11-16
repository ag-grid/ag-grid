// Type definitions for ag-grid v14.2.0
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
export declare class ComponentRecipes {
    private componentResolver;
    private gridOptions;
    private gridOptionsWrapper;
    private filterManager;
    newDateComponent(params: IDateParams): Promise<IDateComp>;
    newHeaderComponent(params: IHeaderParams): Promise<IHeaderComp>;
    newHeaderGroupComponent(params: IHeaderGroupParams): Promise<IHeaderGroupComp>;
    private newFloatingFilterComponent<M>(type, colDef, params);
    newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>>(column: Column, params: IFloatingFilterParams<M, any>): Promise<IFloatingFilterWrapperComp<M, any, any, any>>;
    newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): Promise<ICellRendererComp>;
    newCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): Promise<ICellRendererComp>;
    newFullRowGroupRenderer(params: ICellRendererParams): Promise<ICellRendererComp>;
    private getFilterComponentPrototype<A, B>(colDef);
    private newEmptyFloatingFilterWrapperComponent(column);
}
