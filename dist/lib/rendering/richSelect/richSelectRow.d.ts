// ag-grid-enterprise v12.0.2
import { Component, CellRendererService, ICellRendererFunc, ICellRendererComp } from "ag-grid/main";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private cellRenderer;
    constructor(cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string);
    setState(value: any, selected: boolean): void;
    private populateWithoutRenderer(value);
    private populateWithRenderer(value);
}
