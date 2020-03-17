import { Autowired } from "../../../context/context";
import { AgInputTextField } from "../../../widgets/agInputTextField";
import { Component } from "../../../widgets/component";
import { GridOptionsWrapper } from "../../../gridOptionsWrapper";
import { IDateComp, IDateParams } from "../../../rendering/dateComponent";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { _ } from "../../../utils";

export class DefaultDateComponent extends Component implements IDateComp {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @RefSelector('eDateInput') private eDateInput: AgInputTextField;

    private listener: () => void;

    constructor() {
        super(`<div class="ag-filter-filter"><ag-input-text-field class="ag-date-filter" ref="eDateInput"></ag-input-text-field></div>`);
    }

    public init(params: IDateParams): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eDateInput.setInputPlaceholder(translate('dateFormatOoo', 'yyyy-mm-dd'));

        if (_.isBrowserChrome() || (params.filterParams && params.filterParams.browserDatePicker)) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            } else {
                (this.eDateInput.getInputElement() as HTMLInputElement).type = 'date';
            }
        }

        this.listener = params.onDateChanged;

        this.addDestroyableEventListener(this.eDateInput.getInputElement(), 'input', (e) => {
            if (e.target !== document.activeElement) { return; }
            this.listener();
        });
    }

    public getDate(): Date {
        return _.getDateFromString(this.eDateInput.getValue());
    }

    public setDate(date: Date): void {
        this.eDateInput.setValue(_.serializeDateToYyyyMmDd(date, "-"));
    }

    public setInputPlaceholder(placeholder: string): void {
        this.eDateInput.setInputPlaceholder(placeholder);
    }

}
