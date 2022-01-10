import { Autowired, ColumnModel, Constants, IRowModel, PostConstruct, RowNode, ValueService, _ } from "@ag-grid-community/core";
import { FilterListenerManager } from "../state/filterListenerManager";

type ValueType = string | null;
export class GridColumnValuesModel {
    @Autowired('valueService') private readonly valueService: ValueService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('rowModel') private readonly rowModel: IRowModel;

    private readonly filterValuesListeners = new FilterListenerManager<() => void>()
    private readonly colId: string;

    private visibilityRegexp: RegExp | null;
    private visibilityPredicate: (value: ValueType) => boolean;

    private currentFilterValues: ValueType[];
    private visibleFilterValues: ValueType[];

    public constructor(opts: {
        colId: string,
    }) {
        this.colId = opts.colId;

        this.visibilityPredicate = (v) => this.visibilityRegexp ? v != null && this.visibilityRegexp.test(v) : true;
    }

    @PostConstruct
    private postConstruct() {
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            throw new Error('AG Grid - Only ClientSideRowModel is currently supported.');
        }

        this.updateFilterValues();
    }

    public addFilterValueListener(source: any, cb: () => void): void {
        this.filterValuesListeners.addListener(source, cb);
    }

    public setVisibleRegexp(regexp: RegExp | null) {
        this.visibilityRegexp = regexp;

        this.updateFilterValuesVisible();
    }

    public getFilterValues(): readonly ValueType[] {
        return [...this.currentFilterValues];
    }

    public getFilterValuesVisible(): readonly ValueType[] {
        return [...this.visibleFilterValues];
    }

    private updateFilterValues() {
        const newValues = new Set<string | null>();

        this.rowModel.forEachNode((rowNode) => {
            const cellValue = this.getCellValue(rowNode);
            const cellString = cellValue == null ? null :
                typeof cellValue !== 'string' ? String(cellValue) :
                cellValue.trim().length === 0 ? null :
                cellValue.trim();

            newValues.add(cellString);
        });

        const newValuesArray = Array.from(newValues).sort();

        const changed = !_.areEqual(newValuesArray, this.currentFilterValues);
        if (!changed) { return; }

        this.currentFilterValues = newValuesArray;
        this.updateFilterValuesVisible(false);

        this.filterValuesListeners.notify(this);
    }

    private updateFilterValuesVisible(notify = true) {
        const newValues = this.currentFilterValues.filter(this.visibilityPredicate);

        const changed = !_.areEqual(newValues, this.visibleFilterValues);
        if (!changed) { return; }

        this.visibleFilterValues = newValues;
        if (!notify) { return; }

        this.filterValuesListeners.notify(this);
    }

    private getCellValue(rowNode: RowNode): unknown {
        const column = this.columnModel.getGridColumn(this.colId);
        if (column == null) { return null; }

        return this.valueService.getValue(column, rowNode, true);
    }
}