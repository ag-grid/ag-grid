import { AgCheckbox } from './agCheckbox';
import { IInputField } from './agAbstractInputField';

export class AgToggleButton extends AgCheckbox {
    constructor(config?: IInputField) {
        super(config, 'ag-toggle-button');
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);

        this.addOrRemoveCssClass('ag-selected', this.getValue()!);

        return this;
    }
}
