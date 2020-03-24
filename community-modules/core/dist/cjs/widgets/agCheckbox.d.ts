// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
import { EventService } from '../eventService';
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
export declare class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected labelAlignment: LabelAlignment;
    protected gridOptionsWrapper: GridOptionsWrapper;
    protected eventService: EventService;
    private selected;
    private readOnly;
    private passive;
    constructor();
    protected addInputListeners(): void;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    isReadOnly(): boolean;
    setReadOnly(readOnly: boolean): void;
    setDisabled(disabled: boolean): this;
    toggle(): void;
    getValue(): boolean;
    setValue(value: boolean | undefined, silent?: boolean): this;
    setName(name: string): this;
    protected isSelected(): boolean;
    private setSelected;
    protected dispatchChange(selected?: boolean, event?: MouseEvent): void;
    private onCheckboxClick;
    private refreshSelectedClass;
}
