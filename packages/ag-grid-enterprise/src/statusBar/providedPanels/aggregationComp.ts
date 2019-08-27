import {
    Autowired,
    CellNavigationService,
    Component,
    Events,
    EventService,
    GridApi,
    GridOptions,
    GridOptionsWrapper,
    RowPosition,
    IStatusPanelComp,
    PostConstruct,
    RefSelector,
    ValueService,
    _, CellPositionUtils,
    RowPositionUtils,
    RowRenderer
} from 'ag-grid-community';
import { RangeController } from "../../rangeController";
import { NameValueComp } from "./nameValueComp";

export class AggregationComp extends Component implements IStatusPanelComp {

    private static TEMPLATE =
            `<div class="ag-status-panel ag-status-panel-aggregations">
                <ag-name-value ref="avgAggregationComp"></ag-name-value>
                <ag-name-value ref="countAggregationComp"></ag-name-value>
                <ag-name-value ref="minAggregationComp"></ag-name-value>
                <ag-name-value ref="maxAggregationComp"></ag-name-value>
                <ag-name-value ref="sumAggregationComp"></ag-name-value>
            </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;

    @RefSelector('sumAggregationComp') private sumAggregationComp: NameValueComp;
    @RefSelector('countAggregationComp') private countAggregationComp: NameValueComp;
    @RefSelector('minAggregationComp') private minAggregationComp: NameValueComp;
    @RefSelector('maxAggregationComp') private maxAggregationComp: NameValueComp;
    @RefSelector('avgAggregationComp') private avgAggregationComp: NameValueComp;

    constructor() {
        super(AggregationComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        if (!this.isValidRowModel()) {
            console.warn(`ag-Grid: agAggregationComponent should only be used with the client and server side row model.`);
            return;
        }

        this.avgAggregationComp.setLabel('average', 'Average');
        this.countAggregationComp.setLabel('count', 'Count');
        this.minAggregationComp.setLabel('min', 'Min');
        this.maxAggregationComp.setLabel('max', 'Max');
        this.sumAggregationComp.setLabel('sum', 'Sum');

        this.addDestroyableEventListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    }

    private isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }

    public init() {
    }

    private setAggregationComponentValue(aggFuncName: string, value: number | null, visible: boolean) {
        const statusBarValueComponent = this.getAggregationValueComponent(aggFuncName);
        if (_.exists(statusBarValueComponent) && statusBarValueComponent) {
            statusBarValueComponent.setValue(_.formatNumberTwoDecimalPlacesAndCommas(value));
            statusBarValueComponent.setDisplayed(visible);
        }
    }

    private getAggregationValueComponent(aggFuncName: string): NameValueComp | null {
        // converts user supplied agg name to our reference - eg: sum => sumAggregationComp
        const refComponentName = `${aggFuncName}AggregationComp`;

        // if the user has specified the agAggregationPanelComp but no aggFuncs we show the all
        // if the user has specified the agAggregationPanelComp and aggFuncs, then we only show the aggFuncs listed
        let statusBarValueComponent: NameValueComp | null = null;
        const aggregationPanelConfig = _.exists(this.gridOptions.statusBar) && this.gridOptions.statusBar ? _.find(this.gridOptions.statusBar.statusPanels, panel => panel.statusPanel === 'agAggregationComponent') : null;
        if (_.exists(aggregationPanelConfig) && aggregationPanelConfig) {
            // a little defensive here - if no statusPanelParams show it, if componentParams we also expect aggFuncs
            if (!_.exists(aggregationPanelConfig.statusPanelParams) ||
                (_.exists(aggregationPanelConfig.statusPanelParams) &&
                    _.exists(aggregationPanelConfig.statusPanelParams.aggFuncs) &&
                    _.exists(_.find(aggregationPanelConfig.statusPanelParams.aggFuncs, func => func === aggFuncName)))
            ) {
                statusBarValueComponent = (this as any)[refComponentName];
            }
        } else {
            // components not specified - assume we can show this component
            statusBarValueComponent = (this as any)[refComponentName];
        }

        // either we can't find it (which would indicate a typo or similar user side), or the user has deliberately
        // not listed the component in aggFuncs
        return statusBarValueComponent;
    }

    private onRangeSelectionChanged(): void {
        const cellRanges = this.rangeController.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number | null = null;
        let max: number = 0;

        const cellsSoFar: any = {};

        if (cellRanges && !_.missingOrEmpty(cellRanges)) {

            cellRanges.forEach((cellRange) => {

                let currentRow: RowPosition | null = this.rangeController.getRangeStartRow(cellRange);
                const lastRow = this.rangeController.getRangeEndRow(cellRange);

                while (true) {

                    const finishedAllRows = _.missing(currentRow) || !currentRow || this.rowPositionUtils.before(lastRow, currentRow);
                    if (finishedAllRows || !currentRow || !cellRange.columns) {
                        break;
                    }

                    cellRange.columns.forEach(col => {
                        if (currentRow === null) {
                            return;
                        }

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        const cellId = this.cellPositionUtils.createId({
                            rowPinned: currentRow.rowPinned,
                            column: col,
                            rowIndex: currentRow.rowIndex
                        });
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        const rowNode = this.rowRenderer.getRowNode(currentRow);
                        if (_.missing(rowNode)) {
                            return;
                        }

                        let value = this.valueService.getValue(col, rowNode);

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

        const gotResult = count > 1;
        const gotNumberResult = numberCount > 1;

        // we show count even if no numbers
        this.setAggregationComponentValue('count', count, gotResult);

        // show if numbers found
        this.setAggregationComponentValue('sum', sum, gotNumberResult);
        this.setAggregationComponentValue('min', min, gotNumberResult);
        this.setAggregationComponentValue('max', max, gotNumberResult);
        this.setAggregationComponentValue('avg', (sum / numberCount), gotNumberResult);
    }
}
