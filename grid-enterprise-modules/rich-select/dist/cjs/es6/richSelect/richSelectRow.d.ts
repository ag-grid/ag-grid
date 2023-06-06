import { Component, IRichCellEditorParams } from "@ag-grid-community/core";
export declare class RichSelectRow extends Component {
    private userComponentFactory;
    private readonly params;
    constructor(params: IRichCellEditorParams);
    setState(value: any, valueFormatted: string, selected: boolean): void;
    updateSelected(selected: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
}
