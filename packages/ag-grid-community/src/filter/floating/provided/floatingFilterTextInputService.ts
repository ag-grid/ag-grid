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

    /**
     * Sets up the text input and IME-aware value change listeners.
     * During composition we suppress sync so the parent filter is not updated
     * with intermediate text. We trigger sync once on compositionend and ignore
     * the immediately following input event to avoid double application.
     */
    public setupGui(parentElement: HTMLElement): void {
        this.eInput = this.createManagedBean(new AgInputTextField(this.params?.config));
        const eInput = this.eInput.getGui();
        parentElement.appendChild(eInput);

        let isComposing = false;
        let skipNextInputEvent = false;

        const handleValueChange = (e: KeyboardEvent | InputEvent) => {
            if (isComposing) {
                return;
            }
            if (skipNextInputEvent && e.type === 'input') {
                skipNextInputEvent = false;
                return;
            }
            skipNextInputEvent = false;
            this.onValueChanged(e as KeyboardEvent);
        };

        this.addManagedElementListeners(eInput, {
            compositionstart: () => {
                isComposing = true;
                skipNextInputEvent = false;
            },
            compositionend: (e: CompositionEvent) => {
                isComposing = false;
                skipNextInputEvent = true;
                this.onValueChanged(e as unknown as KeyboardEvent);
            },
            input: handleValueChange,
            keydown: handleValueChange,
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
