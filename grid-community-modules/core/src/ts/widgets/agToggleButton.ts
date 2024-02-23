import { AgCheckbox, AgCheckboxParams } from './agCheckbox';

export interface AgToggleButtonParams extends AgCheckboxParams {}

export class AgToggleButton extends AgCheckbox<AgToggleButtonParams> {
    constructor(config?: AgToggleButtonParams) {
        super(config, 'ag-toggle-button');
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);

        this.addOrRemoveCssClass('ag-selected', this.getValue()!);

        return this;
    }
}
