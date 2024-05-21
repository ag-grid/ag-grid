import { AgCheckboxParams } from '../interfaces/agFieldParams';
import { AgCheckbox } from './agCheckbox';
import { AgComponentSelector } from './component';

export interface AgToggleButtonParams extends AgCheckboxParams {}

export class AgToggleButton extends AgCheckbox<AgToggleButtonParams> {
    static selector: AgComponentSelector = 'AG-TOGGLE-BUTTON';

    constructor(config?: AgToggleButtonParams) {
        super(config, 'ag-toggle-button');
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);

        this.addOrRemoveCssClass('ag-selected', this.getValue()!);

        return this;
    }
}
