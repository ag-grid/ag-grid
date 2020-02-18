import { Component } from "../../../widgets/component";
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { _ } from "../../../utils";
import { AgInputTextField } from "../../../widgets/agInputTextField";

export class DefaultDateComponent extends Component implements IDateComp {

    private eDateInput: AgInputTextField;
    private listener: () => void;

    constructor() {
        super(`<div class="ag-filter-filter"><ag-input-text-field class="ag-date-filter" ref="eDateInput"></ag-input-text-field></div>`);
    }

    public init(params: IDateParams): void {
        this.eDateInput.setInputPlaceHolder('yyyy-mm-dd');

        if (_.isBrowserChrome() || (params.filterParams && params.filterParams.browserDatePicker)) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            } else {
                (this.eDateInput.getInputElement() as HTMLInputElement).type = 'date';
            }
        }

        this.listener = params.onDateChanged;
        this.addDestroyableEventListener(this.eDateInput.getGui(), 'input', this.listener);
    }

    public getDate(): Date {
        return _.parseYyyyMmDdToDate(this.eDateInput.getValue(), "-");
    }

    public setDate(date: Date): void {
        this.eDateInput.setValue(_.serializeDateToYyyyMmDd(date, "-"));
    }

}
