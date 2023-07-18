import { getAllowedCharPattern, NumberFilter, NumberFilterModelFormatter } from './numberFilter.mjs';
import { FloatingFilterTextInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter.mjs';
import { AgInputNumberField } from '../../../widgets/agInputNumberField.mjs';
import { AgInputTextField } from '../../../widgets/agInputTextField.mjs';
import { BeanStub } from '../../../context/beanStub.mjs';
class FloatingFilterNumberInputService extends BeanStub {
    constructor(params) {
        super();
        this.params = params;
        this.numberInputActive = true;
    }
    setupGui(parentElement) {
        this.eFloatingFilterNumberInput = this.createManagedBean(new AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField());
        this.eFloatingFilterTextInput.setDisabled(true);
        this.eFloatingFilterNumberInput.setInputAriaLabel(this.params.ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterNumberInput.getGui());
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }
    setEditable(editable) {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    }
    getValue() {
        return this.getActiveInputElement().getValue();
    }
    setValue(value, silent) {
        this.getActiveInputElement().setValue(value, silent);
    }
    getActiveInputElement() {
        return this.numberInputActive ? this.eFloatingFilterNumberInput : this.eFloatingFilterTextInput;
    }
    addValueChangedListener(listener) {
        this.setupListeners(this.eFloatingFilterNumberInput.getGui(), listener);
        this.setupListeners(this.eFloatingFilterTextInput.getGui(), listener);
    }
    setupListeners(element, listener) {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keydown', listener);
    }
}
export class NumberFloatingFilter extends TextInputFloatingFilter {
    init(params) {
        super.init(params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getDefaultFilterOptions() {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService(ariaLabel) {
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
