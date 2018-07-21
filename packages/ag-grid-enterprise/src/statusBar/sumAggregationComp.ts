import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct, PreConstruct, RefSelector} from 'ag-grid';
import {StatusBarComponent} from "./statusBarComponent";

export class SumAggregationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    @RefSelector('aggregationComp') private aggregationComp: StatusBarComponent;

    constructor() {
        super();
    }

    private createTemplate(): string {
        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return `<span><ag-aggregation-comp label="${localeTextFunc('sum', 'Sum')}" ref="aggregationComp"></ag-aggregation-comp></span>`;
    }

    @PreConstruct
    private preConstruct(): void {
        this.setTemplate(this.createTemplate());
        this.instantiate(this.context);
    }

    @PostConstruct
    public postConstruct(): void {
        this.setVisible(false);
    }

    public setValue(value: number): void {
        this.aggregationComp.setValue(value);
    }
}