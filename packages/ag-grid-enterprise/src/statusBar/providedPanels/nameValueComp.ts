import {Autowired, Component, GridOptionsWrapper, RefSelector} from 'ag-grid-community';

export class NameValueComp extends Component {

    @Autowired('gridOptionsWrapper') protected gridOptionsWrapper: GridOptionsWrapper;

    private static TEMPLATE =
        `<div class="ag-name-value">  
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-name-value-value"></span>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eValue') private eValue: HTMLElement;

    constructor() {
        super(NameValueComp.TEMPLATE);
    }

    public setLabel(key: string, defaultValue: string): void {
        // we want to hide until the first value comes in
        this.setDisplayed(false);

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }

    public setValue(value: any): void {
        this.eValue.innerHTML = value;
    }
}
