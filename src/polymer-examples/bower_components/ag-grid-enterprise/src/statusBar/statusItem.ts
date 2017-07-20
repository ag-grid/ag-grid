import {PostConstruct, Component, Utils as _} from 'ag-grid/main';
import {RangeController} from "../rangeController";

export class StatusItem extends Component {

    private static TEMPLATE =
        '<span class="ag-status-bar-item">' +
        '  <span id="_label"></span>' +
        '  <span id="_value"></span>' +
        '</span>';

    private lbValue: HTMLElement;

    constructor(label: string) {
        super(StatusItem.TEMPLATE);
        this.queryForHtmlElement('#_label').innerHTML = label;
    }

    @PostConstruct
    public init(): void {
        this.lbValue = this.queryForHtmlElement('#_value');
    }

    public setValue(value: number): void {
        this.lbValue.innerHTML = _.formatNumberTwoDecimalPlacesAndCommas(value);
    }
}