import { addOrRemoveCssClass } from '../utils/dom';
import { AgCheckbox } from './agCheckbox';

export class AgToggleButton extends AgCheckbox {
    constructor() {
        super('ag-toggle-button');
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);

        addOrRemoveCssClass(this.getGui(), 'ag-selected', this.getValue());

        return this;
    }
}
