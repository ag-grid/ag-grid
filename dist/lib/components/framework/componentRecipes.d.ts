// Type definitions for ag-grid v13.3.1
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
export declare class ComponentRecipes {
    private componentResolver;
    private gridOptions;
    private gridOptionsWrapper;
    private filterManager;
    newDateComponent(params: IDateParams): IDateComp;
    newHeaderComponent(params: IHeaderParams): IHeaderComp;
    newHeaderGroupComponent(params: IHeaderGroupParams): IHeaderGroupComp;
    private newFloatingFilterComponent<M>(type, colDef, params);
    newFloatingFilterWrapperComponent<M, P extends IFloatingFilterParams<M, any>>(column: Column, params: IFloatingFilterParams<M, any>): IFloatingFilterWrapperComp<M, any, any, any>;
    newFullWidthGroupRowInnerCellRenderer(params: ICellRendererParams): ICellRendererComp;
    newCellRenderer(target: ColDef | ISetFilterParams, params: ICellRendererParams): ICellRendererComp;
    newInnerCellRenderer(target: GroupCellRendererParams, params: ICellRendererParams): ICellRendererComp;
    newFullRowGroupRenderer(params: ICellRendererParams): ICellRendererComp;
    private getFilterComponentPrototype<A, B>(colDef);
    private newEmptyFloatingFilterWrapperComponent(column);
}
