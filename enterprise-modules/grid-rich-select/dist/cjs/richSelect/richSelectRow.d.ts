import { Component, IRichCellEditorParams } from "@ag-community/grid-core";
export declare class RichSelectRow extends Component {
    private userComponentFactory;
    private gridOptionsWrapper;
    private readonly params;
    constructor(params: IRichCellEditorParams);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
}
