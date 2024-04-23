import { AgAbstractInputField, AgInputFieldParams } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
export interface AgCheckboxParams extends AgInputFieldParams {
    readOnly?: boolean;
    passive?: boolean;
}
export declare class AgCheckbox<TConfig extends AgCheckboxParams = AgCheckboxParams> extends AgAbstractInputField<HTMLInputElement, boolean, TConfig> {
    protected labelAlignment: LabelAlignment;
    private selected?;
    private readOnly;
    private passive;
    constructor(config?: TConfig, className?: string, inputType?: string);
    protected postConstruct(): void;
    protected addInputListeners(): void;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    isReadOnly(): boolean;
    setReadOnly(readOnly: boolean): void;
    setDisabled(disabled: boolean): this;
    toggle(): void;
    getValue(): boolean | undefined;
    setValue(value?: boolean, silent?: boolean): this;
    setName(name: string): this;
    protected isSelected(): boolean | undefined;
    private setSelected;
    private dispatchChange;
    private onCheckboxClick;
    private refreshSelectedClass;
}
