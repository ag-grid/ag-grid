import { _areEqual, _isRealCssEngine } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn, ColumnLane } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnGroupService } from './columnGroups/columnGroupService';
import type { ColumnModel } from './columnModel';
import type { VisibleColsService } from './visibleColsService';

export class ColumnViewportService extends BeanStub implements NamedBean {
    beanName = 'colViewport' as const;

    private visibleCols: VisibleColsService;
    private colModel: ColumnModel;
    private colGroupSvc?: ColumnGroupService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleCols = beans.visibleCols;
        this.colModel = beans.colModel;
        this.colGroupSvc = beans.colGroupSvc;
    }

    // cols in center that are in the viewport
    private colsWithinViewport: AgColumn[] = [];
    // same as colsWithinViewport, except we always include columns with headerAutoHeight
    private headerColsWithinViewport: AgColumn[] = [];

    /** `-1` never matches a real version, so the first extraction always runs. */
    private extractedLayoutVersion = -1;
    private extractedGroupVersion = -1;

    /** Bumped whenever the rendered header sections are rebuilt, so a header row can tell whether the set
     *  it last rendered is still the current one. */
    public headerRowsVersion = 0;

    // all columns & groups to be rendered, indexed by group level (a dense counter from zero, hence an
    // array): used by header rows to get all items to render for that row.
    private rowsOfHeadersToRenderLeft: AgColumnGroup[][] = [];
    private rowsOfHeadersToRenderRight: AgColumnGroup[][] = [];
    private rowsOfHeadersToRenderCenter: AgColumnGroup[][] = [];

    private columnsToRenderLeft: AgColumn[] = [];
    private columnsToRenderRight: AgColumn[] = [];
    private columnsToRenderCenter: AgColumn[] = [];

    private scrollWidth: number;
    private scrollPosition: number;

    /** Zero until the first `setScrollPosition`: bounds of `NaN` would instead exclude every column. */
    private viewportLeft = 0;
    private viewportRight = 0;

    private suppressColumnVirtualisation: boolean;

    public postConstruct(): void {
        this.suppressColumnVirtualisation = this.gos.get('suppressColumnVirtualisation');
    }

    public getScrollPosition(): number {
        return this.scrollPosition;
    }

    public setScrollPosition(scrollWidth: number, scrollPosition: number, afterScroll: boolean = false): void {
        // Same viewport over the same layout extracts the same columns, so there is nothing to look at.
        if (
            scrollWidth === this.scrollWidth &&
            scrollPosition === this.scrollPosition &&
            this.visibleCols.layoutVersion === this.extractedLayoutVersion
        ) {
            return;
        }

        this.scrollWidth = scrollWidth;
        this.scrollPosition = scrollPosition;
        this.viewportLeft = scrollPosition;
        this.viewportRight = scrollWidth + scrollPosition;

        if (this.colModel.ready) {
            this.checkViewportColumns(afterScroll);
        }
    }

    /**
     * Returns the columns that are currently rendered in the viewport.
     */
    public getColumnHeadersToRender(lane: ColumnLane): AgColumn[] {
        if (lane === 0) {
            return this.columnsToRenderLeft;
        }
        return lane === 2 ? this.columnsToRenderRight : this.columnsToRenderCenter;
    }

    /** Undefined for a header row with no groups in that section, which the caller skips rather than
     *  paying for an empty array. */
    public getHeadersToRender(lane: ColumnLane, depth: number): AgColumnGroup[] | undefined {
        if (lane === 0) {
            return this.rowsOfHeadersToRenderLeft[depth];
        }
        return lane === 2 ? this.rowsOfHeadersToRenderRight[depth] : this.rowsOfHeadersToRenderCenter[depth];
    }

    private extractViewportColumns(): void {
        const displayedColumnsCenter = this.visibleCols.centerCols;
        if (this.isColumnVirtualisationSuppressed()) {
            // no virtualisation, so don't filter
            this.colsWithinViewport = displayedColumnsCenter;
            this.headerColsWithinViewport = displayedColumnsCenter;
            return;
        }

        // The header set only adds columns the rows left out, so it shares their array until one turns up.
        const rowCols: AgColumn[] = [];
        let headerCols: AgColumn[] | null = null;
        for (let i = 0, len = displayedColumnsCenter.length; i < len; ++i) {
            const col = displayedColumnsCenter[i];
            if (this.isColumnInRowViewport(col)) {
                rowCols.push(col);
                headerCols?.push(col);
            } else if (hasAutoHeaderHeight(col)) {
                headerCols ??= rowCols.slice();
                headerCols.push(col);
            }
        }
        this.colsWithinViewport = rowCols;
        this.headerColsWithinViewport = headerCols ?? rowCols;
    }

    private isColumnVirtualisationSuppressed() {
        // A zero viewport width is a real zero width in a browser, but in unit tests it only means
        // nothing measures, so keep building every column there.
        return this.suppressColumnVirtualisation || (this.viewportRight === 0 && !_isRealCssEngine());
    }

    public clear(): void {
        this.rowsOfHeadersToRenderLeft = [];
        this.rowsOfHeadersToRenderRight = [];
        this.rowsOfHeadersToRenderCenter = [];
        this.columnsToRenderLeft = [];
        this.columnsToRenderRight = [];
        this.columnsToRenderCenter = [];
        this.colsWithinViewport = [];
        this.headerColsWithinViewport = [];
        this.extractedLayoutVersion = -1;
        this.extractedGroupVersion = -1;
    }

    private isColumnInRowViewport(col: AgColumn): boolean {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) {
            return true;
        }

        const columnLeft = col.getLeft() || 0;

        // 200px of buffer either side: fewer white gaps when scrolling fast, at the cost of redraw work.
        // A width is never negative, so overlap is one comparison per edge.
        return columnLeft + col.getActualWidth() >= this.viewportLeft - 200 && columnLeft <= this.viewportRight + 200;
    }

    // used by Grid API only
    public getViewportColumns(): AgColumn[] {
        const { leftCols, rightCols } = this.visibleCols;
        return this.colsWithinViewport.concat(leftCols, rightCols);
    }

    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    public getColsWithinViewport(rowNode: RowNode, spans: number[] | null = null): AgColumn[] {
        if (!this.colModel.colSpanActive) {
            return this.colsWithinViewport;
        }

        // if doing column virtualisation, then we filter based on the viewport.
        const inViewportCallback = this.isColumnVirtualisationSuppressed() ? null : this.inRowViewport;
        const { visibleCols } = this;
        const displayedColumnsCenter = visibleCols.centerCols;

        return visibleCols.getColsForRow(
            rowNode,
            displayedColumnsCenter,
            spans,
            inViewportCallback,
            this.emptySpaceBeforeColumn
        );
    }

    /** Bound once, not per call: `getColsWithinViewport` runs per rendered row when col spanning. */
    private readonly inRowViewport = (col: AgColumn): boolean => this.isColumnInRowViewport(col);
    private readonly emptySpaceBeforeColumn = (col: AgColumn): boolean => {
        const left = col.getLeft();
        return left != null && left > this.viewportLeft;
    };

    // checks what columns are currently displayed due to column virtualisation. dispatches an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    public checkViewportColumns(afterScroll: boolean = false): void {
        const { leftCols, rightCols, layoutVersion } = this.visibleCols;
        const groupVersion = this.colGroupSvc?.groupVersion ?? 0;

        this.extractViewportColumns();
        this.extractedLayoutVersion = layoutVersion;

        // `calculateHeaderRows` is the only writer of `columnsToRender*`, so they still hold the previous
        // sections.
        const changed =
            !_areEqual(this.columnsToRenderCenter, this.colsWithinViewport) ||
            !_areEqual(this.columnsToRenderLeft, leftCols) ||
            !_areEqual(this.columnsToRenderRight, rightCols);

        // Groups are runs of adjacent leaves, so moving a column that is virtualised out can re-parent a
        // rendered one, which keeps its identity and its place and so passes the comparison unchanged.
        if (changed || groupVersion !== this.extractedGroupVersion) {
            this.extractedGroupVersion = groupVersion;
            this.calculateHeaderRows();
        }
        // Only the rendered columns: a regroup leaves the cells alone, and the header rows it does
        // affect are re-read on the `displayedColumnsChanged` that every rebuild dispatches after this.
        if (changed) {
            this.eventSvc.dispatchEvent({
                type: 'virtualColumnsChanged',
                afterScroll,
            });
        }
    }

    private calculateHeaderRows(): void {
        const { leftCols, rightCols } = this.visibleCols;

        this.columnsToRenderLeft = leftCols;
        this.columnsToRenderRight = rightCols;
        this.columnsToRenderCenter = this.colsWithinViewport;

        this.rowsOfHeadersToRenderLeft = workOutGroupsToRender(leftCols);
        this.rowsOfHeadersToRenderRight = workOutGroupsToRender(rightCols);
        this.rowsOfHeadersToRenderCenter = workOutGroupsToRender(this.headerColsWithinViewport);
        ++this.headerRowsVersion;
    }
}

/** Module-level to avoid three Set allocations per header rebuild. */
const seenGroups = new Set<AgColumnGroup>();

/** Buckets `group` and its ancestors by level, stopping at the first one already bucketed. */
const addGroupChain = (group: AgColumnGroup | null, skipFillers: boolean, groupsToRender: AgColumnGroup[][]): void => {
    while (group) {
        // Already bucketed means its ancestors are too, so the rest of the chain adds nothing.
        if (seenGroups.has(group)) {
            return;
        }

        if (skipFillers && group.isPadding()) {
            group = group.parent;
            continue;
        }

        const level = group.getProvidedColumnGroup().getLevel();
        const row = groupsToRender[level];
        if (!row) {
            groupsToRender[level] = [group];
        } else {
            row.push(group);
        }
        seenGroups.add(group);
        group = group.parent;
    }
};

/** The groups above `cols`, bucketed by level, which is what one header row renders. */
const workOutGroupsToRender = (cols: AgColumn[]): AgColumnGroup[][] => {
    seenGroups.clear();
    const groupsToRender: AgColumnGroup[][] = [];

    // Leaves under one group are contiguous, and the walk is decided entirely by where it starts and
    // whether fillers are skipped, so a run that repeats both would add nothing the first one did not.
    let lastParent: AgColumnGroup | null = null;
    let lastSkipFillers = false;
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        const group = col.parent;
        const skipFillers = col.isSpanHeaderHeight();
        if (group !== lastParent || skipFillers !== lastSkipFillers) {
            lastParent = group;
            lastSkipFillers = skipFillers;
            addGroupChain(group, skipFillers, groupsToRender);
        }
    }

    // Not held past the call, or it retains this build's groups, destroyed ones included.
    seenGroups.clear();
    return groupsToRender;
};

/** Set on the column itself or on any group above it: either way its header has to be measured. */
const hasAutoHeaderHeight = (col: AgColumn | AgColumnGroup | null): boolean => {
    while (col) {
        if (col.isAutoHeaderHeight()) {
            return true;
        }
        col = col.parent;
    }

    return false;
};
