import { AgInputTextField } from "../../../widgets/agInputTextField";
import { Component } from "../../../widgets/component";
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { _ } from "../../../utils";

export class DefaultDateComponent extends Component implements IDateComp {
    @RefSelector('eDateInput') private eDateInput: AgInputTextField;

    private listener: () => void;

    constructor() {
        super(/* html */`
            <div class="ag-filter-filter">
                <ag-input-text-field class="ag-date-filter" ref="eDateInput"></ag-input-text-field>
            </div>`
        );
    }

    public init(params: IDateParams): void {
        if (this.shouldUseBrowserDatePicker(params)) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            } else {
                (this.eDateInput.getInputElement() as HTMLInputElement).type = 'date';
            }
        }

        this.listener = params.onDateChanged;

        this.addDestroyableEventListener(this.eDateInput.getInputElement(), 'input', e => {
            if (e.target !== document.activeElement) { return; }

            this.listener();
        });
    }

    public getDate(): Date {
        return _.parseDateTimeFromString(this.eDateInput.getValue());
    }

    public setDate(date: Date): void {
        this.eDateInput.setValue(_.serialiseDate(date));
    }

    public setInputPlaceholder(placeholder: string): void {
        this.eDateInput.setInputPlaceholder(placeholder);
    }

    private shouldUseBrowserDatePicker(params: IDateParams): boolean {
        if (params.filterParams && params.filterParams.browserDatePicker != null) {
            return params.filterParams.browserDatePicker;
        } else {
            return _.isBrowserChrome() || _.isBrowserFirefox();
        }
    }
}
