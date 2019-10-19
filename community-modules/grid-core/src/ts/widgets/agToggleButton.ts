import { AgRadioButton } from './agRadioButton';
import { _ } from '../utils';

export class AgToggleButton extends AgRadioButton {
    protected className = 'ag-toggle-button';
    protected nativeInputClassName = 'ag-native-toggle-button';
    protected inputType = 'checkbox';

    protected postConstruct() {
        super.postConstruct();
        if (!this.gridOptionsWrapper.useNativeCheckboxes()) {
            _.addCssClass(this.eIconEl, 'ag-icon');
        }
    }

    protected updateIcons(): void {
        if (!this.gridOptionsWrapper.useNativeCheckboxes()) {
            const value = this.getValue();
            _.addOrRemoveCssClass(this.eIconEl, 'ag-icon-toggle-on', value);
            _.addOrRemoveCssClass(this.eIconEl, 'ag-icon-toggle-off', !value);
        }
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);
        _.addOrRemoveCssClass(this.getGui(), 'ag-selected', this.getValue());

        return this;
    }
}
