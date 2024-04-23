import { IFloatingFilterParams } from '../floatingFilter';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { AgInputTextFieldParams } from '../../../widgets/agInputTextField';
import { TextFilter, TextFilterModel } from '../../provided/text/textFilter';
import { NumberFilter, NumberFilterModel } from '../../provided/number/numberFilter';
import { BeanStub } from '../../../context/beanStub';
export interface FloatingFilterInputService {
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    setValueChangedListener(listener: (e: KeyboardEvent) => void): void;
    setParams(params: {
        ariaLabel: string;
        autoComplete?: boolean | string;
    }): void;
}
export declare class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private params?;
    private eFloatingFilterTextInput;
    private valueChangedListener;
    constructor(params?: {
        config?: AgInputTextFieldParams | undefined;
    } | undefined);
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    setAutoComplete(autoComplete: boolean | string): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    setValueChangedListener(listener: (e: KeyboardEvent) => void): void;
    setParams(params: {
        ariaLabel: string;
        autoComplete?: boolean | string;
    }): void;
    private setAriaLabel;
}
export interface ITextInputFloatingFilterParams extends IFloatingFilterParams<TextFilter | NumberFilter> {
    /**
     * Overrides the browser's autocomplete/autofill behaviour by updating the autocomplete attribute on the input field used in the floating filter input.
     * Possible values are:
     * - `true` to allow the **default** browser autocomplete/autofill behaviour.
     * - `false` to disable the browser autocomplete/autofill behavior by setting the `autocomplete` attribute to `off`.
     * - A **string** to be used as the [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) attribute value.
     * Some browsers do not respect setting the HTML attribute `autocomplete="off"` and display the auto-fill prompts anyway.
     * @default false
     */
    browserAutoComplete?: boolean | string;
}
type ModelUnion = TextFilterModel | NumberFilterModel;
export declare abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    private readonly eFloatingFilterInputContainer;
    private floatingFilterInputService;
    protected params: ITextInputFloatingFilterParams;
    private applyActive;
    protected abstract createFloatingFilterInputService(params: ITextInputFloatingFilterParams): FloatingFilterInputService;
    private postConstruct;
    protected getDefaultDebounceMs(): number;
    onParentModelChanged(model: M, event: FilterChangedEvent): void;
    init(params: ITextInputFloatingFilterParams): void;
    private setupFloatingFilterInputService;
    private setTextInputParams;
    onParamsUpdated(params: ITextInputFloatingFilterParams): void;
    refresh(params: ITextInputFloatingFilterParams): void;
    protected recreateFloatingFilterInputService(params: ITextInputFloatingFilterParams): void;
    private syncUpWithParentFilter;
    protected setEditable(editable: boolean): void;
}
export {};
