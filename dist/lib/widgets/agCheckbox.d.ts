// Type definitions for ag-grid v5.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "./component";
export declare class AgCheckbox extends Component {
    static EVENT_CHANGED: string;
    private static TEMPLATE;
    private gridOptionsWrapper;
    private eChecked;
    private eUnchecked;
    private eIndeterminate;
    private eLabel;
    private selected;
    private readOnly;
    private passive;
    constructor();
    private init();
    private loadIcons();
    private onClick();
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    setReadOnly(readOnly: boolean): void;
    isReadOnly(): boolean;
    isSelected(): boolean;
    toggle(): void;
    setSelected(selected: boolean): void;
    private updateIcons();
}
