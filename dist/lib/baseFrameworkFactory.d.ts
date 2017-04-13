// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRendererFunc, ICellRendererComp } from "./rendering/cellRenderers/iCellRenderer";
import { ColDef } from "./entities/colDef";
import { GridOptions } from "./entities/gridOptions";
import { ICellEditorComp } from "./rendering/cellEditors/iCellEditor";
import { IFilterComp } from "./interfaces/iFilter";
import { IFrameworkFactory } from "./interfaces/iFrameworkFactory";
import { IDateComp } from "./rendering/dateComponent";
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export declare class BaseFrameworkFactory implements IFrameworkFactory {
    dateComponent(gridOptions: GridOptions): {
        new (): IDateComp;
    };
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
    setTimeout(action: any, timeout?: any): void;
}
