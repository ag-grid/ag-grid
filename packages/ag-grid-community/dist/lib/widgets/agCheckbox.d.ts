// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
import { AgEvent } from "../events";
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
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
    private props;
    constructor();
    private preConstruct;
    private postConstruct;
    private loadIcons;
    private onClick;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    setReadOnly(readOnly: boolean): void;
    isReadOnly(): boolean;
    isSelected(): boolean;
    toggle(): void;
    setSelected(selected: boolean): void;
    private updateIcons;
}
//# sourceMappingURL=agCheckbox.d.ts.map