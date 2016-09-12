
import {Bean} from "./context/context";
import {ICellRenderer, ICellRendererFunc} from "./rendering/cellRenderers/iCellRenderer";
import {ColDef} from "./entities/colDef";
import {GridOptions} from "./entities/gridOptions";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
@Bean('baseFrameworkFactory')
export class BaseFrameworkFactory {

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.floatingCellRenderer;
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.cellRenderer;
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
