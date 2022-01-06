import { _, Autowired, Bean, RowNode, BeanStub, ColumnModel, Column, ValueService, GetQuickFilterTextParams } from "@ag-grid-community/core";
import { StatelessFilterController } from "./interfaces";

const QUICK_FILTER_SEPARATOR = '\n';

@Bean('quickFilterController')
export class QuickFilterController extends BeanStub implements StatelessFilterController {
    public readonly type = 'stateless';

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;

    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;

    public isActive(): boolean {
        return this.quickFilter !== null;
    }

    public evaluate(params: { rowNode: RowNode }): boolean {
        if (!this.isActive()) { return true; }

        const { rowNode } = params;
        const evaluateFn: (node: RowNode, fp: string) => boolean =
            this.gridOptionsWrapper.isCacheQuickFilter() ?
                (n, fp) => this.evaluateWithCache(n, fp) :
                (n, fp) => this.evaluateNoCache(n, fp);

        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts!.every(part => evaluateFn(rowNode, part));
    }

    public isFilterActive(column: Column): boolean {
        return false;
    }

    public setQuickFilter(newFilter: any): void {
        this.quickFilter = this.parseQuickFilter(newFilter);
        this.quickFilterParts = this.parseQuickFilterParts(this.quickFilter);
    }

    private evaluateNoCache(rowNode: RowNode, filterPart: string): boolean {
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        return columns.some(column => {
            const part = this.getQuickFilterTextForColumn(column, rowNode);

            return _.exists(part) && part.indexOf(filterPart) >= 0;
        });
    }

    private evaluateWithCache(node: RowNode, filterPart: string): boolean {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }

        return node.quickFilterAggregateText!.indexOf(filterPart) >= 0;
    }

    private parseQuickFilter(newFilter?: string): string | null {
        if (!_.exists(newFilter)) {
            return null;
        }

        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('ag-grid: quick filtering only works with the Client-Side Row Model');
            return null;
        }

        return newFilter.toUpperCase();
    }

    private parseQuickFilterParts(newFilter: string | null): string[] | null {
        if (!_.exists(newFilter)) {
            return null;
        }

        return newFilter.split(' ');
    }

    private getQuickFilterTextForColumn(column: Column, node: RowNode): string {
        let value = this.valueService.getValue(column, node, true);
        const colDef = column.getColDef();

        if (colDef.getQuickFilterText) {
            const params: GetQuickFilterTextParams = {
                value,
                node,
                data: node.data,
                column,
                colDef,
                context: this.gridOptionsWrapper.getContext()
            };

            value = colDef.getQuickFilterText(params);
        }

        return _.exists(value) ? value.toString().toUpperCase() : null;
    }

    private aggregateRowForQuickFilter(node: RowNode): void {
        const stringParts: string[] = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (_.exists(part)) {
                stringParts.push(part);
            }
        });

        node.quickFilterAggregateText = stringParts.join(QUICK_FILTER_SEPARATOR);
    }
}
