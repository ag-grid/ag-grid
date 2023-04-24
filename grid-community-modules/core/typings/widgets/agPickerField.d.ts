import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { IAgLabel } from './agAbstractLabel';
export declare abstract class AgPickerField<TElement extends HTMLElement, TValue> extends AgAbstractField<TValue> {
    private readonly pickerIcon?;
    abstract showPicker(): Component;
    protected value: TValue;
    protected isPickerDisplayed: boolean;
    protected isDestroyingPicker: boolean;
    private skipClick;
    private pickerComponent;
    protected readonly eLabel: HTMLElement;
    protected readonly eWrapper: HTMLElement;
    protected readonly eDisplayField: TElement;
    private readonly eIcon;
    constructor(config?: IAgLabel, className?: string, pickerIcon?: string | undefined, ariaRole?: string);
    protected postConstruct(): void;
    protected refreshLabel(): void;
    setAriaLabel(label: string): this;
    setInputWidth(width: number | 'flex'): this;
    getFocusableElement(): HTMLElement;
}
