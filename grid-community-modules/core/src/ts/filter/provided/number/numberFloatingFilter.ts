import { getAllowedCharPattern, NumberFilter, NumberFilterModel, NumberFilterModelFormatter } from './numberFilter';
import { FloatingFilterInputService, FloatingFilterTextInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';

class FloatingFilterNumberInputService extends BeanStub implements FloatingFilterInputService {
    private eFloatingFilterTextInput: AgInputTextField;
    private eFloatingFilterNumberInput: AgInputNumberField;

    private numberInputActive = true;

    constructor(private readonly params: { ariaLabel: string }) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        this.eFloatingFilterNumberInput = this.createManagedBean(new AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField());

        this.eFloatingFilterTextInput.setDisabled(true);
        this.eFloatingFilterNumberInput.setInputAriaLabel(this.params.ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);

        parentElement.appendChild(this.eFloatingFilterNumberInput.getGui());
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }

    setEditable(editable: boolean): void {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    }

    getValue(): string | null | undefined {
        return this.getActiveInputElement().getValue();
    }

    setValue(value: string | null | undefined, silent?: boolean): void {
        this.getActiveInputElement().setValue(value, silent);
    }

    private getActiveInputElement(): AgInputTextField | AgInputNumberField {
        return this.numberInputActive ? this.eFloatingFilterNumberInput : this.eFloatingFilterTextInput;
    }

    addValueChangedListener(listener: () => void): void {
        this.setupListeners(this.eFloatingFilterNumberInput.getGui(), listener);
        this.setupListeners(this.eFloatingFilterTextInput.getGui(), listener);
    }

    private setupListeners(element: HTMLElement, listener: () => void): void {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keypress', listener);
        this.addManagedListener(element, 'keydown', listener);
    }
}

export class NumberFloatingFilter extends TextInputFloatingFilter<NumberFilterModel> {
    private filterModelFormatter: SimpleFilterModelFormatter;

    public init(params: IFloatingFilterParams<NumberFilter>): void {
        super.init(params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }

    protected createFloatingFilterInputService(ariaLabel: string): FloatingFilterInputService {
        const allowedCharPattern = getAllowedCharPattern(this.params.filterParams);
        if (allowedCharPattern) {
            // need to sue text input
            return this.createManagedBean(new FloatingFilterTextInputService({
                config: { allowedCharPattern },
                ariaLabel
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService({ ariaLabel }));
    }
}
