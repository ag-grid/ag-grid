import { AgCheckbox } from './agCheckbox';

export class AgRadioButton extends AgCheckbox {
    protected className = 'ag-radio-button';
    protected inputType = 'radio';

    public toggle(): void {
        const nextValue = this.getNextValue();
        this.setValue(nextValue);
    }
}
