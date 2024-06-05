import { BeanStub } from '../../../context/beanStub';
import type { AgInputTextFieldParams } from '../../../widgets/agInputTextField';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { RefPlaceholder } from '../../../widgets/component';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';

export class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private eFloatingFilterTextInput: AgInputTextField = RefPlaceholder;
    private valueChangedListener: (e: KeyboardEvent) => void = () => {};

    constructor(private params?: { config?: AgInputTextFieldParams }) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField(this.params?.config));

        const eInput = this.eFloatingFilterTextInput.getGui();

        parentElement.appendChild(eInput);

        this.addManagedListener(eInput, 'input', (e: KeyboardEvent) => this.valueChangedListener(e));
        this.addManagedListener(eInput, 'keydown', (e: KeyboardEvent) => this.valueChangedListener(e));
    }

    public setEditable(editable: boolean): void {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    }

    public setAutoComplete(autoComplete: boolean | string): void {
        this.eFloatingFilterTextInput.setAutoComplete(autoComplete);
    }

    public getValue(): string | null | undefined {
        return this.eFloatingFilterTextInput.getValue();
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.eFloatingFilterTextInput.setValue(value, silent);
    }

    public setValueChangedListener(listener: (e: KeyboardEvent) => void): void {
        this.valueChangedListener = listener;
    }

    public setParams(params: { ariaLabel: string; autoComplete?: boolean | string }): void {
        this.setAriaLabel(params.ariaLabel);

        if (params.autoComplete !== undefined) {
            this.setAutoComplete(params.autoComplete);
        }
    }

    private setAriaLabel(ariaLabel: string): void {
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    }
}
