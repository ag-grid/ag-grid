import { Component } from "../../../widgets/component";
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { _ } from "../../../utils";

export class DefaultDateComponent extends Component implements IDateComp {

    private eDateInput: HTMLInputElement;
    private listener: () => void;

    constructor() {
        super(`<div class="ag-input-wrapper"><input class="ag-filter-filter" type="text" placeholder="yyyy-mm-dd"></div>`);
    }

    public init(params: IDateParams): void {
        this.eDateInput = this.getGui().querySelector('input') as HTMLInputElement;

        if (_.isBrowserChrome() || params.filterParams.browserDatePicker) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            } else {
                this.eDateInput.type = 'date';
            }
        }

        this.listener = params.onDateChanged;

        this.addGuiEventListener('input', this.listener);
    }

    public getDate(): Date {
        return _.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    }

    public setDate(date: Date): void {
        this.eDateInput.value = _.serializeDateToYyyyMmDd(date, "-");
    }

}
