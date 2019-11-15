import { AgCheckbox } from './agCheckbox';

export class AgRadioButton extends AgCheckbox {
    protected className = 'ag-radio-button';
    protected nativeInputClassName = 'ag-native-radio-button';
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
        const prop = this.getValue() ? 'selected' : 'unselected';
        const readOnlyStr = this.isReadOnly() ? 'ReadOnly' : '';
        return `${this.iconMap[prop]}${readOnlyStr}`;
    }
}
