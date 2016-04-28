// ag-grid-enterprise v4.1.4
import { Component, CellRendererService, ICellRendererFunc, ICellRenderer } from "ag-grid/main";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private cellRenderer;
    constructor(cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string);
    setState(value: any, selected: boolean): void;
}
