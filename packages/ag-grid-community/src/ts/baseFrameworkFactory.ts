import { ICellRendererFunc, ICellRendererComp } from "./rendering/cellRenderers/iCellRenderer";
import { ColDef } from "./entities/colDef";
import { GridOptions } from "./entities/gridOptions";
import { ICellEditorComp } from "./interfaces/iCellEditor";
import { IFilterComp } from "./interfaces/iFilter";
import { IFrameworkFactory } from "./interfaces/iFrameworkFactory";
import { IDateComp } from "./rendering/dateComponent";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class BaseFrameworkFactory implements IFrameworkFactory {
    public dateComponent(gridOptions: GridOptions): string | {new():IDateComp} | undefined {
        return gridOptions.dateComponent;
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string | undefined {
        return colDef.pinnedRowCellRenderer;
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string | undefined {
        return colDef.cellRenderer;
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditorComp} | string | undefined {
        return colDef.cellEditor;
    }

    public colDefFilter(colDef: ColDef): {new(): IFilterComp} | string | boolean | undefined {
        return colDef.filter;
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string | undefined {
        return gridOptions.fullWidthCellRenderer;
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string | undefined {
        return gridOptions.groupRowRenderer;
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string | undefined {
        return gridOptions.groupRowInnerRenderer;
    }

    public setTimeout(action: any, timeout?: any): void {
        window.setTimeout(action, timeout);
    }
}
