import {ICellRenderer, ICellRendererFunc, ICellRendererComp} from "./rendering/cellRenderers/iCellRenderer";
import {ColDef} from "./entities/colDef";
import {GridOptions} from "./entities/gridOptions";
import {ICellEditorComp} from "./rendering/cellEditors/iCellEditor";
import {IFilterComp} from "./interfaces/iFilter";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {IDateComp} from "./rendering/dateComponent";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class BaseFrameworkFactory implements IFrameworkFactory {
    public dateComponent(gridOptions: GridOptions): {new():IDateComp} {
        return gridOptions.dateComponent;
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return colDef.floatingCellRenderer;
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return colDef.cellRenderer;
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditorComp} | string {
        return colDef.cellEditor;
    }

    public colDefFilter(colDef: ColDef): {new(): IFilterComp} | string {
        return colDef.filter;
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return gridOptions.fullWidthCellRenderer;
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return gridOptions.groupRowRenderer;
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        return gridOptions.groupRowInnerRenderer;
    }

    public setTimeout(action: any, timeout?: any): void {
        setTimeout(action, timeout);
    }
}
