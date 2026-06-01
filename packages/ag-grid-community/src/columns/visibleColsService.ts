import { _last } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { isColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import type { ColumnPinnedType, HeaderColumnId } from '../interfaces/iColumn';
import type { ColumnGroupService, CreateGroupsParams } from './columnGroups/columnGroupService';
import type { ColumnModel } from './columnModel';
import { getWidthOfColsInList } from './columnUtils';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';

// takes in a list of columns, as specified by the column definitions, and returns column groups
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class VisibleColsService extends BeanStub implements NamedBean {
    beanName = 'visibleCols' as const;

    // tree of columns to be displayed for each section
    public treeLeft: (AgColumn | AgColumnGroup)[];
    public treeRight: (AgColumn | AgColumnGroup)[];
    public treeCenter: (AgColumn | AgColumnGroup)[];

    // for fast lookup, to see if a column or group is still visible
    private colsAndGroupsMap: { [id: HeaderColumnId]: AgColumn | AgColumnGroup } = {};

    // leave level columns of the displayed trees
    public leftCols: AgColumn[] = [];
    public rightCols: AgColumn[] = [];
    public centerCols: AgColumn[] = [];
    // all three lists above combined
    public allCols: AgColumn[] = [];

    public headerGroupRowCount: number = 0; // number of header rows to render

    public autoHeightCols: AgColumn[];

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public bodyWidth = 0;
    private leftWidth = 0;
    private rightWidth = 0;

    public isBodyWidthDirty = true;

    // list of all columns (displayed and hidden) in visible order including pinned
    private ariaOrderColumns: AgColumn[];

    public refresh(source: ColumnEventType, skipTreeBuild = false): void {
        const { colFlex, colModel, colGroupSvc, colViewport, selectionColSvc, ctrlsSvc } = this.beans;
        // when we open/close col group, skipTreeBuild=false, as we know liveCols haven't changed
        if (!skipTreeBuild) {
            this.buildTrees(colModel, colGroupSvc);
        }

        colGroupSvc?.updateOpenClosedVisibility();

        this.leftCols = pickDisplayedCols(this.treeLeft);
        this.centerCols = pickDisplayedCols(this.treeCenter);
        this.rightCols = pickDisplayedCols(this.treeRight);

        selectionColSvc?.refreshVisibility(this.leftCols, this.centerCols, this.rightCols);

        this.joinColsAriaOrder(colModel);
        this.joinCols();

        this.headerGroupRowCount = this.getHeaderRowCount();

        this.setLeftValues(source);
        this.autoHeightCols = this.allCols.filter((col) => col.isAutoHeight());
        // The cached flex viewport width inside `colFlex` only updates from the resize observer
        // in viewportSizeFeature. When pinning changes the logical centre width without resizing
        // the DOM viewport, we must pass the freshly-derived centre width here.
        // Compute pinned widths directly from the just-updated column lists rather than using
        // `getCenterWidth()` — the latter reads the cached `leftWidth`/`rightWidth` via
        // `getLeftStickyColumnContainerWidth`, which is only refreshed by `updateBodyWidths` below.
        const viewportWidth = ctrlsSvc?.getGridBodyCtrl()?.getViewportWidthWithoutScrollbar();
        let flexParams: { viewportWidth: number } | undefined;
        if (viewportWidth != null) {
            const centerWidth =
                viewportWidth - getWidthOfColsInList(this.leftCols) - getWidthOfColsInList(this.rightCols);
            flexParams = { viewportWidth: centerWidth > 0 ? centerWidth : 0 };
        }
        colFlex?.refreshFlexedColumns(flexParams);
        this.updateBodyWidths();
        this.setFirstRightAndLastLeftPinned(colModel, this.leftCols, this.rightCols, source);
        colViewport.checkViewportColumns(false);

        this.eventSvc.dispatchEvent({
            type: 'displayedColumnsChanged',
            source,
        });
    }

    private getHeaderRowCount(): number {
        if (!this.gos.get('hidePaddedHeaderRows')) {
            return this.beans.colModel.cols!.treeDepth;
        }

        let headerGroupRowCount = 0;
        for (const col of this.allCols) {
            let parent = col.parent;
            while (parent) {
                if (!parent.isPadding()) {
                    const level = parent.getProvidedColumnGroup().getLevel() + 1;
                    if (level > headerGroupRowCount) {
                        headerGroupRowCount = level;
                    }
                    break;
                }

                parent = parent.parent;
            }
        }

        return headerGroupRowCount;
    }

    // after setColumnWidth or updateGroupsAndPresentedCols
    public updateBodyWidths(): void {
        const newBodyWidth = getWidthOfColsInList(this.centerCols);
        const newLeftWidth = getWidthOfColsInList(this.leftCols);
        const newRightWidth = getWidthOfColsInList(this.rightCols);

        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.isBodyWidthDirty = this.bodyWidth !== newBodyWidth;

        const atLeastOneChanged =
            this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;

        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;

            // this event is fired to allow the grid viewport to resize before the
            // scrollbar tries to update its visibility.
            this.eventSvc.dispatchEvent({
                type: 'columnContainerWidthChanged',
            });

            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            this.eventSvc.dispatchEvent({
                type: 'displayedColumnsWidthChanged',
            });
        }
    }

    // sets the left pixel position of each column
    public setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfCols(source);
        this.setLeftValuesOfGroups();
    }

    private setFirstRightAndLastLeftPinned(
        colModel: ColumnModel,
        leftCols: AgColumn[],
        rightCols: AgColumn[],
        source: ColumnEventType
    ): void {
        const lastLeft = leftCols.length ? _last(leftCols) : null;
        let firstRight: AgColumn | null = null;
        if (rightCols.length) {
            firstRight = this.gos.get('enableRtl') ? _last(rightCols) : rightCols[0];
        }

        for (const col of colModel.getCols()) {
            col.setLastLeftPinned(col === lastLeft, source);
            col.setFirstRightPinned(col === firstRight, source);
        }
    }

    private buildTrees(colModel: ColumnModel, columnGroupSvc: ColumnGroupService | undefined) {
        const cols = colModel.getColsToShow();

        const leftCols = cols.filter((col) => col.getPinned() == 'left');
        const rightCols = cols.filter((col) => col.getPinned() == 'right');
        const centerCols = cols.filter((col) => col.getPinned() != 'left' && col.getPinned() != 'right');

        const idCreator = new GroupInstanceIdCreator();

        const createGroups = (params: CreateGroupsParams): (AgColumn | AgColumnGroup)[] => {
            return columnGroupSvc ? columnGroupSvc.createColumnGroups(params) : params.columns;
        };
        this.treeLeft = createGroups({
            columns: leftCols,
            idCreator,
            pinned: 'left',
            oldDisplayedGroups: this.treeLeft,
        });
        this.treeRight = createGroups({
            columns: rightCols,
            idCreator,
            pinned: 'right',
            oldDisplayedGroups: this.treeRight,
        });
        this.treeCenter = createGroups({
            columns: centerCols,
            idCreator,
            pinned: null,
            oldDisplayedGroups: this.treeCenter,
        });

        this.updateColsAndGroupsMap();
    }

    public clear(): void {
        this.leftCols = [];
        this.rightCols = [];
        this.centerCols = [];
        this.allCols = [];
        this.ariaOrderColumns = [];
    }

    private joinColsAriaOrder(colModel: ColumnModel): void {
        const allColumns = colModel.getCols();
        const pinnedLeft: AgColumn[] = [];
        const center: AgColumn[] = [];
        const pinnedRight: AgColumn[] = [];

        for (const col of allColumns) {
            const pinned = col.getPinned();
            if (!pinned) {
                center.push(col);
            } else if (pinned === true || pinned === 'left') {
                pinnedLeft.push(col);
            } else {
                pinnedRight.push(col);
            }
        }

        this.ariaOrderColumns = pinnedLeft.concat(center).concat(pinnedRight);
    }

    public getAriaColIndex(colOrGroup: AgColumn | AgColumnGroup): number {
        let col: AgColumn;

        if (isColumnGroup(colOrGroup)) {
            col = colOrGroup.getLeafColumns()[0];
        } else {
            col = colOrGroup;
        }

        return this.ariaOrderColumns.indexOf(col) + 1;
    }

    private setLeftValuesOfGroups(): void {
        // a groups left value is the lest left value of it's children
        for (const columns of [this.treeLeft, this.treeRight, this.treeCenter]) {
            for (const column of columns) {
                if (isColumnGroup(column)) {
                    const columnGroup = column;
                    columnGroup.checkLeft();
                }
            }
        }
    }

    private setLeftValuesOfCols(source: ColumnEventType): void {
        const { colModel } = this.beans;
        if (!colModel.getColDefCols()) {
            return;
        }

        const displayedCols = new Set<AgColumn>();
        for (const columns of [this.leftCols, this.rightCols, this.centerCols]) {
            let left = 0;
            for (const column of columns) {
                column.setLeft(left, source);
                left += column.getActualWidth();
                displayedCols.add(column);
            }
        }

        // columns not in the displayed set need their left position reset. this is important for the
        // rows, as if a col is made visible, then taken out, then made visible again, we don't want
        // the animation of the cell floating in from the old position, whatever that was.
        for (const column of colModel.getCols()) {
            if (!displayedCols.has(column)) {
                column.setLeft(null, source);
            }
        }
    }

    private joinCols(): void {
        if (this.gos.get('enableRtl')) {
            this.allCols = this.rightCols.concat(this.centerCols).concat(this.leftCols);
        } else {
            this.allCols = this.leftCols.concat(this.centerCols).concat(this.rightCols);
        }
    }

    public getAllTrees(): (AgColumn | AgColumnGroup)[] | null {
        if (this.treeLeft && this.treeRight && this.treeCenter) {
            return this.treeLeft.concat(this.treeCenter).concat(this.treeRight);
        }

        return null;
    }

    // gridPanel -> ensureColumnVisible
    public isColDisplayed(column: AgColumn): boolean {
        return this.allCols.indexOf(column) >= 0;
    }

    public getLeftColsForRow(rowNode: RowNode): AgColumn[] {
        const {
            leftCols,
            beans: { colModel },
        } = this;
        const colSpanActive = colModel.colSpanActive;
        if (!colSpanActive) {
            return leftCols;
        }

        return this.getColsForRow(rowNode, leftCols);
    }

    public getRightColsForRow(rowNode: RowNode): AgColumn[] {
        const {
            rightCols,
            beans: { colModel },
        } = this;
        const colSpanActive = colModel.colSpanActive;
        if (!colSpanActive) {
            return rightCols;
        }

        return this.getColsForRow(rowNode, rightCols);
    }

    public getColsForRow(
        rowNode: RowNode,
        displayedColumns: AgColumn[],
        filterCallback?: (column: AgColumn) => boolean,
        emptySpaceBeforeColumn?: (column: AgColumn) => boolean
    ): AgColumn[] {
        const result: AgColumn[] = [];
        let lastConsideredCol: AgColumn | null = null;

        for (let i = 0; i < displayedColumns.length; i++) {
            const col = displayedColumns[i];
            const maxAllowedColSpan = displayedColumns.length - i;
            const colSpan = Math.min(col.getColSpan(rowNode), maxAllowedColSpan);
            const columnsToCheckFilter: AgColumn[] = [col];

            if (colSpan > 1) {
                const colsToRemove = colSpan - 1;

                for (let j = 1; j <= colsToRemove; j++) {
                    columnsToCheckFilter.push(displayedColumns[i + j]);
                }

                i += colsToRemove;
            }

            // see which cols we should take out for column virtualisation
            let filterPasses: boolean;

            if (filterCallback) {
                // if user provided a callback, means some columns may not be in the viewport.
                // the user will NOT provide a callback if we are talking about pinned areas,
                // as pinned areas have no horizontal scroll and do not virtualise the columns.
                // if lots of columns, that means column spanning, and we set filterPasses = true
                // if one or more of the columns spanned pass the filter.
                filterPasses = false;
                for (const colForFilter of columnsToCheckFilter) {
                    if (filterCallback(colForFilter)) {
                        filterPasses = true;
                    }
                }
            } else {
                filterPasses = true;
            }

            if (filterPasses) {
                if (result.length === 0 && lastConsideredCol) {
                    const gapBeforeColumn = emptySpaceBeforeColumn ? emptySpaceBeforeColumn(col) : false;
                    if (gapBeforeColumn) {
                        result.push(lastConsideredCol);
                    }
                }
                result.push(col);
            }

            lastConsideredCol = col;
        }

        return result;
    }

    public getContainerWidth(pinned: ColumnPinnedType): number {
        switch (pinned) {
            case 'left':
                return this.leftWidth;
            case 'right':
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    }

    public getColBefore(col: AgColumn): AgColumn | null {
        const allDisplayedColumns = this.allCols;
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }

        return null;
    }

    public isPinningLeft(): boolean {
        return this.leftCols.length > 0;
    }

    public isPinningRight(): boolean {
        return this.rightCols.length > 0;
    }

    private updateColsAndGroupsMap(): void {
        this.colsAndGroupsMap = {};

        const func = (child: AgColumn | AgColumnGroup) => {
            this.colsAndGroupsMap[child.getUniqueId()] = child;
        };

        depthFirstAllColumnTreeSearch(this.treeCenter, false, func);
        depthFirstAllColumnTreeSearch(this.treeLeft, false, func);
        depthFirstAllColumnTreeSearch(this.treeRight, false, func);
    }

    public isVisible(item: AgColumn | AgColumnGroup): boolean {
        const fromMap = this.colsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    }

    public getFirstColumn(): AgColumn | null {
        const isRtl = this.gos.get('enableRtl');
        const queryOrder: ('leftCols' | 'centerCols' | 'rightCols')[] = ['leftCols', 'centerCols', 'rightCols'];

        if (isRtl) {
            queryOrder.reverse();
        }

        for (let i = 0; i < queryOrder.length; i++) {
            const container = this[queryOrder[i]];
            if (container.length) {
                return isRtl ? _last(container) : container[0];
            }
        }

        return null;
    }

    // used by:
    // + rowRenderer -> for navigation
    public getColAfter(col: AgColumn): AgColumn | null {
        const allDisplayedColumns = this.allCols;
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex < allDisplayedColumns.length - 1) {
            return allDisplayedColumns[oldIndex + 1];
        }

        return null;
    }

    // used by:
    // + angularGrid -> setting pinned body width
    // note: the cache value `leftWidth` can be stale while actively moving column, so prefer getWidthOfColsInList.
    public getLeftStickyColumnContainerWidth() {
        // sometimes the leftCols are empty after a refresh, so attempt to grab cached values.
        return this.leftCols.length ? getWidthOfColsInList(this.leftCols) : this.leftWidth;
    }

    // note: the cache value `rightWidth` can be stale while actively moving columns, so prefer getWidthOfColsInList.
    public getRightStickyColumnContainerWidth() {
        // sometimes the rightCols are empty after a refresh, so attempt to grab cached values.
        return this.rightCols.length ? getWidthOfColsInList(this.rightCols) : this.rightWidth;
    }

    public isColAtEdge(col: AgColumn | AgColumnGroup, edge: 'first' | 'last'): boolean {
        const allColumns = this.allCols;
        if (!allColumns.length) {
            return false;
        }

        const isFirst = edge === 'first';

        let columnToCompare: AgColumn;
        if (isColumnGroup(col)) {
            const leafColumns = col.getDisplayedLeafColumns();
            if (!leafColumns.length) {
                return false;
            }

            columnToCompare = isFirst ? leafColumns[0] : _last(leafColumns);
        } else {
            columnToCompare = col;
        }

        return (isFirst ? allColumns[0] : _last(allColumns)) === columnToCompare;
    }
}

export function depthFirstAllColumnTreeSearch(
    tree: (AgColumn | AgColumnGroup)[] | null,
    useDisplayedChildren: boolean,
    callback: (treeNode: AgColumn | AgColumnGroup) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (isColumnGroup(child)) {
            const childTree = useDisplayedChildren ? child.getDisplayedChildren() : child.getChildren();
            depthFirstAllColumnTreeSearch(childTree, useDisplayedChildren, callback);
        }
        callback(child);
    }
}

function pickDisplayedCols(tree: (AgColumn | AgColumnGroup)[]): AgColumn[] {
    const res: AgColumn[] = [];
    depthFirstAllColumnTreeSearch(tree, true, (child) => {
        if (isColumn(child)) {
            res.push(child);
        }
    });
    return res;
}
