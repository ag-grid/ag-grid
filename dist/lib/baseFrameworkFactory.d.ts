// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRenderer, ICellRendererFunc } from "./rendering/cellRenderers/iCellRenderer";
import { ColDef } from "./entities/colDef";
import { GridOptions } from "./entities/gridOptions";
import { ICellEditor } from "./rendering/cellEditors/iCellEditor";
import { IFilter } from "./interfaces/iFilter";
import { IFrameworkFactory } from "./interfaces/iFrameworkFactory";
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export declare class BaseFrameworkFactory implements IFrameworkFactory {
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditor;
    } | string;
    colDefFilter(colDef: ColDef): {
        new (): IFilter;
    } | string;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    setTimeout(action: any, timeout?: any): void;
}
