import {EventService, Component, Autowired, PostConstruct, Events, Utils, Column,
    GridRow, RowNode, Constants, FloatingRowModel, IRowModel, ValueService,
    CellNavigationService, Bean, Context, GridOptionsWrapper, GridCell} from 'ag-grid/main';
import {StatusItem} from "./statusItem";
import {RangeController} from "../rangeController";

@Bean('statusBar')
export class StatusBar extends Component {

    private static TEMPLATE =
        '<div class="ag-status-bar">' +
        '</div>';

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private statusItemSum: StatusItem;
    private statusItemCount: StatusItem;
    private statusItemMin: StatusItem;
    private statusItemMax: StatusItem;
    private statusItemAvg: StatusItem;

    private aggregationsComponent = new Component('<div class="ag-status-bar-aggregations"></div>');
    private infoLabel = new Component(`<div class="ag-status-bar-info-label"></div>`);

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.createStatusItems();
        this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
    }

    private createStatusItems(): void {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        this.statusItemSum = new StatusItem(localeTextFunc('sum', 'Sum'));
        this.statusItemCount = new StatusItem(localeTextFunc('count', 'Count'));
        this.statusItemMin = new StatusItem(localeTextFunc('min', 'Min'));
        this.statusItemMax = new StatusItem(localeTextFunc('max', 'Max'));
        this.statusItemAvg = new StatusItem(localeTextFunc('average', 'Average'));

        this.forEachStatusItem( (statusItem) => {
            this.context.wireBean(statusItem);
            this.aggregationsComponent.appendChild(statusItem);
            statusItem.setVisible(false);
        });

        this.appendChild(this.infoLabel);
        this.appendChild(this.aggregationsComponent);
    }

    private forEachStatusItem(callback: (statusItem: StatusItem)=>void): void {
        [this.statusItemAvg, this.statusItemCount, this.statusItemMin, this.statusItemMax, this.statusItemSum].forEach(callback);
    }

    private onRangeSelectionChanged(): void {
        var cellRanges = this.rangeController.getCellRanges();

        var sum = 0;
        var count = 0;
        var numberCount = 0;
        var min: number = null;
        var max: number = null;

        var cellsSoFar: any = {};

        if (!Utils.missingOrEmpty(cellRanges)) {

            cellRanges.forEach( (cellRange)=> {

                // get starting and ending row, remember rowEnd could be before rowStart
                var startRow = cellRange.start.getGridRow();
                var endRow = cellRange.end.getGridRow();

                var startRowIsFirst = startRow.before(endRow);

                var currentRow = startRowIsFirst ? startRow : endRow;
                var lastRow = startRowIsFirst ? endRow : startRow;

                while (true) {
                    cellRange.columns.forEach( (column) => {

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        var cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        var rowNode = this.getRowNode(currentRow);
                        var value = this.valueService.getValue(column, rowNode);

                        // if empty cell, skip it, doesn't impact count or anything
                        if (Utils.missing(value) || value === '') {
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

                    if (currentRow.equals(lastRow)) {
                        break;
                    }

                    currentRow = this.cellNavigationService.getRowBelow(currentRow);

                }

            });

        }

        var gotResult = count > 1;
        var gotNumberResult = numberCount>0;

        // we should count even if no numbers
        if (gotResult) {
            this.statusItemCount.setValue(count);
        }
        this.statusItemCount.setVisible(gotResult);

        // if numbers, then show the number items
        if (gotNumberResult) {
            this.statusItemSum.setValue(sum);
            this.statusItemMin.setValue(min);
            this.statusItemMax.setValue(max);
            this.statusItemAvg.setValue(sum / numberCount);
        }
        this.statusItemSum.setVisible(gotNumberResult);
        this.statusItemMin.setVisible(gotNumberResult);
        this.statusItemMax.setVisible(gotNumberResult);
        this.statusItemAvg.setVisible(gotNumberResult);
    }

    private getRowNode(gridRow: GridRow): RowNode {
        switch (gridRow.floating) {
            case Constants.FLOATING_TOP:
                return this.floatingRowModel.getFloatingTopRowData()[gridRow.rowIndex];
            case Constants.FLOATING_BOTTOM:
                return this.floatingRowModel.getFloatingBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }
}
