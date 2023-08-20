import { AgAbstractField } from "./agAbstractField";
import { Component } from "./component";
import { IAgLabelParams } from './agAbstractLabel';
import { PopupService } from "./popupService";
export interface IPickerFieldParams extends IAgLabelParams {
    pickerType: string;
    pickerGap?: number;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
}
export declare abstract class AgPickerField<TValue, TConfig extends IPickerFieldParams = IPickerFieldParams, TComponent extends Component = Component> extends AgAbstractField<TValue, TConfig> {
    private readonly pickerIcon?;
    protected abstract createPickerComponent(): TComponent;
    protected pickerComponent: TComponent | undefined;
    protected isPickerDisplayed: boolean;
    private skipClick;
    private pickerGap;
    private hideCurrentPicker;
    private destroyMouseWheelFunc;
    protected value: TValue;
    protected popupService: PopupService;
    protected readonly eLabel: HTMLElement;
    protected readonly eWrapper: HTMLElement;
    protected readonly eDisplayField: HTMLElement;
    private readonly eIcon;
    constructor(config?: TConfig, className?: string, pickerIcon?: string | undefined, ariaRole?: string);
    protected postConstruct(): void;
    protected refreshLabel(): void;
    private clickHandler;
    protected onKeyDown(e: KeyboardEvent): void;
    showPicker(): void;
    protected renderAndPositionPicker(): (() => void);
    protected beforeHidePicker(): void;
    protected toggleExpandedStyles(expanded: boolean): void;
    private onPickerFocusIn;
    private onPickerFocusOut;
    private togglePickerHasFocus;
    hidePicker(): void;
    setAriaLabel(label: string): this;
    setInputWidth(width: number | 'flex'): this;
    getFocusableElement(): HTMLElement;
    setPickerGap(gap: number): this;
    protected destroy(): void;
}
