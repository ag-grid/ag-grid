import {ChartDatasource} from "./chart";
import {Autowired, IRowModel, BeanStub, Column, ColumnController, RangeSelection, ValueService, PaginationProxy} from "ag-grid-community";

export class AgChartDatasource extends BeanStub implements ChartDatasource {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('valueService') valueService: ValueService;
    @Autowired('rowModel') rowModel: IRowModel;
    @Autowired('paginationProxy') paginationProxy: PaginationProxy;

    private rangeSelection: RangeSelection;

    private fields: string[];
    private fieldNames: string[];

    private categoryCol: Column;

    constructor(rangeSelection: RangeSelection) {
        super();
        this.rangeSelection = rangeSelection;

        this.calculateFields();

        // hardcoded - always use the first column
        this.categoryCol = this.columnController.getAllGridColumns()[0];
    }

    private calculateFields(): void {
        const cols = this.rangeSelection.columns;

        this.fields = [];
        this.fieldNames = [];

        if (!cols) { return; }

        this.fields = cols.map( col => col.getColId() );
        this.fieldNames = cols.map( col => {
            const res = this.columnController.getDisplayNameForColumn(col, 'chart');
            return res ? res : '';
        } );
    }

    public getCategory(i: number): void {
        const rowNode = this.paginationProxy.getRow(i);
        // this.valueService.getValue();
    }

    public getFields(): string[] {
        return this.fields;
    }

    public getFieldNames(): string[] {
        return this.fieldNames;
    }

    public getValue(i: number, field: string): number {
        return 0;
    }

    public getValueCount(): number {
        return 0;
    }

}