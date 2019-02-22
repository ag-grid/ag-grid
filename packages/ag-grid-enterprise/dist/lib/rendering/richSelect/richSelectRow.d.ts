// ag-grid-enterprise v20.1.0
import { Component, CellRendererService, IRichCellEditorParams } from "ag-grid-community";
export declare class RichSelectRow extends Component {
    cellRendererService: CellRendererService;
    private params;
    constructor(params: IRichCellEditorParams);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
}
