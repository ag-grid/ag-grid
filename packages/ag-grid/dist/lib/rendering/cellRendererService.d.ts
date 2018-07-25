// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { ColDef } from "../entities/colDef";
import { GroupCellRendererParams } from "./cellRenderers/groupCellRenderer";
import { Promise } from "../utils";
/** Class to use a cellRenderer. */
export declare class CellRendererService {
    private componentRecipes;
    private componentResolver;
    private gridOptionsWrapper;
    useCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): Promise<ICellRendererComp>;
    useFilterCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): Promise<ICellRendererComp>;
    useRichSelectCellRenderer(target: ColDef, eTarget: HTMLElement, params: any): Promise<ICellRendererComp>;
    useInnerCellRenderer(target: GroupCellRendererParams, originalColumn: ColDef, eTarget: HTMLElement, params: any): Promise<ICellRendererComp>;
    useFullWidthGroupRowInnerCellRenderer(eTarget: HTMLElement, params: any): Promise<ICellRendererComp>;
    bindToHtml(cellRendererPromise: Promise<ICellRendererComp>, eTarget: HTMLElement): Promise<ICellRendererComp>;
}
