// ag-grid-react v13.3.0
import { IFrameworkFactory, ColDef, ICellRendererComp, ICellRendererFunc, IFilterComp, GridOptions, ICellEditorComp } from 'ag-grid';
export declare class ReactFrameworkFactory implements IFrameworkFactory {
    private agGridReact;
    private baseFrameworkFactory;
    constructor(agGridReact: any);
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditorComp;
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
