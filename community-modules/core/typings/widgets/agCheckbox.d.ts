import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
export declare class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected className: string;
    protected nativeInputClassName: string;
    protected displayTag: string;
    protected inputType: string;
    protected labelAlignment: LabelAlignment;
    protected iconMap: {
        selected: string;
        unselected: string;
        indeterminate?: string;
    };
    protected gridOptionsWrapper: GridOptionsWrapper;
    private selected;
    private readOnly;
    private passive;
    protected eIconEl: HTMLElement;
    constructor();
    protected postConstruct(): void;
    protected addInputListeners(): void;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    isReadOnly(): boolean;
    setReadOnly(readOnly: boolean): void;
    toggle(): void;
    getValue(): boolean;
    setValue(value: boolean | undefined, silent?: boolean): this;
    protected isSelected(): boolean;
    protected setSelected(selected?: boolean, silent?: boolean): void;
    protected getIconName(): string;
    protected updateIcons(): void;
    private dispatchChange;
    private addIconsPlaceholder;
    private onClick;
    private onCheckboxClick;
}
