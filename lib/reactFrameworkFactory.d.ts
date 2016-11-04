// ag-grid-react v6.3.0
import { IFrameworkFactory, IFilter, ColDef, ICellRenderer, ICellRendererFunc, GridOptions, ICellEditor } from 'ag-grid';
export declare class ReactFrameworkFactory implements IFrameworkFactory {
    private agGridReact;
    private baseFrameworkFactory;
    constructor(agGridReact: any);
    colDefFilter(colDef: ColDef): {
        new (): IFilter;
    } | string;
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditor;
    } | string;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
}
