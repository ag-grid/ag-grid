import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct, RefSelector} from 'ag-grid-community';

export class NameValueComp extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private static TEMPLATE = `<div class="ag-name-value">  
            <span ref="eLabel"></span>:&nbsp;<span ref="eValue" class="ag-name-value-value"></span>
        </div>`;

    private props: { key: string, defaultValue: string };

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eValue') private eValue: HTMLElement;

    constructor(private key: string, private defaultValue: string) {
        super(NameValueComp.TEMPLATE);
    }

    @PostConstruct
    protected postConstruct(): void {
        if (this.props) {
            this.key = this.props.key;
            this.defaultValue = this.props.defaultValue;
        }

        // we want to hide until the first value comes in
        this.setVisible(false);

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(this.key, this.defaultValue);
    }

    public setValue(value: any): void {
        this.eValue.innerHTML = value;
    }
}