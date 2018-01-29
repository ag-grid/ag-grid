// ag-grid-enterprise v16.0.1
import { Component, CellRendererService, ColDef } from "ag-grid/main";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private columnDef;
    constructor(columnDef: ColDef);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    private populateWithoutRenderer(value, valueFormatted);
    private populateWithRenderer(value, valueFormatted);
}
