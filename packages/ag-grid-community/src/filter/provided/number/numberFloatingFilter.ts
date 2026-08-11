import { _getActiveDomElement } from 'ag-stack';

import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { INumberFloatingFilterParams, NumberFilterModel, NumberFilterParams } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { NumberFilterModelFormatter } from './numberFilterModelFormatter';
import { getAllowedCharPattern, processNumberFilterValue, stringToFloat, usesTextInput } from './numberFilterUtils';

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

    public isFocused(): boolean {
        return _getActiveDomElement(this.beans) === this.getActiveInputElement().getInputElement();
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

    public getInputText(): string {
        return this.getActiveInputElement().getInputElement().value;
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
    private usesTextInput: boolean;
    protected readonly filterType = 'number';
    protected readonly options = DEFAULT_NUMBER_FILTER_OPTIONS;

    protected override updateParams(params: INumberFloatingFilterParams): void {
        const filterParams = params.filterParams as NumberFilterParams;
        const allowedCharPattern = getAllowedCharPattern(filterParams);
        if (allowedCharPattern !== this.allowedCharPattern || usesTextInput(filterParams) !== this.usesTextInput) {
            this.recreateFloatingFilterInputService(params);
        }
        super.updateParams(params);
    }

    protected createFloatingFilterInputService(params: INumberFloatingFilterParams): FloatingFilterInputService {
        const filterParams = params.filterParams as NumberFilterParams;
        const allowedCharPattern = getAllowedCharPattern(filterParams);
        this.allowedCharPattern = allowedCharPattern;
        this.usesTextInput = usesTextInput(filterParams);
        if (this.usesTextInput) {
            const config = allowedCharPattern ? { config: { allowedCharPattern } } : undefined;
            return this.createManagedBean(new FloatingFilterTextInputService(config));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService());
    }

    /** Read back through `numberParser`, which is the only thing that can read what a `numberFormatter` wrote. */
    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        const numberParser = this.getFilterParams()?.numberParser;
        return processNumberFilterValue(stringToFloat(numberParser, value)) as TValue | null;
    }

    private getFilterParams(): NumberFilterParams | undefined {
        return this.params.filterParams as NumberFilterParams | undefined;
    }
}
