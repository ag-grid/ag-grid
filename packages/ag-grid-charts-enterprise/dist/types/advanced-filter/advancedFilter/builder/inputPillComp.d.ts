import { Component } from "ag-grid-community";
export declare class InputPillComp extends Component {
    private readonly params;
    private ePill;
    private eLabel;
    private advancedFilterExpressionService;
    private eEditor;
    private value;
    constructor(params: {
        value: string;
        cssClass: string;
        type: 'text' | 'number' | 'date';
        ariaLabel: string;
    });
    private postConstruct;
    getFocusableElement(): HTMLElement;
    private showEditor;
    private createEditorComp;
    private hideEditor;
    private renderValue;
    private updateValue;
}
