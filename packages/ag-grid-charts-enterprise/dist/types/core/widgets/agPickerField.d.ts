import { AgAbstractField, AgFieldParams } from "./agAbstractField";
import { Component } from "./component";
import { PopupService } from "./popupService";
export interface AgPickerFieldParams extends AgFieldParams {
    pickerType: string;
    pickerGap?: number;
    /**
     * If true, will set min-width and max-width (if present), and will set width to wrapper element width.
     * If false, will set min-width, max-width and width to maxPickerWidth or wrapper element width.
     */
    variableWidth?: boolean;
    minPickerWidth?: number | string;
    maxPickerWidth?: number | string;
    maxPickerHeight?: number | string;
    pickerAriaLabelKey: string;
    pickerAriaLabelValue: string;
    template?: string;
    className?: string;
    pickerIcon?: string;
    ariaRole?: string;
    modalPicker?: boolean;
    inputWidth?: number | 'flex';
}
export declare abstract class AgPickerField<TValue, TConfig extends AgPickerFieldParams = AgPickerFieldParams, TComponent extends Component = Component> extends AgAbstractField<TValue, TConfig> {
    protected abstract createPickerComponent(): TComponent;
    protected pickerComponent: TComponent | undefined;
    protected isPickerDisplayed: boolean;
    protected maxPickerHeight: string | undefined;
    protected variableWidth: boolean;
    protected minPickerWidth: string | undefined;
    protected maxPickerWidth: string | undefined;
    protected value: TValue;
    private skipClick;
    private pickerGap;
    private hideCurrentPicker;
    private destroyMouseWheelFunc;
    private ariaRole?;
    protected popupService: PopupService;
    protected readonly eLabel: HTMLElement;
    protected readonly eWrapper: HTMLElement;
    protected readonly eDisplayField: HTMLElement;
    private readonly eIcon;
    constructor(config?: TConfig);
    protected postConstruct(): void;
    protected setupAria(): void;
    private onLabelOrWrapperMouseDown;
    protected onKeyDown(e: KeyboardEvent): void;
    showPicker(): void;
    protected renderAndPositionPicker(): (() => void);
    protected alignPickerToComponent(): void;
    protected beforeHidePicker(): void;
    protected toggleExpandedStyles(expanded: boolean): void;
    private onPickerFocusIn;
    private onPickerFocusOut;
    private togglePickerHasFocus;
    hidePicker(): void;
    setInputWidth(width: number | 'flex'): this;
    getFocusableElement(): HTMLElement;
    setPickerGap(gap: number): this;
    setPickerMinWidth(width?: number | string): this;
    setPickerMaxWidth(width?: number | string): this;
    setPickerMaxHeight(height?: number | string): this;
    protected destroy(): void;
}
