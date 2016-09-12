// ag-grid-react v5.5.0
import { BaseFrameworkFactory, ColDef, ICellRenderer, ICellRendererFunc } from 'ag-grid';
export declare class ReactFrameworkFactory extends BaseFrameworkFactory {
    private agGridReact;
    constructor(agGridReact: any);
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
}
