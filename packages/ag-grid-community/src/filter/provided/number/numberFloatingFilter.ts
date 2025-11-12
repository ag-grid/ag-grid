import { AgInputNumberField } from '../../../agStack/widgets/agInputNumberField';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { INumberFloatingFilterParams, NumberFilterModel, NumberFilterParams } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { NumberFilterModelFormatter } from './numberFilterModelFormatter';
import { getAllowedCharPattern } from './numberFilterUtils';

class FloatingFilterNumberInputService extends BeanStub implements FloatingFilterInputService {
    private eTextInput: GridInputTextField;
    private eNumberInput: GridInputNumberField;
    private onValueChanged: (e: KeyboardEvent) => void = () => {};

    private numberInputActive = true;

    public setupGui(parentElement: HTMLElement): void {
        this.eNumberInput = this.createManagedBean(new AgInputNumberField());
        this.eTextInput = this.createManagedBean(new AgInputTextField());

        this.eTextInput.setDisabled(true);

        const eNumberInput = this.eNumberInput.getGui();
        const eTextInput = this.eTextInput.getGui();

        parentElement.appendChild(eNumberInput);
        parentElement.appendChild(eTextInput);

        this.setupListeners(eNumberInput, (e) => this.onValueChanged(e));
        this.setupListeners(eTextInput, (e) => this.onValueChanged(e));
    }

    public setEditable(editable: boolean): void {
        this.numberInputActive = editable;
        this.eNumberInput.setDisplayed(this.numberInputActive);
        this.eTextInput.setDisplayed(!this.numberInputActive);
    }

    public setAutoComplete(autoComplete: boolean | string): void {
        this.eNumberInput.setAutoComplete(autoComplete);
        this.eTextInput.setAutoComplete(autoComplete);
    }

    public getValue(): string | null | undefined {
        return this.getActiveInputElement().getValue();
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.getActiveInputElement().setValue(value, silent);
    }

    private getActiveInputElement(): GridInputTextField | GridInputNumberField {
        return this.numberInputActive ? this.eNumberInput : this.eTextInput;
    }

    public setValueChangedListener(listener: (e: KeyboardEvent) => void): void {
        this.onValueChanged = listener;
    }

    private setupListeners(element: HTMLElement, listener: (e: KeyboardEvent) => void): void {
        this.addManagedListeners(element, {
            input: listener,
            keydown: listener,
        });
    }

    public setParams({
        ariaLabel,
        autoComplete,
        placeholder,
    }: {
        ariaLabel: string;
        autoComplete?: boolean | string;
        placeholder?: string;
    }): void {
        this.setAriaLabel(ariaLabel);

        if (autoComplete !== undefined) {
            this.setAutoComplete(autoComplete);
        }

        this.setPlaceholder(this.eNumberInput, placeholder);
        this.setPlaceholder(this.eTextInput, placeholder);
    }

    private setPlaceholder(input: GridInputTextField | GridInputNumberField, placeholder?: string): void {
        input.toggleCss('ag-floating-filter-search-icon', !!placeholder);
        input.setInputPlaceholder(placeholder);
    }

    private setAriaLabel(ariaLabel: string): void {
        this.eNumberInput.setInputAriaLabel(ariaLabel);
        this.eTextInput.setInputAriaLabel(ariaLabel);
    }
}

export class NumberFloatingFilter extends TextInputFloatingFilter<INumberFloatingFilterParams, NumberFilterModel> {
    protected readonly FilterModelFormatterClass = NumberFilterModelFormatter;
    private allowedCharPattern: string | null;
    protected readonly filterType = 'number';
    protected readonly defaultOptions = DEFAULT_NUMBER_FILTER_OPTIONS;

    protected override updateParams(params: INumberFloatingFilterParams): void {
        const allowedCharPattern = getAllowedCharPattern(params.filterParams as NumberFilterParams);
        if (allowedCharPattern !== this.allowedCharPattern) {
            this.recreateFloatingFilterInputService(params);
        }
        super.updateParams(params);
    }

    protected createFloatingFilterInputService(params: INumberFloatingFilterParams): FloatingFilterInputService {
        this.allowedCharPattern = getAllowedCharPattern(params.filterParams as NumberFilterParams);
        if (this.allowedCharPattern) {
            // need to use text input
            return this.createManagedBean(
                new FloatingFilterTextInputService({
                    config: { allowedCharPattern: this.allowedCharPattern },
                })
            );
        }
        return this.createManagedBean(new FloatingFilterNumberInputService());
    }

    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        return value ? (Number(value) as TValue) : null;
    }
}
