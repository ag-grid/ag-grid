// ag-grid-enterprise v19.0.0
import { Component, CellRendererService, ColDef } from "ag-grid-community";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private columnDef;
    constructor(columnDef: ColDef);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
}
