import { AgInputNumberField } from '../../../agStack/widgets/agInputNumberField';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigintFilterConstants';
import { BigIntFilterModelFormatter } from './bigintFilterModelFormatter';
import { getAllowedCharPattern } from './bigintFilterUtils';
import type { BigIntFilterModel, BigIntFilterParams, IBigIntFloatingFilterParams } from './iBigIntFilter';

class FloatingFilterBigIntInputService extends BeanStub implements FloatingFilterInputService {
    private eTextInput: GridInputTextField;
    private eBigIntInput: GridInputNumberField;
    private onValueChanged: (e: KeyboardEvent) => void = () => {};

    private numberInputActive = true;

    public setupGui(parentElement: HTMLElement): void {
        this.eBigIntInput = this.createManagedBean(new AgInputNumberField());
        this.eTextInput = this.createManagedBean(new AgInputTextField());

        this.eTextInput.setDisabled(true);

        const eBigIntInput = this.eBigIntInput.getGui();
        const eTextInput = this.eTextInput.getGui();

        parentElement.appendChild(eBigIntInput);
        parentElement.appendChild(eTextInput);

        this.setupListeners(eBigIntInput, (e) => this.onValueChanged(e));
        this.setupListeners(eTextInput, (e) => this.onValueChanged(e));
    }

    public setEditable(editable: boolean): void {
        this.numberInputActive = editable;
        this.eBigIntInput.setDisplayed(this.numberInputActive);
        this.eTextInput.setDisplayed(!this.numberInputActive);
    }

    public setAutoComplete(autoComplete: boolean | string): void {
        this.eBigIntInput.setAutoComplete(autoComplete);
        this.eTextInput.setAutoComplete(autoComplete);
    }

    public getValue(): string | null | undefined {
        return this.getActiveInputElement().getValue();
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.getActiveInputElement().setValue(value, silent);
    }

    private getActiveInputElement(): GridInputTextField | GridInputNumberField {
        return this.numberInputActive ? this.eBigIntInput : this.eTextInput;
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

        this.setPlaceholder(this.eBigIntInput, placeholder);
        this.setPlaceholder(this.eTextInput, placeholder);
    }

    private setPlaceholder(input: GridInputTextField, placeholder?: string): void {
        input.toggleCss('ag-floating-filter-search-icon', !!placeholder);
        input.setInputPlaceholder(placeholder);
    }

    private setAriaLabel(ariaLabel: string): void {
        this.eBigIntInput.setInputAriaLabel(ariaLabel);
        this.eTextInput.setInputAriaLabel(ariaLabel);
    }
}

export class BigIntFloatingFilter extends TextInputFloatingFilter<IBigIntFloatingFilterParams, BigIntFilterModel> {
    protected readonly FilterModelFormatterClass = BigIntFilterModelFormatter;
    private allowedCharPattern: string | null;
    protected readonly filterType = 'bigint';
    protected readonly defaultOptions = DEFAULT_BIGINT_FILTER_OPTIONS;

    protected override updateParams(params: IBigIntFloatingFilterParams): void {
        const allowedCharPattern = getAllowedCharPattern(params.filterParams as BigIntFilterParams);
        if (allowedCharPattern !== this.allowedCharPattern) {
            this.recreateFloatingFilterInputService(params);
        }
        super.updateParams(params);
    }

    protected createFloatingFilterInputService(params: IBigIntFloatingFilterParams): FloatingFilterInputService {
        this.allowedCharPattern = getAllowedCharPattern(params.filterParams as BigIntFilterParams);
        if (this.allowedCharPattern) {
            // need to use text input
            return this.createManagedBean(
                new FloatingFilterTextInputService({
                    config: { allowedCharPattern: this.allowedCharPattern },
                })
            );
        }
        return this.createManagedBean(new FloatingFilterBigIntInputService());
    }

    protected override convertValue<TValue>(value: string | null | undefined): TValue | null {
        return value != null ? (BigInt(value) as TValue) : null;
    }
}
