import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import { _exists } from '../utils/generic';
import { getOriginalColumnTreeDepth } from './columnGroups/columnGroupUtils';
import type { ColumnModel } from './columnModel';
import type { VisibleColsService } from './visibleColsService';

export class ColumnViewportService extends BeanStub implements NamedBean {
    beanName = 'colViewport' as const;

    private visibleCols: VisibleColsService;
    private colModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.visibleCols = beans.visibleCols;
        this.colModel = beans.colModel;
    }

    // cols in center that are in the viewport
    private colsWithinViewport: AgColumn[] = [];
    // same as colsWithinViewport, except we always include columns with headerAutoHeight
    private headerColsWithinViewport: AgColumn[] = []; // opps? What do with this.

    // A hash key to keep track of changes in viewport columns
    private colsWithinViewportHash: string = '';

    // all columns & groups to be rendered, index by row.
    // used by header rows to get all items to render for that row.
    private rowsOfHeadersToRenderLeft: { [row: number]: (AgColumnGroup | AgColumn)[] } = {};
    private rowsOfHeadersToRenderRight: { [row: number]: (AgColumnGroup | AgColumn)[] } = {};
    private rowsOfHeadersToRenderCenter: { [row: number]: (AgColumnGroup | AgColumn)[] } = {};

    private columnsToRenderLeft: AgColumn[] = [];
    private columnsToRenderRight: AgColumn[] = [];
    private columnsToRenderCenter: AgColumn[] = [];

    public treeDepth: number = 0;

    private scrollWidth: number;
    private scrollPosition: number;

    private viewportLeft: number; // same as scrollPosition, except when doing RTL
    private viewportRight: number;

    private suppressColumnVirtualisation: boolean;

    public postConstruct(): void {
        this.suppressColumnVirtualisation = this.gos.get('suppressColumnVirtualisation');
    }

    public setScrollPosition(scrollWidth: number, scrollPosition: number, afterScroll: boolean = false): void {
        const { visibleCols } = this;
        const bodyWidthDirty = visibleCols.isBodyWidthDirty;

        const noChange = scrollWidth === this.scrollWidth && scrollPosition === this.scrollPosition && !bodyWidthDirty;
        if (noChange) {
            return;
        }

        this.scrollWidth = scrollWidth;
        this.scrollPosition = scrollPosition;
        // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
        // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
        // virtual columns again
        visibleCols.isBodyWidthDirty = true;

        if (this.gos.get('enableRtl')) {
            const bodyWidth = visibleCols.bodyWidth;
            this.viewportLeft = bodyWidth - scrollPosition - scrollWidth;
            this.viewportRight = bodyWidth - scrollPosition;
        } else {
            this.viewportLeft = scrollPosition;
            this.viewportRight = scrollWidth + scrollPosition;
        }

        if (this.colModel.ready) {
            this.checkViewportColumns(afterScroll);
        }
    }

    public getColumnsToRender(type: ColumnPinnedType) {
        switch (type) {
            case 'left':
                return this.columnsToRenderLeft;
            case 'right':
                return this.columnsToRenderRight;
            default:
                return this.columnsToRenderCenter;
        }
    }

    /**
     * Returns an array of column groups _or_ columns, when a column is returned, this is merely padding.
     */
    public getColumnGroupsToRender(type: ColumnPinnedType, depth: number) {
        switch (type) {
            case 'left':
                return this.rowsOfHeadersToRenderLeft[depth] ?? [];
            case 'right':
                return this.rowsOfHeadersToRenderRight[depth] ?? [];
            default:
                return this.rowsOfHeadersToRenderCenter[depth] ?? [];
        }
    }

    private extractViewportColumns(): void {
        const displayedColumnsCenter = this.visibleCols.centerCols;
        if (this.isColumnVirtualisationSuppressed()) {
            // no virtualisation, so don't filter
            this.colsWithinViewport = displayedColumnsCenter;
            this.headerColsWithinViewport = displayedColumnsCenter;
        } else {
            // filter out what should be visible
            this.colsWithinViewport = displayedColumnsCenter.filter(this.isColumnInRowViewport.bind(this));
            this.headerColsWithinViewport = displayedColumnsCenter.filter(this.isColumnInHeaderViewport.bind(this));
        }
    }

    private isColumnVirtualisationSuppressed() {
        // When running within jsdom the viewportRight is always 0, so we need to return true to allow
        // tests to validate all the columns.
        return this.suppressColumnVirtualisation || this.viewportRight === 0;
    }

    public clear(suppressHashClear?: boolean): void {
        this.rowsOfHeadersToRenderLeft = {};
        this.rowsOfHeadersToRenderRight = {};
        this.rowsOfHeadersToRenderCenter = {};
        if (!suppressHashClear) {
            this.colsWithinViewportHash = '';
        }
    }

    private isColumnInHeaderViewport(col: AgColumn): boolean {
        // for headers, we never filter out autoHeaderHeight columns, if calculating
        if (col.isAutoHeaderHeight() || isAnyParentAutoHeaderHeight(col)) {
            return true;
        }

        return this.isColumnInRowViewport(col);
    }

    private isColumnInRowViewport(col: AgColumn): boolean {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) {
            return true;
        }

        const columnLeft = col.getLeft() || 0;
        const columnRight = columnLeft + col.getActualWidth();

        // adding 200 for buffer size, so some cols off viewport are rendered.
        // this helps horizontal scrolling so user rarely sees white space (unless
        // they scroll horizontally fast). however we are conservative, as the more
        // buffer the slower the vertical redraw speed
        const leftBounds = this.viewportLeft - 200;
        const rightBounds = this.viewportRight + 200;

        const columnToMuchLeft = columnLeft < leftBounds && columnRight < leftBounds;
        const columnToMuchRight = columnLeft > rightBounds && columnRight > rightBounds;

        return !columnToMuchLeft && !columnToMuchRight;
    }

    // used by Grid API only
    public getViewportColumns(): AgColumn[] {
        const { leftCols, rightCols } = this.visibleCols;
        const res = this.colsWithinViewport.concat(leftCols).concat(rightCols);
        return res;
    }

    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    public getColsWithinViewport(rowNode: RowNode): AgColumn[] {
        if (!this.colModel.colSpanActive) {
            return this.colsWithinViewport;
        }

        const emptySpaceBeforeColumn = (col: AgColumn) => {
            const left = col.getLeft();

            return _exists(left) && left > this.viewportLeft;
        };

        // if doing column virtualisation, then we filter based on the viewport.
        const inViewportCallback = this.isColumnVirtualisationSuppressed()
            ? undefined
            : this.isColumnInRowViewport.bind(this);
        const { visibleCols } = this;
        const displayedColumnsCenter = visibleCols.centerCols;

        return visibleCols.getColsForRow(rowNode, displayedColumnsCenter, inViewportCallback, emptySpaceBeforeColumn);
    }

    // checks what columns are currently displayed due to column virtualisation. dispatches an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    public checkViewportColumns(afterScroll: boolean = false): void {
        const viewportColumnsChanged = this.extractViewport();
        if (viewportColumnsChanged) {
            this.eventSvc.dispatchEvent({
                type: 'virtualColumnsChanged',
                afterScroll,
            });
        }
    }

    private calculateHeaderRows(): void {
        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.clear(true);

        const { leftCols, rightCols } = this.visibleCols;

        this.columnsToRenderLeft = leftCols;
        this.columnsToRenderRight = rightCols;
        this.columnsToRenderCenter = this.colsWithinViewport;

        // if empty header groups are allowed, then max depth is calculated from all selected cols, otherwise
        // only visible cols
        this.treeDepth = this.beans.gos.get('suppressEmptyHeaderRows')
            ? getOriginalColumnTreeDepth(this.visibleCols.allCols)
            : this.beans.colModel.cols?.treeDepth ?? 0;

        const workOutGroupsToRender = (cols: AgColumn[]) => {
            const groupsToRenderSet = new Set<AgColumnGroup>();
            const groupsToRender: { [row: number]: (AgColumnGroup | AgColumn)[] } = {};

            for (const col of cols) {
                let parent = col.getParent();
                const balanceTree = col.getColDef().suppressSpanHeaderHeight;

                if (balanceTree) {
                    // each tree needs more rendered filler groups if it is not balanced
                    const balanceToDepth = (parent?.getLevel() ?? -1) + 1;
                    for (let i = balanceToDepth; i < this.treeDepth; i++) {
                        groupsToRender[i] ??= [];
                        groupsToRender[i].push(col);
                    }
                }

                while (parent) {
                    if (groupsToRenderSet.has(parent)) {
                        parent = parent.getParent();
                        continue;
                    }

                    const level = parent.getLevel();
                    groupsToRender[level] ??= [];
                    groupsToRender[level].push(parent);
                    groupsToRenderSet.add(parent);
                    parent = parent.getParent();
                }
            }

            return groupsToRender;
        };

        this.rowsOfHeadersToRenderLeft = workOutGroupsToRender(leftCols);
        this.rowsOfHeadersToRenderRight = workOutGroupsToRender(rightCols);
        // should these be this.headerColsWithinViewport?
        this.rowsOfHeadersToRenderCenter = workOutGroupsToRender(this.headerColsWithinViewport);
        console.log('groupsToRenderCenter', this.rowsOfHeadersToRenderCenter);
        // const testGroup = (
        //     children: (AgColumn | AgColumnGroup)[],
        //     result: { [row: number]: (AgColumn | AgColumnGroup)[] },
        //     depth: number
        // ): boolean => {
        //     let returnValue = false;

        //     for (let i = 0; i < children.length; i++) {
        //         // see if this item is within viewport
        //         const child = children[i];
        //         let addThisItem = false;

        //         if (isColumn(child)) {
        //             // for column, test if column is included
        //             addThisItem = renderedCols.has(child);
        //         } else {
        //             // if group, base decision on children
        //             const columnGroup = child as AgColumnGroup;
        //             const displayedChildren = columnGroup.getDisplayedChildren();

        //             if (displayedChildren) {
        //                 addThisItem = testGroup(displayedChildren, result, depth + 1);
        //             }
        //         }

        //         if (addThisItem) {
        //             returnValue = true;
        //             if (!result[depth]) {
        //                 result[depth] = [];
        //             }
        //             result[depth].push(child);
        //         }
        //     }
        //     return returnValue;
        // };

        // testGroup(treeLeft, this.rowsOfHeadersToRenderLeft, 0);
        // testGroup(treeRight, this.rowsOfHeadersToRenderRight, 0);
        // testGroup(treeCenter, this.rowsOfHeadersToRenderCenter, 0);
    }

    private extractViewport(): boolean {
        const hashColumn = (c: AgColumn) => `${c.getId()}-${c.getPinned() || 'normal'}`;

        this.extractViewportColumns();
        const newHash = this.getViewportColumns().map(hashColumn).join('#');
        const changed = this.colsWithinViewportHash !== newHash;

        if (changed) {
            this.colsWithinViewportHash = newHash;
            this.calculateHeaderRows();
        }

        return changed;
    }
}

function isAnyParentAutoHeaderHeight(col: AgColumn | AgColumnGroup | null): boolean {
    while (col) {
        if (col.isAutoHeaderHeight()) {
            return true;
        }
        col = col.getParent();
    }

    return false;
}
