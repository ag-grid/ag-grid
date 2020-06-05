import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
export declare class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected className: string;
    protected displayTag: string;
    protected inputType: string;
    protected labelAlignment: LabelAlignment;
    protected gridOptionsWrapper: GridOptionsWrapper;
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
