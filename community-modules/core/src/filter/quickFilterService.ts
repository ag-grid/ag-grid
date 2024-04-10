import { BeanStub } from "../context/beanStub";
import { Bean, PostConstruct } from "../context/context";
import { GetQuickFilterTextParams } from "../entities/colDef";
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { Events } from "../eventKeys";
import { exists } from "../utils/generic";

@Bean('quickFilterService')
export class QuickFilterService extends BeanStub {

    public static readonly EVENT_QUICK_FILTER_CHANGED = 'quickFilterChanged';
    private static readonly QUICK_FILTER_SEPARATOR = '\n';

    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;
    private parser?: (quickFilter: string) => string[];
    private matcher?: (quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedEventListener(Events.EVENT_NEW_COLUMNS_LOADED, () => this.resetQuickFilterCache());
        this.addManagedEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.resetQuickFilterCache());
        this.addManagedEventListener(Events.EVENT_COLUMN_VISIBLE, () => {
            if (!this.beans.gos.get('includeHiddenColumnsInQuickFilter')) {
                this.resetQuickFilterCache();
            }
        });

        this.addManagedPropertyListener('quickFilterText', (e) => this.setQuickFilter(e.currentValue));
        this.addManagedPropertyListeners([
            'includeHiddenColumnsInQuickFilter', 'applyQuickFilterBeforePivotOrAgg'
        ], () => this.onQuickFilterColumnConfigChanged());

        this.quickFilter = this.parseQuickFilter(this.beans.gos.get('quickFilterText'));
        this.parser = this.beans.gos.get('quickFilterParser');
        this.matcher = this.beans.gos.get('quickFilterMatcher');
        this.setQuickFilterParts();

        this.addManagedPropertyListeners(['quickFilterMatcher', 'quickFilterParser'], () => this.setQuickFilterParserAndMatcher());
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPassQuickFilter(node: RowNode): boolean {
        const usingCache = this.beans.gos.get('cacheQuickFilter');

        if (this.matcher) {
            return this.doesRowPassQuickFilterMatcher(usingCache, node);
        }

        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts!.every(part =>
            usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part)
        );
    }

    public resetQuickFilterCache(): void {
        this.beans.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
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

        if (!this.beans.gos.isRowModelType('clientSide')) {
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
        const parser = this.beans.gos.get('quickFilterParser');
        const matcher = this.beans.gos.get('quickFilterMatcher');
        const hasChanged = parser !== this.parser || matcher !== this.matcher;
        this.parser = parser;
        this.matcher = matcher;
        if (hasChanged) {
            this.setQuickFilterParts();
            this.dispatchEvent({ type: QuickFilterService.EVENT_QUICK_FILTER_CHANGED });
        }
    }

    private onQuickFilterColumnConfigChanged(): void {
        this.beans.columnModel.refreshQuickFilterColumns();
        this.resetQuickFilterCache();
        if (this.isQuickFilterPresent()) {
            this.dispatchEvent({ type: QuickFilterService.EVENT_QUICK_FILTER_CHANGED });
        }
    }

    private doesRowPassQuickFilterNoCache(node: RowNode, filterPart: string): boolean {
        const columns = this.beans.columnModel.getAllColumnsForQuickFilter();

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
        let value = this.beans.valueService.getValue(column, node, true);
        const colDef = column.getColDef();

        if (colDef.getQuickFilterText) {
            const params: GetQuickFilterTextParams = this.beans.gos.addGridCommonParams({
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
        const columns = this.beans.columnModel.getAllColumnsForQuickFilter();

        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (exists(part)) {
                stringParts.push(part);
            }
        });

        return stringParts.join(QuickFilterService.QUICK_FILTER_SEPARATOR);
    }
}