// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { ColDef } from "../entities/colDef";
import { GroupCellRendererParams } from "./cellRenderers/groupCellRenderer";
/** Class to use a cellRenderer. */
export declare class CellRendererService {
    private componentRecipes;
    private componentResolver;
    useCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): ICellRendererComp;
    useFilterCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): ICellRendererComp;
    useInnerCellRenderer(target: GroupCellRendererParams, originalColumn: ColDef, eTarget: HTMLElement, params: any): ICellRendererComp;
    useFullWidthGroupRowInnerCellRenderer(eTarget: HTMLElement, params: any): ICellRendererComp;
    bindToHtml(cellRenderer: ICellRendererComp, eTarget: HTMLElement): ICellRendererComp;
}
