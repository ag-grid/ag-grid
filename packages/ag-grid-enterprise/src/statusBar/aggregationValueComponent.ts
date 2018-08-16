import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct, Utils as _} from 'ag-grid';

export class AggregationValueComponent extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private static TEMPLATE =
        `<span class="ag-status-bar-item">
            <span id="_label"></span>
            <span id="_value"></span>
        </span>`;

    private props: { key: string, defaultValue: string };

    private lbValue: HTMLElement;

    constructor(private key: any, private defaultValue: any) {
        super(AggregationValueComponent.TEMPLATE);
    }

    @PostConstruct
    public postConstruct(): void {
        // we want to hide until the first value comes in
        this.setVisible(false);

        if (this.props) {
            let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            this.queryForHtmlElement('#_label').innerHTML = localeTextFunc(this.props.key, this.props.defaultValue);
        }

        this.lbValue = this.queryForHtmlElement('#_value');
    }

    public setValue(value: number): void {
        this.lbValue.innerHTML = _.formatNumberTwoDecimalPlacesAndCommas(value);
    }
}