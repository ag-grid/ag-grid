import {ChartDatasource} from "./chart";
import {
    Autowired,
    BeanStub,
    ClientSideRowModel,
    Column,
    ColumnController,
    Constants,
    Events,
    EventService,
    PaginationProxy,
    PostConstruct,
    RowNode,
    ValueService,
    ColumnGroup
} from "ag-grid-community";

export class ChartEverythingDatasource extends BeanStub implements ChartDatasource {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('rowModel') clientSideRowModel: ClientSideRowModel;
    @Autowired('paginationProxy') paginationProxy: PaginationProxy;
    @Autowired('eventService') eventService: EventService;

    private colIds: string[];
    private colDisplayNames: string[];
    private colsMapped: {[colId: string]: Column};

    private categoryCols: Column[];

    private rows: RowNode[];

    private errors: string[] = [];

    constructor() {
        super();
    }

    public getErrors(): string[] {
        return this.errors;
    }

    private addError(error: string): void {
        this.errors.push(error);
    }

    private clearErrors(): void {
        this.errors = [];
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.clientSideRowModel.getType()!==Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.error('ChartEverythingDatasource only works with ClientSideRowModel');
            return;
        }

        this.reset();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.onModelUpdated.bind(this));
    }

    private reset(): void {
        this.clearErrors();
        this.calculateFields();
        this.calculateCategoryCols();
        this.calculateRowCount();

        console.log(`rows`, this.rows);
        console.log(`colIds`, this.colIds);
        console.log(`categoryCols`, this.categoryCols);
    }

    private calculateCategoryCols(): void {
        this.categoryCols = [];

        const isDimension = (col:Column) => col.getColDef().enableRowGroup || col.getColDef().enablePivot;

        const cols = this.columnController.getAllDisplayedColumns();

        // pull out all dimension columns from the range
        cols.forEach( col => {
            const isDim = isDimension(col);
            console.log(`isDim(${col.getColId()}) = ${isDim}`);
            if (isDim) {
                this.categoryCols.push(col);
            }
        });
    }

    private onModelUpdated(): void {
        this.reset();
        this.dispatchEvent({type: 'modelUpdated'});
    }

    private calculateRowCount(): void {
        const firstRow = this.clientSideRowModel.getRow(0);
        const rootNode = this.clientSideRowModel.getRootNode();

        // if we are doing pivot mode and no row group, it means we are showing
        // the root node and no other rows. otherwise we are showing children of
        // the root node.
        if (firstRow===rootNode) {
            this.rows = [rootNode];
        } else {
            this.rows = rootNode.childrenAfterSort;
        }
    }

    private calculateFields(): void {

        const pivotActive = this.columnController.isPivotActive();

        const cols = pivotActive ?
            // when pivoting, we show all the columns, regardless of the child group open/closed
            // (pivot can have groups closed when showing total columns)
            this.columnController.getAllGridColumns() :
            // when not pivoting, we display all the columns currently visible
            this.columnController.getAllDisplayedColumns();

        this.colIds = [];
        this.colDisplayNames = [];
        this.colsMapped = {};

        if (!cols) { return; }

        cols.forEach( col => {
            console.log(`isValue(${col.getColId()}) = ${col.getColDef().enableValue}`);

            // only measure columns can be values
            if (!col.getColDef().enableValue) { return; }

            // we never chart total columns, as total cols in charts look weird
            if (col.getColDef().pivotTotalColumnIds) { return; }

            const colId = col.getColId();
            const displayName = this.getColumnName(col);

            this.colIds.push(colId);
            this.colDisplayNames.push(displayName ? displayName : '');

            this.colsMapped[colId] = col;
        });
    }

    private getColumnName(col: Column): string {
        if (this.columnController.isPivotActive()) {
            const valueColumns = this.columnController.getValueColumns();
            const parts: string[] = [];
            if (valueColumns.length>1) {
                const part = this.columnController.getDisplayNameForColumn(col, 'chart');
                parts.unshift(part ? part : '');
            }
            let pointer: ColumnGroup = col.getParent();
            while (pointer) {
                const part = this.columnController.getDisplayNameForColumnGroup(pointer,'chart');
                parts.unshift(part ? part : '');
                pointer = pointer.getParent();
            }
            return parts.join('');
        } else {
            const displayName = this.columnController.getDisplayNameForColumn(col, 'chart');
            return displayName ? displayName : '';
        }
    }


    public getCategory(i: number): string {
        const rowNode = this.rows[i];
        const resParts: string[] = [];

        if (this.categoryCols) {
            this.categoryCols.forEach( col => {
                const part = this.valueService.getValue(col, rowNode);
                // force return type to be string or empty string (as value can be an object)
                const partStr = (part && part.toString) ? part.toString() : '';
                resParts.push(partStr);
            });
            const res = resParts.join(', ');
            return res;
        }

        if (this.getRowCount() > 1) {
            return 'Total ' + i;
        } else {
            return 'Total';
        }
    }

    public getFields(): string[] {
        return this.colIds;
    }

    public getFieldNames(): string[] {
        return this.colDisplayNames;
    }

    public getValue(i: number, field: string): number {
        const rowNode = this.rows[i];
        const col = this.colsMapped[field];
        const res = this.valueService.getValue(col, rowNode);
        return res;
    }

    public getRowCount(): number {
        return this.rows.length;
    }

}