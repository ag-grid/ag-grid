import {
    _,
    Autowired,
    CellNavigationService,
    Component,
    Constants,
    Context,
    Events,
    EventService,
    GridApi,
    GridOptions,
    GridOptionsWrapper,
    GridRow,
    IRowModel,
    IStatusPanelComp,
    PinnedRowModel,
    PostConstruct,
    PreConstruct,
    RefSelector,
    RowNode,
    ValueService
} from 'ag-grid-community';
import {RangeController} from "../../rangeController";
import {NameValueComp} from "./nameValueComp";

export class AggregationComp extends Component implements IStatusPanelComp {

    private static TEMPLATE = `<div class="ag-status-panel ag-status-panel-aggregations">
                <ag-name-value key="average" default-value="Average" ref="avgAggregationComp"></ag-name-value>
                <ag-name-value key="count" default-value="Count" ref="countAggregationComp"></ag-name-value>
                <ag-name-value key="min" default-value="Min" ref="minAggregationComp"></ag-name-value>
                <ag-name-value key="max" default-value="Max" ref="maxAggregationComp"></ag-name-value>
                <ag-name-value key="sum" default-value="Sum" ref="sumAggregationComp"></ag-name-value>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('sumAggregationComp') private sumAggregationComp: NameValueComp;
    @RefSelector('countAggregationComp') private countAggregationComp: NameValueComp;
    @RefSelector('minAggregationComp') private minAggregationComp: NameValueComp;
    @RefSelector('maxAggregationComp') private maxAggregationComp: NameValueComp;
    @RefSelector('avgAggregationComp') private avgAggregationComp: NameValueComp;

    constructor() {
        super(AggregationComp.TEMPLATE);
    }

    @PreConstruct
    private preConstruct(): void {
        this.instantiate(this.context);
    }

    @PostConstruct
    private postConstruct(): void {
        if (!this.isValidRowModel()) {
            console.warn(`ag-Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }

        this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    }

    private isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType !== 'serverSide';
    }

    public init() {
    }

    private setAggregationComponentValue(aggFuncName: string, value: number, visible: boolean) {
        let statusBarValueComponent = this.getAggregationValueComponent(aggFuncName);
        if (_.exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(_.formatNumberTwoDecimalPlacesAndCommas(value));
            statusBarValueComponent.setVisible(visible);
        }
    }

    private getAggregationValueComponent(aggFuncName: string): NameValueComp | null {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        let refComponentName = `${aggFuncName}AggregationComp`;

        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        let statusBarValueComponent: NameValueComp | null = null;
        const aggregationPanelConfig = _.exists(this.gridOptions.statusBar) && this.gridOptions.statusBar ? _.find(this.gridOptions.statusBar.statusPanels, aggFuncName) : null;
        if (_.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!_.exists(aggregationPanelConfig.statusPanelParams) ||
                (_.exists(aggregationPanelConfig.statusPanelParams) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    _.exists(_.find(aggregationPanelConfig.statusPanelParams.aggFuncs, (item) => item === aggFuncName)))
            ) {
                statusBarValueComponent = (<any>this)[refComponentName];
            }
        } else {
            // components not specified - assume we can show this component
            statusBarValueComponent = (<any>this)[refComponentName];
        }

        // either we can't find it (which would indicate a typo or similar user side), or the user has deliberately
        // not listed the component in aggFuncs
        return statusBarValueComponent;
    }

    private onRangeSelectionChanged(): void {
        let cellRanges = this.rangeController.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number = 0;
        let max: number = 0;

        let cellsSoFar: any = {};

        if (!_.missingOrEmpty(cellRanges)) {

            cellRanges.forEach((cellRange) => {

                // get starting and ending row, remember rowEnd could be before rowStart
                let startRow = cellRange.start.getGridRow();
                let endRow = cellRange.end.getGridRow();

                let startRowIsFirst = startRow.before(endRow);

                let currentRow: GridRow | null = startRowIsFirst ? startRow : endRow;
                let lastRow = startRowIsFirst ? endRow : startRow;

                while (true) {

                    let finishedAllRows = _.missing(currentRow) || !currentRow || lastRow.before(currentRow);
                    if (finishedAllRows || !currentRow) {
                        break;
                    }

                    cellRange.columns.forEach((column) => {
                        if (currentRow === null) {
                            return;
                        }

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        let cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        let rowNode = this.getRowNode(currentRow);
                        if (_.missing(rowNode)) {
                            return;
                        }

                        let value = this.valueService.getValue(column, rowNode);

                        // if empty cell, skip it, doesn't impact count or anything
                        if (_.missing(value) || value === '') {
                            return;
                        }

                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (value.value) {
                            value = value.value;
                        }

                        if (typeof value === 'string') {
                            value = Number(value);
                        }

                        if (typeof value === 'number' && !isNaN(value)) {

                            sum += value;

                            if (max === null || value > max) {
                                max = value;
                            }

                            if (min === null || value < min) {
                                min = value;
                            }

                            numberCount++;
                        }
                        count++;
                    });

                    currentRow = this.cellNavigationService.getRowBelow(currentRow);
                }
            });
        }

        let gotResult = count > 1;
        let gotNumberResult = numberCount > 1;

        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);

        // show if numbers found
        this.setAggregationComponentValue('sum', sum, gotNumberResult);
        this.setAggregationComponentValue('min', min, gotNumberResult);
        this.setAggregationComponentValue('max', max, gotNumberResult);
        this.setAggregationComponentValue('avg', (sum / numberCount), gotNumberResult);
    }

    private getRowNode(gridRow: GridRow): RowNode {
        switch (gridRow.floating) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
}
