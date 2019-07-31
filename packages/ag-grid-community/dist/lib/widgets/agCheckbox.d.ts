// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgEvent } from "../events";
import { AgAbstractInputField } from "./agAbstractInputField";
import { LabelAlignment } from "./agAbstractLabel";
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
export declare class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected labelAlignment: LabelAlignment;
    protected iconMap: {
        selected: string;
        unselected: string;
        indeterminate?: string;
    };
    private gridOptionsWrapper;
    private selected;
    private readOnly;
    private passive;
    protected eIconEl: HTMLElement;
    constructor();
    protected postConstruct(): void;
    protected addInputListeners(): void;
    private addIconsPlaceholder;
    private onClick;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    setReadOnly(readOnly: boolean): void;
    isReadOnly(): boolean;
    protected isSelected(): boolean;
    toggle(): void;
    protected setSelected(selected?: boolean, silent?: boolean): void;
    protected getIconName(): string;
    protected updateIcons(): void;
    getValue(): boolean;
    setValue(value: boolean | undefined, silent?: boolean): this;
}
