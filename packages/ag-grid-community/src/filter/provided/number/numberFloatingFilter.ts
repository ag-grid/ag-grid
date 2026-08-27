import { _getActiveDomElement } from 'ag-stack';

import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { installAllowedCharPattern } from '../allowedCharPattern';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import type {
    INumberFilterParams,
    INumberFloatingFilterParams,
    NumberFilterModel,
    NumberFilterParams,
} from './iNumberFilter';
import { NumberFilterModelFormatter } from './numberFilterModelFormatter';
import { getAllowedCharPattern, processNumberFilterValue, stringToFloat, usesTextInput } from './numberFilterUtils';

class FloatingFilterNumberInputService extends BeanStub implements FloatingFilterInputService {
    private eTextInput: GridInputTextField;
    private eNumberInput: GridInputNumberField;
    private onValueChanged: (e: KeyboardEvent) => void = () => {};
    private onValueCleared: () => void = () => {};

    private numberInputActive = true;

    /** Matches the text service: a hook, so the guard is imported by the filters that offer it. */
    constructor(private readonly onInputCreated?: (field: GridInputNumberField) => void) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        const numberField = this.createManagedBean<GridInputNumberField>(
            new AgInputNumberField({
                clearButton: true,
                onValueClear: () => this.onValueCleared(),
            })
        );
        this.eNumberInput = numberField;
        this.onInputCreated?.(numberField);

        const textField = this.createManagedBean<GridInputTextField>(
            new AgInputTextField({ clearButton: true, onValueClear: () => this.onValueCleared() })
        );
        this.eTextInput = textField;
        // Never typed into: it stands in for the number input while the filter is not editable.
        textField.setDisabled(true);

        const eNumberInput = numberField.getGui();
        const eTextInput = textField.getGui();

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

    public setAutoComplete(autoComplete?: boolean | string): void {
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

    public setValueClearedListener(listener: () => void): void {
        this.onValueCleared = listener;
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

        this.setAutoComplete(autoComplete);

        this.setPlaceholder(this.eNumberInput, placeholder);
        this.setPlaceholder(this.eTextInput, placeholder);
    }

    private setPlaceholder(input: GridInputTextField | GridInputNumberField, placeholder?: string): void {
        input.setSearchIcon(!!placeholder);
        input.setInputPlaceholder(placeholder);
    }

    private setAriaLabel(ariaLabel: string): void {
        this.eNumberInput.setInputAriaLabel(ariaLabel);
        this.eTextInput.setInputAriaLabel(ariaLabel);
    }
}

export class NumberFloatingFilter extends TextInputFloatingFilter<INumberFloatingFilterParams, NumberFilterModel> {
    private allowedCharPattern: string | null;
    private isTextInput: boolean;
    protected readonly filterType = 'number';

    protected createModelFormatter(
        filterConfig: ResolvedSimpleFilterConfig,
        filterParams: INumberFilterParams
    ): NumberFilterModelFormatter {
        return new NumberFilterModelFormatter(filterConfig, filterParams);
    }

    protected override updateParams(params: INumberFloatingFilterParams): void {
        const filterParams = params.filterParams as NumberFilterParams;
        const allowedCharPattern = getAllowedCharPattern(filterParams);
        if (allowedCharPattern !== this.allowedCharPattern || usesTextInput(filterParams) !== this.isTextInput) {
            this.recreateFloatingFilterInputService(params);
        }
        super.updateParams(params);
    }

    protected createFloatingFilterInputService(params: INumberFloatingFilterParams): FloatingFilterInputService {
        const filterParams = params.filterParams as NumberFilterParams;
        this.allowedCharPattern = getAllowedCharPattern(filterParams);
        const isTextInput = usesTextInput(filterParams);
        this.isTextInput = isTextInput;
        // Read for these params rather than from the field: a recreate runs before the base has taken them on.
        const pattern = this.beans.filterConfigSvc!.getSimple(params.column, filterParams, 'number').allowedCharPattern;
        const install = (el: GridInputTextField | GridInputNumberField) => installAllowedCharPattern(el, pattern);
        return this.createManagedBean(
            isTextInput ? new FloatingFilterTextInputService(install) : new FloatingFilterNumberInputService(install)
        );
    }

    /** Read back through `numberParser`, which is the only thing that can read what a `numberFormatter` wrote. */
    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        const { gos, params } = this;
        const numberParser = (params.filterParams as NumberFilterParams | undefined)?.numberParser;
        return processNumberFilterValue(stringToFloat(numberParser, value, gos, params.column)) as TValue | null;
    }
}
