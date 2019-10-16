import { AgRadioButton } from "./agRadioButton";
import { _ } from "../utils";

export class AgToggleButton extends AgRadioButton {
    protected className = 'ag-toggle-button';

    protected postConstruct() {
        super.postConstruct();
        _.addCssClass(this.eIconEl, 'ag-icon');
    }

    protected updateIcons(): void {
        const value = this.getValue();
        _.addOrRemoveCssClass(this.eIconEl, 'ag-icon-toggle-on', value);
        _.addOrRemoveCssClass(this.eIconEl, 'ag-icon-toggle-off', !value);
    }

    public setValue(value: boolean, silent?: boolean): this {
        super.setValue(value, silent);
        _.addOrRemoveCssClass(this.getGui(), 'ag-selected', this.getValue());

        return this;
    }
}