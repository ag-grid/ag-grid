import {
    _,
    Autowired,
    CellNavigationService,
    Component,
    Constants,
    Context,
    Events,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    GridRow,
    IRowModel,
    PinnedRowModel,
    PostConstruct,
    RowNode,
    ValueService,
    RefSelector
} from 'ag-grid';
import {RangeController} from "../rangeController";
import {SumAggregationComp} from "./sumAggregationComp";

export class StatusBar extends Component {

/*
<!--<ag-status-bar-sum-count-comp></ag-status-bar-sum-count-comp>-->
<!--<ag-status-bar-sum-min-comp></ag-status-bar-sum-min-comp>-->
<!--<ag-status-bar-sum-max-comp></ag-status-bar-sum-max-comp>-->
<!--<ag-status-bar-sum-avg-comp></ag-status-bar-sum-avg-comp>-->
<!--<ag-status-bar-sum-info-comp></ag-status-bar-sum-info-comp>-->
*/
    private static TEMPLATE = `<div class="ag-status-bar">
            <div class="ag-status-bar-aggregations">
                <ag-sum-aggregation-comp ref="sumAggregationComp"></ag-sum-aggregation-comp>
            </div>
        </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('sumAggregationComp') private sumAggregationComp: SumAggregationComp;
    // @RefSelector('countAggregationComp') private countAggregationComp: CountAggregationComp;

    private gridPanel: GridPanel;

    // private statusItemMin: AggregationComp;
    // private statusItemMax: AggregationComp;
    // private statusItemAvg: AggregationComp;

    // private aggregationsComponent = new Component('<div class="ag-status-bar-aggregations"></div>');
    // private infoLabel = new Component(`<div class="ag-status-bar-info-label"></div>`);

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    // spl what is this for?
    public registerGridPanel(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }


    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);

        // spl todo - put this in the aggr components
        // we want to hide until the first aggregation comes in
        this.setVisible(this.gridOptionsWrapper.isEnableStatusBar());

        // this.createStatusItems();
        this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    }

    // private createStatusItems(): void {
    //     let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
    //
    //     this.statusItemMin = new AggregationComp(localeTextFunc('min', 'Min'));
    //     this.statusItemMax = new AggregationComp(localeTextFunc('max', 'Max'));
    //     this.statusItemAvg = new AggregationComp(localeTextFunc('average', 'Average'));
    //
    //     this.forEachStatusItem( (statusItem) => {
    //         this.context.wireBean(statusItem);
    //         this.aggregationsComponent.appendChild(statusItem);
    //         statusItem.setVisible(false);
    //     });
    //
    //     this.appendChild(this.infoLabel);
    //     this.appendChild(this.aggregationsComponent);
    // }

    private onRangeSelectionChanged(): void {
        let cellRanges = this.rangeController.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number = null;
        let max: number = null;

        let cellsSoFar: any = {};

        if (!_.missingOrEmpty(cellRanges)) {

            cellRanges.forEach((cellRange) => {

                // get starting and ending row, remember rowEnd could be before rowStart
                let startRow = cellRange.start.getGridRow();
                let endRow = cellRange.end.getGridRow();

                let startRowIsFirst = startRow.before(endRow);

                let currentRow = startRowIsFirst ? startRow : endRow;
                let lastRow = startRowIsFirst ? endRow : startRow;

                while (true) {

                    let finishedAllRows = _.missing(currentRow) || lastRow.before(currentRow);
                    if (finishedAllRows) {
                        break;
                    }

                    cellRange.columns.forEach((column) => {

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

        let gotResult = this.gridOptionsWrapper.isAlwaysShowStatusBar() || count > 1;
        let gotNumberResult = numberCount > 1;

        // we should count even if no numbers
        // if (gotResult) {
        //     this.countAggregationComp.setValue(count);
        // }
        // this.countAggregationComp.setVisible(gotResult);
        //
        // if numbers, then show the number items
        if (gotNumberResult) {
            this.sumAggregationComp.setValue(sum);
        //     this.statusItemMin.setValue(min);
        //     this.statusItemMax.setValue(max);
        //     this.statusItemAvg.setValue(sum / numberCount);
        }
        this.sumAggregationComp.setVisible(gotNumberResult);
        // this.statusItemMin.setVisible(gotNumberResult);
        // this.statusItemMax.setVisible(gotNumberResult);
        // this.statusItemAvg.setVisible(gotNumberResult);

        if (this.isVisible() !== gotResult) {
            this.setVisible(gotResult);
        }
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
