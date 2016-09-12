import {BaseFrameworkFactory, ColDef, ICellRenderer, ICellRendererFunc, Utils} from 'ag-grid';

export class ReactFrameworkFactory extends BaseFrameworkFactory {

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return super.colDefFloatingCellRenderer(colDef);
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {

        if (Utils.exists(colDef.cellRendererFmk)) {

        } else {
            return super.colDefCellRenderer(colDef);
        }

    }

}