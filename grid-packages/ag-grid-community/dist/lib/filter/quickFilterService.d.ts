import { BeanStub } from "../context/beanStub";
import { RowNode } from "../entities/rowNode";
export declare class QuickFilterService extends BeanStub {
    private valueService;
    private columnModel;
    private rowModel;
    static readonly EVENT_QUICK_FILTER_CHANGED = "quickFilterChanged";
    private static readonly QUICK_FILTER_SEPARATOR;
    private quickFilter;
    private quickFilterParts;
    private parser?;
    private matcher?;
    private postConstruct;
    isQuickFilterPresent(): boolean;
    doesRowPassQuickFilter(node: RowNode): boolean;
    resetQuickFilterCache(): void;
    private setQuickFilterParts;
    private parseQuickFilter;
    private setQuickFilter;
    private setQuickFilterParserAndMatcher;
    private onIncludeHiddenColumnsInQuickFilterChanged;
    private doesRowPassQuickFilterNoCache;
    private doesRowPassQuickFilterCache;
    private doesRowPassQuickFilterMatcher;
    private checkGenerateQuickFilterAggregateText;
    private getQuickFilterTextForColumn;
    private getQuickFilterAggregateText;
}
