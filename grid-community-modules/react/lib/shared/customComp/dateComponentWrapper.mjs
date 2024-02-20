// @ag-grid-community/react v31.1.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class DateComponentWrapper extends CustomComponentWrapper {
    constructor() {
        super(...arguments);
        this.date = null;
        this.onDateChange = (date) => this.updateDate(date);
    }
    getDate() {
        return this.date;
    }
    setDate(date) {
        this.date = date;
        this.refreshProps();
    }
    refresh(params) {
        this.sourceParams = params;
        this.refreshProps();
    }
    getOptionalMethods() {
        return ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled'];
    }
    updateDate(date) {
        this.setDate(date);
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        this.sourceParams.onDateChanged();
    }
    getProps() {
        const props = super.getProps();
        props.date = this.date;
        props.onDateChange = this.onDateChange;
        // remove props in IDataParams but not BaseDateParams
        delete props.onDateChanged;
        return props;
    }
}
