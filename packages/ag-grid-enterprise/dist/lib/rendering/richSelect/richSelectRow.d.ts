// ag-grid-enterprise v21.2.2
import { Component, IRichCellEditorParams } from "ag-grid-community";
export declare class RichSelectRow extends Component {
    private userComponentFactory;
    private gridOptionsWrapper;
    private readonly params;
    constructor(params: IRichCellEditorParams);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
}
