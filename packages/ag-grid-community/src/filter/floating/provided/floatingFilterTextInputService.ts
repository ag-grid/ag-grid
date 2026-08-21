import { RefPlaceholder, _getActiveDomElement } from 'ag-stack';

import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';

export class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private eInput: GridInputTextField = RefPlaceholder;
    private onValueChanged: (e: KeyboardEvent) => void = () => {};
    private onValueCleared: () => void = () => {};

    /** A hook, not the pattern itself: importing the guard here would put it in the text filter's bundle. */
    constructor(private readonly onInputCreated?: (field: GridInputTextField) => void) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        const field = this.createManagedBean<GridInputTextField>(
            new AgInputTextField({
                clearButton: true,
                onValueClear: () => this.onValueCleared(),
            })
        );
        this.eInput = field;

        this.onInputCreated?.(field);

        const eInput = field.getGui();

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

    public isFocused(): boolean {
        return _getActiveDomElement(this.beans) === this.eInput.getInputElement();
    }

    public getValue(): string | null | undefined {
        return this.eInput.getValue();
    }

    public getInputText(): string {
        return this.eInput.getInputElement().value;
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.eInput.setValue(value, silent);
    }

    public setValueChangedListener(listener: (e: KeyboardEvent) => void): void {
        this.onValueChanged = listener;
    }

    public setValueClearedListener(listener: () => void): void {
        this.onValueCleared = listener;
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

        eInput.setAutoComplete(autoComplete);

        eInput.setSearchIcon(!!placeholder);
        eInput.setInputPlaceholder(placeholder);
    }
}
