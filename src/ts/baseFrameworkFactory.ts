import {ICellRenderer, ICellRendererFunc} from "./rendering/cellRenderers/iCellRenderer";
import {ColDef} from "./entities/colDef";
import {GridOptions} from "./entities/gridOptions";
import {ICellEditor} from "./rendering/cellEditors/iCellEditor";
import {IFilter} from "./interfaces/iFilter";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
export class BaseFrameworkFactory implements IFrameworkFactory {

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.floatingCellRenderer;
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.cellRenderer;
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string {
        return colDef.cellEditor;
    }

    public colDefFilter(colDef: ColDef): {new(): IFilter} | string {
        return colDef.filter;
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return gridOptions.fullWidthCellRenderer;
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return gridOptions.groupRowRenderer;
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return gridOptions.groupRowInnerRenderer;
    }

}
