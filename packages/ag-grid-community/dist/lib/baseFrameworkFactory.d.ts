// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    } | undefined;
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditorComp;
    } | string | undefined;
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string | undefined;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    setTimeout(action: any, timeout?: any): void;
}
//# sourceMappingURL=baseFrameworkFactory.d.ts.map