import { AgCheckbox } from "./agCheckbox";
import { _ } from "../utils";

export class AgRadioButton extends AgCheckbox {

    protected className = 'ag-radio-button';
    protected inputType = 'radio';
    protected iconMap = {
        selected: 'radioButtonOn',
        unselected: 'radioButtonOff'
    };

    public toggle(): void {
        const nextValue = this.getNextValue();
        this.setValue(nextValue);
    }

    protected getIconName(): string {
        const value = this.getValue();
        const prop = value ? 'selected' : 'unselected';
        const readOnlyStr = this.isReadOnly() ? 'ReadOnly' : '';
        return `${this.iconMap[prop]}${readOnlyStr}`;
    }
}
