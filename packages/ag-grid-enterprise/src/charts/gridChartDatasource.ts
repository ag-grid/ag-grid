import {ChartDatasource} from "./chart";
import {
    Autowired,
    IRowModel,
    BeanStub,
    Column,
    ColumnController,
    RangeSelection,
    ValueService,
    PaginationProxy,
    Events,
    EventService,
    PostConstruct
} from "ag-grid-community";

export class GridChartDatasource extends BeanStub implements ChartDatasource {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('rowModel') rowModel: IRowModel;
    @Autowired('paginationProxy') paginationProxy: PaginationProxy;
    @Autowired('eventService') eventService: EventService;

    private rangeSelection: RangeSelection;

    private colIds: string[];
    private colDisplayNames: string[];
    private colsMapped: {[colId: string]: Column};

    private categoryCol: Column;

    private startRow: number;
    private endRow: number;
    private rowCount: number;

    constructor(rangeSelection: RangeSelection) {
        super();
        this.rangeSelection = rangeSelection;
    }

    @PostConstruct
    private postConstruct(): void {
        this.calculateFields();
        this.calculateRowRange();

        // hardcoded - always use the first column
        this.categoryCol = this.columnController.getAllGridColumns()[0];

        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onModelUpdated.bind(this));
    }

    private onModelUpdated(): void {
        this.calculateRowCount();
        this.dispatchEvent({type: 'modelUpdated'});
    }

    private calculateRowRange(): void {
        const paginationOffset = this.paginationProxy.getPageFirstRow();
        this.startRow = this.rangeSelection.start.rowIndex + paginationOffset;
        this.endRow = this.rangeSelection.end.rowIndex + paginationOffset;
        this.calculateRowCount();
    }

    private calculateRowCount(): void {
        // make sure enough rows in range to chart. if user filters and less rows, then
        // end row will be the last displayed row, not where the range ends.
        const maxRow = this.rowModel.getRowCount();
        const lastRow = Math.min(this.endRow, maxRow);
        this.rowCount = lastRow - this.startRow + 1;
    }

    private calculateFields(): void {
        const cols = this.rangeSelection.columns;

        this.colIds = [];
        this.colDisplayNames = [];
        this.colsMapped = {};

        if (!cols) { return; }

        cols.forEach( col => {
            const colId = col.getColId();
            const displayName = this.columnController.getDisplayNameForColumn(col, 'chart');

            this.colIds.push(colId);
            this.colDisplayNames.push(displayName ? displayName : '');

            this.colsMapped[colId] = col;
        });
    }

    public getCategory(i: number): string {
        const rowNode = this.rowModel.getRow(this.startRow + i);
        const res = this.valueService.getValue(this.categoryCol, rowNode);
        // force return type to be string or empty string (as value can be an object)
        return (res && res.toString) ? res.toString() : '';
    }

    public getFields(): string[] {
        return this.colIds;
    }

    public getFieldNames(): string[] {
        return this.colDisplayNames;
    }

    public getValue(i: number, field: string): number {
        const rowNode = this.rowModel.getRow(this.startRow + i);
        const col = this.colsMapped[field];
        const res = this.valueService.getValue(col, rowNode);
        return res;
    }

    public getRowCount(): number {
        return this.rowCount;
    }

}