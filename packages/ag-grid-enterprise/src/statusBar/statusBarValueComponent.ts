import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct} from 'ag-grid';

export class StatusBarValueComponent extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private static TEMPLATE = `<div class="ag-status-bar-item ag-status-bar-comp">  
            <span id="_label"></span>  
            <span id="_value"></span>
        </div>`;

    private props: { key: string, defaultValue: string };

    private lbValue: HTMLElement;

    constructor() {
        super(StatusBarValueComponent.TEMPLATE);
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

    public setValue(value: any): void {
        this.lbValue.innerHTML = value;
    }
}