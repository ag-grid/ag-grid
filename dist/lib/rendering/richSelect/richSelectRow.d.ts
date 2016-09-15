// ag-grid-enterprise v6.0.1
import { Component, CellRendererService, ICellRendererFunc, ICellRenderer } from "ag-grid/main";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private cellRenderer;
    constructor(cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string);
    setState(value: any, selected: boolean): void;
    private populateWithoutRenderer(value);
    private populateWithRenderer(value);
}
