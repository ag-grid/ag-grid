// Type definitions for ag-grid-community v20.2.0
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
    constructor();
    private preConstruct;
    private postConstruct;
    setLabel(label: string): void;
    private loadIcons;
    private onClick;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    setReadOnly(readOnly: boolean): void;
    isReadOnly(): boolean;
    isSelected(): boolean;
    toggle(): void;
    setSelected(selected: boolean | null): void;
    private updateIcons;
}
