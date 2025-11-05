import { RefPlaceholder } from '../../../agStack/interfaces/agComponent';
import type { AgInputTextFieldParams } from '../../../agStack/widgets/agInputTextField';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { AgComponentSelectorType } from '../../../widgets/component';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';

export class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private eInput: GridInputTextField = RefPlaceholder;
    private onValueChanged: (e: KeyboardEvent) => void = () => {};

    constructor(private readonly params?: { config?: AgInputTextFieldParams<AgComponentSelectorType> }) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        this.eInput = this.createManagedBean(new AgInputTextField(this.params?.config));

        const eInput = this.eInput.getGui();

        parentElement.appendChild(eInput);

        const listener = (e: KeyboardEvent) => this.onValueChanged(e);
        this.addManagedListeners(eInput, {
            input: listener,
            keydown: listener,
        });
    }

    public setEditable(editable: boolean): void {
        this.eInput.setDisabled(!editable);
    }

    public getValue(): string | null | undefined {
        return this.eInput.getValue();
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.eInput.setValue(value, silent);
    }

    public setValueChangedListener(listener: (e: KeyboardEvent) => void): void {
        this.onValueChanged = listener;
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
        const { eInput } = this;
        eInput.setInputAriaLabel(ariaLabel);

        if (autoComplete !== undefined) {
            eInput.setAutoComplete(autoComplete);
        }

        eInput.toggleCss('ag-floating-filter-search-icon', !!placeholder);
        eInput.setInputPlaceholder(placeholder);
    }
}
