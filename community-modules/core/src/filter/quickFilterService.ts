import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { GetQuickFilterTextParams } from "../entities/colDef";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Events } from "../eventKeys";
import { IRowModel } from "../interfaces/iRowModel";
import { exists } from "../utils/generic";
import { ValueService } from "../valueService/valueService";

@Bean('quickFilterService')
export class QuickFilterService extends BeanStub {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;

    public static readonly EVENT_QUICK_FILTER_CHANGED = 'quickFilterChanged';
    private static readonly QUICK_FILTER_SEPARATOR = '\n';

    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;
    private parser?: (quickFilter: string) => string[];
    private matcher?: (quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => {
            if (!this.gos.get('includeHiddenColumnsInQuickFilter')) {
                this.resetQuickFilterCache();
            }
        });

        this.addManagedPropertyListener('quickFilterText', (e) => this.setQuickFilter(e.currentValue));
        this.addManagedPropertyListener('includeHiddenColumnsInQuickFilter', () => this.onIncludeHiddenColumnsInQuickFilterChanged());

        this.quickFilter = this.parseQuickFilter(this.gos.get('quickFilterText'));
        this.parser = this.gos.get('quickFilterParser');
        this.matcher = this.gos.get('quickFilterMatcher');
        this.setQuickFilterParts();

        this.addManagedPropertyListeners(['quickFilterMatcher', 'quickFilterParser'], () => this.setQuickFilterParserAndMatcher());
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPassQuickFilter(node: RowNode): boolean {
        const usingCache = this.gos.get('cacheQuickFilter');

        if (this.matcher) {
            return this.doesRowPassQuickFilterMatcher(usingCache, node);
        }

        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts!.every(part =>
            usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part)
        );
    }

    public resetQuickFilterCache(): void {
        this.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
    }

    private setQuickFilterParts(): void {
        const { quickFilter, parser } = this;
        if (quickFilter) {
            this.quickFilterParts = parser ? parser(quickFilter) : quickFilter.split(' ');
        } else {
            this.quickFilterParts = null;
        }
    }

    private parseQuickFilter(newFilter?: string): string | null {
        if (!exists(newFilter)) {
            return null;
        }

        if (!this.gos.isRowModelType('clientSide')) {
            console.warn('AG Grid - Quick filtering only works with the Client-Side Row Model');
            return null;
        }

        return newFilter.toUpperCase();
    }

    private setQuickFilter(newFilter: string | undefined): void {
        if (newFilter != null && typeof newFilter !== 'string') {
            console.warn(`AG Grid - Grid option quickFilterText only supports string inputs, received: ${typeof newFilter}`);
            return;
        }

        const parsedFilter = this.parseQuickFilter(newFilter);

        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService.EVENT_QUICK_FILTER_CHANGED });
        }
    }

    private setQuickFilterParserAndMatcher(): void {
        const parser = this.gos.get('quickFilterParser');
        const matcher = this.gos.get('quickFilterMatcher');
        const hasChanged = parser !== this.parser || matcher !== this.matcher;
        this.parser = parser;
        this.matcher = matcher;
        if (hasChanged) {
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService.EVENT_QUICK_FILTER_CHANGED });
        }
    }

    private onIncludeHiddenColumnsInQuickFilterChanged(): void {
        this.columnModel.refreshQuickFilterColumns();
        this.resetQuickFilterCache();
        if (this.isQuickFilterPresent()) {
            this.dispatchEvent({ type: QuickFilterService.EVENT_QUICK_FILTER_CHANGED });
        }
    }

    private doesRowPassQuickFilterNoCache(node: RowNode, filterPart: string): boolean {
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        return columns.some(column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            return exists(part) && part.indexOf(filterPart) >= 0;
        });
    }

    private doesRowPassQuickFilterCache(node: RowNode, filterPart: string): boolean {
        this.checkGenerateQuickFilterAggregateText(node);

        return node.quickFilterAggregateText!.indexOf(filterPart) >= 0;
    }

    private doesRowPassQuickFilterMatcher(usingCache: boolean, node: RowNode): boolean {
        let quickFilterAggregateText: string;
        if (usingCache) {
            this.checkGenerateQuickFilterAggregateText(node);
            quickFilterAggregateText = node.quickFilterAggregateText!;
        } else {
            quickFilterAggregateText = this.getQuickFilterAggregateText(node);
        }
        const { quickFilterParts, matcher } = this;
        return matcher!(quickFilterParts!, quickFilterAggregateText);
    }

    private checkGenerateQuickFilterAggregateText(node: RowNode): void {
        if (!node.quickFilterAggregateText) {
            node.quickFilterAggregateText = this.getQuickFilterAggregateText(node)
        }
    }

    private getQuickFilterTextForColumn(column: Column, node: RowNode): string {
        let value = this.valueService.getValue(column, node, true);
        const colDef = column.getColDef();

        if (colDef.getQuickFilterText) {
            const params: GetQuickFilterTextParams = this.gos.addGridCommonParams({
                value,
                node,
                data: node.data,
                column,
                colDef
            });

            value = colDef.getQuickFilterText(params);
        }

        return exists(value) ? value.toString().toUpperCase() : null;
    }

    private getQuickFilterAggregateText(node: RowNode): string {
        const stringParts: string[] = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (exists(part)) {
                stringParts.push(part);
            }
        });

        return stringParts.join(QuickFilterService.QUICK_FILTER_SEPARATOR);
    }
}