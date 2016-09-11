
import {Bean} from "./context/context";
import {ICellRenderer, ICellRendererFunc} from "./rendering/cellRenderers/iCellRenderer";
import {ColDef} from "./entities/colDef";

/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
@Bean('baseFrameworkFactory')
export class BaseFrameworkFactory {

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.floatingCellRenderer;
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return colDef.cellRenderer;
    }

}
