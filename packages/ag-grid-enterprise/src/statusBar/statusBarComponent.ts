import {Component, PreConstruct, PostConstruct, Utils as _} from 'ag-grid';

export class StatusBarComponent extends Component {

    private static TEMPLATE = `<span class="ag-status-bar-item">  
            <span id="_label"></span>  
            <span id="_value"></span>
        </span>`;

    private lbValue: HTMLElement;

    private props: { label: string };

    constructor() {
        super();
    }

    @PreConstruct
    private preConstruct(): void {
        this.setTemplate(StatusBarComponent.TEMPLATE);
    }

    @PostConstruct
    public postConstruct(): void {
        if (this.props.label) {
            this.queryForHtmlElement('#_label').innerHTML = this.props.label;
        }

        this.lbValue = this.queryForHtmlElement('#_value');
    }

    public setValue(value: number): void {
        this.lbValue.innerHTML = _.formatNumberTwoDecimalPlacesAndCommas(value);
    }
}