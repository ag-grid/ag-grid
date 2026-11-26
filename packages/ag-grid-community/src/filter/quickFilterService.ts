import type { AgEvent } from 'ag-stack';
import { _areEqual, _exists } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { GetQuickFilterTextParams } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { FilterChangedEventSourceType } from '../events';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { QuickFilterState } from '../interfaces/gridState';

type QuickFilterServiceEvent = 'quickFilterChanged';

export interface QuickFilterChangedEvent extends AgEvent<QuickFilterServiceEvent> {
    /** Source to report on the resulting `filterChanged` event, when the change did not come from the user. */
    source?: FilterChangedEventSourceType;
}

export class QuickFilterService extends BeanStub<QuickFilterServiceEvent> implements NamedBean {
    beanName = 'quickFilter' as const;

    // the columns the quick filter should use. this will be all primary columns plus the autoGroupColumns if any exist
    private colsToUse: AgColumn[] = [];
    /** The `colModel.colDefsVersion` the rows' cached text was built for. */
    private colDefsVersion = -1;

    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;
    private parser?: (quickFilter: string) => string[];
    /** Set for the duration of a state restore, so the resulting `filterChanged` reports its source. */
    private stateSource?: FilterChangedEventSourceType;
    private matcher?: (quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean;

    public postConstruct(): void {
        const gos = this.gos;
        this.addManagedPropertyListener('quickFilterText', (e) => this.setFilter(e.currentValue));
        this.addManagedPropertyListeners(
            ['includeHiddenColumnsInQuickFilter', 'applyQuickFilterBeforePivotOrAgg'],
            () => this.onColumnConfigChanged()
        );

        this.quickFilter = this.parseFilter(gos.get('quickFilterText'));
        this.parser = gos.get('quickFilterParser');
        this.matcher = gos.get('quickFilterMatcher');
        this.setFilterParts();

        this.addManagedPropertyListeners(['quickFilterMatcher', 'quickFilterParser'], () => this.setParserAndMatcher());
    }

    // if we are using autoGroupCols, then they should be included for quick filter. this covers the
    // following scenarios:
    // a) user provides 'field' into autoGroupCol of normal grid, so now because a valid col to filter leafs on
    // b) using tree data and user depends on autoGroupCol for first col, and we also want to filter on this
    //    (tree data is a bit different, as parent rows can be filtered on, unlike row grouping)
    private updateColsToUse(): boolean {
        const { autoColSvc, colModel, gos, pivotResultCols, syncSvc } = this.beans;
        const pivotResult = colModel.pivotMode && !gos.get('applyQuickFilterBeforePivotOrAgg');
        const groupAutoCols = autoColSvc?.columns;
        const providedCols = colModel.colDefList;

        let columnsForQuickFilter = (pivotResult ? pivotResultCols?.pivotCols : providedCols) ?? [];
        if (groupAutoCols?.length) {
            columnsForQuickFilter = columnsForQuickFilter.concat(groupAutoCols);
        }
        const colsToUse = gos.get('includeHiddenColumnsInQuickFilter')
            ? columnsForQuickFilter
            : columnsForQuickFilter.filter((col) => col.visible || col.rowGroupActive);
        const colDefsVersion = colModel.colDefsVersion;
        const colsChanged = !_areEqual(colsToUse, this.colsToUse);
        // the rows' cached text is built from these columns and their definitions
        if (colDefsVersion !== this.colDefsVersion || colsChanged) {
            this.colDefsVersion = colDefsVersion;
            this.resetCache();
        }
        this.colsToUse = colsToUse;
        // the rows refresh builds the pivot result columns and filters by them next: there only a show or hide asks
        return colsChanged && (!pivotResult || syncSvc.changes.rowChanges.columnsVisible);
    }

    /** Re-reads the matched columns; a change the rows did not make re-filters them while a quick filter is set. */
    public refreshCols(): void {
        if (!this.updateColsToUse() || !this.isFilterPresent()) {
            return;
        }
        this.beans.syncSvc.filterChanged(true, true);
    }

    public isFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPass(node: RowNode): boolean {
        const usingCache = this.gos.get('cacheQuickFilter');

        if (this.matcher) {
            return this.doesRowPassMatcher(usingCache, node);
        }

        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts!.every((part) =>
            usingCache ? this.doesRowPassCache(node, part) : this.doesRowPassNoCache(node, part)
        );
    }

    public resetCache(): void {
        if (!this.gos.get('cacheQuickFilter')) {
            return; // no row holds a text: only the cache writes one
        }
        this.beans.rowModel.forEachNode((node) => (node.quickFilterAggregateText = null));
    }

    public getText(): string | undefined {
        return this.gos.get('quickFilterText');
    }

    public getState(): QuickFilterState | undefined {
        // This service holds an uppercased, parsed form; the option is the round-trippable value.
        const text = this.getText() || undefined;
        return text ? { text } : undefined;
    }

    /** An absent `text` leaves the `quickFilterText` grid option as it is. */
    public setState({ text }: QuickFilterState, source?: FilterChangedEventSourceType): void {
        if (text === undefined) {
            return;
        }
        // The option write applies synchronously through this service's own property listener, so the
        // source is readable by the dispatch it triggers and gone again by the time this returns.
        this.stateSource = source;
        try {
            this.gos.updateGridOptions({ options: { quickFilterText: text } });
        } finally {
            this.stateSource = undefined;
        }
    }

    private setFilterParts(): void {
        const { quickFilter, parser } = this;
        if (quickFilter) {
            this.quickFilterParts = parser ? parser(quickFilter) : quickFilter.split(' ');
        } else {
            this.quickFilterParts = null;
        }
    }

    private parseFilter(newFilter?: string): string | null {
        if (!_exists(newFilter)) {
            return null;
        }

        return newFilter.toUpperCase();
    }

    private setFilter(newFilter: string | undefined): void {
        if (newFilter != null && typeof newFilter !== 'string') {
            this.warn(70, { newFilter });
            return;
        }

        const parsedFilter = this.parseFilter(newFilter);

        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setFilterParts();
            this.dispatchLocalEvent<QuickFilterChangedEvent>({
                type: 'quickFilterChanged',
                source: this.stateSource,
            });
        }
    }

    private setParserAndMatcher(): void {
        const parser = this.gos.get('quickFilterParser');
        const matcher = this.gos.get('quickFilterMatcher');
        const hasChanged = parser !== this.parser || matcher !== this.matcher;
        this.parser = parser;
        this.matcher = matcher;
        if (hasChanged) {
            this.setFilterParts();
            this.dispatchLocalEvent({ type: 'quickFilterChanged' });
        }
    }

    private onColumnConfigChanged(): void {
        // the quickFilterChanged below refreshes the rows
        this.colDefsVersion = -1; // these options change every row's cached text
        this.updateColsToUse();
        if (this.isFilterPresent()) {
            this.dispatchLocalEvent({ type: 'quickFilterChanged' });
        }
    }

    private doesRowPassNoCache(node: RowNode, filterPart: string): boolean {
        return this.colsToUse.some((column) => {
            const part = this.getTextForColumn(column, node);

            return _exists(part) && part.includes(filterPart);
        });
    }

    private doesRowPassCache(node: RowNode, filterPart: string): boolean {
        this.checkGenerateAggText(node);

        return node.quickFilterAggregateText!.includes(filterPart);
    }

    private doesRowPassMatcher(usingCache: boolean, node: RowNode): boolean {
        let quickFilterAggregateText: string;
        if (usingCache) {
            this.checkGenerateAggText(node);
            quickFilterAggregateText = node.quickFilterAggregateText!;
        } else {
            quickFilterAggregateText = this.getAggText(node);
        }
        const { quickFilterParts, matcher } = this;
        return matcher!(quickFilterParts!, quickFilterAggregateText);
    }

    private checkGenerateAggText(node: RowNode): void {
        if (!node.quickFilterAggregateText) {
            node.quickFilterAggregateText = this.getAggText(node);
        }
    }

    private getTextForColumn(column: AgColumn, node: RowNode): string | null {
        let value = this.beans.filterValueSvc!.getValue(column, node);
        const colDef = column.colDef;

        if (colDef.getQuickFilterText) {
            const params: GetQuickFilterTextParams = _addGridCommonParams(this.gos, {
                value,
                node,
                data: node.data,
                column,
                colDef,
            });

            value = colDef.getQuickFilterText(params);
        }

        return _exists(value) ? value.toString().toUpperCase() : null;
    }

    private getAggText(node: RowNode): string {
        const stringParts: string[] = [];

        for (const column of this.colsToUse) {
            const part = this.getTextForColumn(column, node);

            if (_exists(part)) {
                stringParts.push(part);
            }
        }

        return stringParts.join('\n');
    }
}
