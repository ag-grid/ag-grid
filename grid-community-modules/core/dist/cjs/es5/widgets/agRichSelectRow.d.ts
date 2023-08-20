// Type definitions for @ag-grid-community/core v30.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RichSelectParams } from "./agRichSelect";
import { Component } from "./component";
export declare class RichSelectRow<TValue> extends Component {
    private readonly params;
    private readonly wrapperEl;
    private value;
    private userComponentFactory;
    constructor(params: RichSelectParams<TValue>, wrapperEl: HTMLElement);
    private postConstruct;
    setState(value: TValue, selected: boolean): void;
    updateHighlighted(highlighted: boolean): void;
    private populateWithoutRenderer;
    private populateWithRenderer;
    private onMouseUp;
}
