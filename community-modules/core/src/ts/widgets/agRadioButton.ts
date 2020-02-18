import { AgCheckbox } from './agCheckbox';

export class AgRadioButton extends AgCheckbox {
    protected className = 'ag-radio-button';
    protected inputType = 'radio';

    protected isSelected(): boolean {
        return this.eInput.checked;
    }

    public toggle(): void {
        const nextValue = this.getNextValue();
        this.setValue(nextValue);
    }

    public setName(name: string): this {
        const input = this.getInputElement() as HTMLInputElement;
        input.name = name;

        return this;
    }
}
