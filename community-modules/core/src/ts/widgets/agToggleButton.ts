import { AgRadioButton } from './agRadioButton';
import { addOrRemoveCssClass } from '../utils/dom';

export class AgToggleButton extends AgRadioButton {
    protected className = 'ag-toggle-button';
    protected inputType = 'checkbox';

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);
        addOrRemoveCssClass(this.getGui(), 'ag-selected', this.getValue());

        return this;
    }
}
