import {Autowired, Component, Context, _, GridOptions, GridOptionsWrapper, PostConstruct, RefSelector} from 'ag-grid';
import {AggregationPanelComp} from "./aggregationPanelComp";

export class StatusBar extends Component {

    private static TEMPLATE = `<div class="ag-status-bar">
            <ag-aggregation-panel-comp ref="aggregationPanelComp"></ag-aggregation-panel-comp>
        </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;

    @RefSelector('aggregationPanelComp') private aggregationPanelComp: AggregationPanelComp;

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);

        this.setVisible(this.gridOptionsWrapper.isEnableStatusBar());
        this.aggregationPanelComp.setVisible(this.gridOptionsWrapper.isShowAggregationPanel());
    }
}
