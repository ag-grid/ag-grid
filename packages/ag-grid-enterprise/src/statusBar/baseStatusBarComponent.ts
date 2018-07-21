import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct, Utils as _} from 'ag-grid';

export class StatusBarComponent extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private static TEMPLATE = `<span class="ag-status-bar-item">  
            <span id="_label"></span>  
            <span id="_value"></span>
        </span>`;

    private lbValue: HTMLElement;

    constructor(private key: any, private defaultValue: any) {
        super(StatusBarComponent.TEMPLATE);
    }

    @PostConstruct
    public postConstruct(): void {
        this.setVisible(false);

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.queryForHtmlElement('#_label').innerHTML = localeTextFunc(this.key, this.defaultValue);

        this.lbValue = this.queryForHtmlElement('#_value');
    }

    public setValue(value: number): void {
        this.lbValue.innerHTML = _.formatNumberTwoDecimalPlacesAndCommas(value);
    }
}