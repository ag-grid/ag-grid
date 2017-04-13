// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColDef } from "../entities/colDef";
import { ICellRendererFunc, ICellRendererComp } from "../rendering/cellRenderers/iCellRenderer";
import { ICellEditorComp } from "../rendering/cellEditors/iCellEditor";
import { IFilterComp } from "./iFilter";
import { GridOptions } from "../entities/gridOptions";
export interface IFrameworkFactory {
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditorComp;
    } | string;
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** Because Angular 2 uses Zones, you should not use setTimout(). So to get around this, we allow the framework
     * to specify how to execute setTimeout. The default is to just call the browser setTimeout(). */
    setTimeout(action: any, timeout?: any): void;
}
