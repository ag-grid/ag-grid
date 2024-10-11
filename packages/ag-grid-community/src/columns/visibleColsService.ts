import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import { AgColumnGroup, createUniqueColumnGroupId, isColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import type { ColumnPinnedType, HeaderColumnId } from '../interfaces/iColumn';
import { _last } from '../utils/array';
import { _exists } from '../utils/generic';
import type { ColumnFlexService } from './columnFlexService';
import type { ColumnModel } from './columnModel';
import { getWidthOfColsInList } from './columnUtils';
import type { ColumnViewportService } from './columnViewportService';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';

function _removeAllFromUnorderedArray<T>(array: T[], toRemove: T[]) {
    for (let i = 0; i < toRemove.length; i++) {
        const index = array.indexOf(toRemove[i]);

        if (index >= 0) {
            // preserve the last element, then shorten array length by 1 to delete index
            array[index] = array[array.length - 1];
            array.pop();
        }
    }
}

// takes in a list of columns, as specified by the column definitions, and returns column groups
export class VisibleColsService extends BeanStub implements NamedBean {
    beanName = 'visibleColsService' as const;

    private columnModel: ColumnModel;
    private columnFlexService?: ColumnFlexService;
    private columnViewportService: ColumnViewportService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnFlexService = beans.columnFlexService;
        this.columnViewportService = beans.columnViewportService;
    }

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

    public autoHeightCols: AgColumn[];

    private bodyWidth = 0;
    private leftWidth = 0;
    private rightWidth = 0;

    public isBodyWidthDirty = true;

    // list of all columns (displayed and hidden) in visible order including pinned
    private ariaOrderColumns: AgColumn[];

    public refresh(source: ColumnEventType, skipTreeBuild = false): void {
        // when we open/close col group, skipTreeBuild=false, as we know liveCols haven't changed
        if (!skipTreeBuild) {
            this.buildTrees();
        }

        this.updateOpenClosedVisibilityInColumnGroups();

        this.leftCols = pickDisplayedCols(this.treeLeft);
        this.centerCols = pickDisplayedCols(this.treeCenter);
        this.rightCols = pickDisplayedCols(this.treeRight);

        this.joinColsAriaOrder();
        this.joinCols();
        this.setLeftValues(source);
        this.autoHeightCols = this.allCols.filter((col) => col.isAutoHeight());
        this.columnFlexService?.refreshFlexedColumns();
        this.updateBodyWidths();
        this.columnViewportService.checkViewportColumns(false);
        this.setFirstRightAndLastLeftPinned(source);

        this.eventService.dispatchEvent({
            type: 'displayedColumnsChanged',
            source,
        });
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
            this.eventService.dispatchEvent({
                type: 'columnContainerWidthChanged',
            });

            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            this.eventService.dispatchEvent({
                type: 'displayedColumnsWidthChanged',
            });
        }
    }

    // sets the left pixel position of each column
    public setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfCols(source);
        this.setLeftValuesOfGroups();
    }

    private setFirstRightAndLastLeftPinned(source: ColumnEventType): void {
        let lastLeft: AgColumn | null;
        let firstRight: AgColumn | null;

        if (this.gos.get('enableRtl')) {
            lastLeft = this.leftCols ? this.leftCols[0] : null;
            firstRight = this.rightCols ? _last(this.rightCols) : null;
        } else {
            lastLeft = this.leftCols ? _last(this.leftCols) : null;
            firstRight = this.rightCols ? this.rightCols[0] : null;
        }

        this.columnModel.getCols().forEach((col) => {
            col.setLastLeftPinned(col === lastLeft, source);
            col.setFirstRightPinned(col === firstRight, source);
        });
    }

    private buildTrees() {
        const cols = this.columnModel.getColsToShow();

        const leftCols = cols.filter((col) => col.getPinned() == 'left');
        const rightCols = cols.filter((col) => col.getPinned() == 'right');
        const centerCols = cols.filter((col) => col.getPinned() != 'left' && col.getPinned() != 'right');

        const idCreator = new GroupInstanceIdCreator();

        this.treeLeft = this.createGroups({
            columns: leftCols,
            idCreator,
            pinned: 'left',
            oldDisplayedGroups: this.treeLeft,
        });
        this.treeRight = this.createGroups({
            columns: rightCols,
            idCreator,
            pinned: 'right',
            oldDisplayedGroups: this.treeRight,
        });
        this.treeCenter = this.createGroups({
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

    private joinColsAriaOrder(): void {
        const allColumns = this.columnModel.getCols();
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
        [this.treeLeft, this.treeRight, this.treeCenter].forEach((columns) => {
            columns.forEach((column) => {
                if (isColumnGroup(column)) {
                    const columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    }

    private setLeftValuesOfCols(source: ColumnEventType): void {
        const primaryCols = this.columnModel.getColDefCols();
        if (!primaryCols) {
            return;
        }

        // go through each list of displayed columns
        const allColumns = this.columnModel.getCols().slice(0);

        // let totalColumnWidth = this.getWidthOfColsInList()
        const doingRtl = this.gos.get('enableRtl');

        [this.leftCols, this.rightCols, this.centerCols].forEach((columns) => {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                let left = getWidthOfColsInList(columns);
                columns.forEach((column) => {
                    left -= column.getActualWidth();
                    column.setLeft(left, source);
                });
            } else {
                // otherwise normal LTR, we start at zero
                let left = 0;
                columns.forEach((column) => {
                    column.setLeft(left, source);
                    left += column.getActualWidth();
                });
            }
            _removeAllFromUnorderedArray(allColumns, columns);
        });

        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach((column) => {
            column.setLeft(null, source);
        });
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
        return this.allCols.indexOf(column as AgColumn) >= 0;
    }

    public getLeftColsForRow(rowNode: RowNode): AgColumn[] {
        const colSpanActive = this.columnModel.colSpanActive;
        if (!colSpanActive) {
            return this.leftCols;
        }

        return this.getColsForRow(rowNode, this.leftCols);
    }

    public getRightColsForRow(rowNode: RowNode): AgColumn[] {
        const colSpanActive = this.columnModel.colSpanActive;
        if (!colSpanActive) {
            return this.rightCols;
        }

        return this.getColsForRow(rowNode, this.rightCols);
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
            const col = displayedColumns[i] as AgColumn;
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
                columnsToCheckFilter.forEach((colForFilter) => {
                    if (filterCallback(colForFilter)) {
                        filterPasses = true;
                    }
                });
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

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public getBodyContainerWidth(): number {
        return this.bodyWidth;
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
        const oldIndex = allDisplayedColumns.indexOf(col as AgColumn);

        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }

        return null;
    }

    public getGroupAtDirection(columnGroup: AgColumnGroup, direction: 'After' | 'Before'): AgColumnGroup | null {
        // pick the last displayed column in this group
        const requiredLevel = columnGroup.getProvidedColumnGroup().getLevel() + columnGroup.getPaddingLevel();
        const colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        const col: AgColumn | null = direction === 'After' ? _last(colGroupLeafColumns) : colGroupLeafColumns[0];
        const getDisplayColMethod: 'getColAfter' | 'getColBefore' = `getCol${direction}` as any;

        while (true) {
            // keep moving to the next col, until we get to another group
            const column = this[getDisplayColMethod](col);

            if (!column) {
                return null;
            }

            const groupPointer = this.getColGroupAtLevel(column, requiredLevel);

            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    }

    public getColGroupAtLevel(column: AgColumn, level: number): AgColumnGroup | null {
        // get group at same level as the one we are looking for
        let groupPointer: AgColumnGroup = column.getParent()!;
        let originalGroupLevel: number;
        let groupPointerLevel: number;

        while (true) {
            const groupPointerProvidedColumnGroup = groupPointer.getProvidedColumnGroup();
            originalGroupLevel = groupPointerProvidedColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();

            if (originalGroupLevel + groupPointerLevel <= level) {
                break;
            }
            groupPointer = groupPointer.getParent()!;
        }

        return groupPointer;
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

    private updateOpenClosedVisibilityInColumnGroups(): void {
        const allColumnGroups = this.getAllTrees();

        depthFirstAllColumnTreeSearch(allColumnGroups, false, (child) => {
            if (isColumnGroup(child)) {
                child.calculateDisplayedColumns();
            }
        });
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

    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string | AgColumnGroup, partId?: number): AgColumnGroup | null {
        if (!colId) {
            return null;
        }
        if (isColumnGroup(colId)) {
            return colId;
        }

        const allColumnGroups = this.getAllTrees();
        const checkPartId = typeof partId === 'number';
        let result: AgColumnGroup | null = null;

        depthFirstAllColumnTreeSearch(allColumnGroups, false, (child) => {
            if (isColumnGroup(child)) {
                const columnGroup = child;
                let matched: boolean;

                if (checkPartId) {
                    matched = colId === columnGroup.getGroupId() && partId === columnGroup.getPartId();
                } else {
                    matched = colId === columnGroup.getGroupId();
                }

                if (matched) {
                    result = columnGroup;
                }
            }
        });

        return result;
    }

    // used by:
    // + rowRenderer -> for navigation
    public getColAfter(col: AgColumn): AgColumn | null {
        const allDisplayedColumns = this.allCols;
        const oldIndex = allDisplayedColumns.indexOf(col as AgColumn);

        if (oldIndex < allDisplayedColumns.length - 1) {
            return allDisplayedColumns[oldIndex + 1];
        }

        return null;
    }

    // used by:
    // + angularGrid -> setting pinned body width
    // note: this should be cached
    public getColsLeftWidth() {
        return getWidthOfColsInList(this.leftCols);
    }

    // note: this should be cached
    public getDisplayedColumnsRightWidth() {
        return getWidthOfColsInList(this.rightCols);
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

    public createGroups(params: {
        // all displayed columns sorted - this is the columns the grid should show
        columns: AgColumn[];
        // creates unique id's for the group
        idCreator: GroupInstanceIdCreator;
        // whether it's left, right or center col
        pinned: ColumnPinnedType;
        // we try to reuse old groups if we can, to allow gui to do animation
        oldDisplayedGroups?: (AgColumn | AgColumnGroup)[];
        // set `isStandaloneStructure` to true if this structure will not be used
        // by the grid UI. This is useful for export modules (gridSerializer).
        isStandaloneStructure?: boolean;
    }): (AgColumn | AgColumnGroup)[] {
        const { columns, idCreator, pinned, oldDisplayedGroups, isStandaloneStructure } = params;
        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups!);

        /**
         * The following logic starts at the leaf level of columns, iterating through them to build their parent
         * groups when the parents match.
         *
         * The created groups are then added to an array, and similarly iterated on until we reach the top level.
         *
         * When row groups have no original parent, it's added to the result.
         */
        const topLevelResultCols: (AgColumn | AgColumnGroup)[] = [];

        // this is an array of cols or col groups at one level of depth, starting from leaf and ending at root
        let groupsOrColsAtCurrentLevel: (AgColumn | AgColumnGroup)[] = columns as AgColumn[];
        while (groupsOrColsAtCurrentLevel.length) {
            // store what's currently iterating so the function can build the next level of col groups
            const currentlyIterating = groupsOrColsAtCurrentLevel;
            groupsOrColsAtCurrentLevel = [];

            // store the index of the last row which was different from the previous row, this is used as a slice
            // index for finding the children to group together
            let lastGroupedColIdx = 0;

            // create a group of children from lastGroupedColIdx to the provided `to` parameter
            const createGroupToIndex = (to: number) => {
                const from = lastGroupedColIdx;
                lastGroupedColIdx = to;

                const previousNode = currentlyIterating[from];
                const previousNodeProvided = isColumnGroup(previousNode)
                    ? previousNode.getProvidedColumnGroup()
                    : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent() as AgProvidedColumnGroup | null;

                if (previousNodeParent == null) {
                    // if the last node was different, and had a null parent, then we add all the nodes to the final
                    // results)
                    for (let i = from; i < to; i++) {
                        topLevelResultCols.push(currentlyIterating[i]);
                    }
                    return;
                }

                // the parent differs from the previous node, so we create a group from the previous node
                // and add all to the result array, except the current node.
                const newGroup = this.createColGroup(
                    previousNodeParent,
                    idCreator,
                    oldColumnsMapped,
                    pinned,
                    isStandaloneStructure
                );

                for (let i = from; i < to; i++) {
                    newGroup.addChild(currentlyIterating[i]);
                }
                groupsOrColsAtCurrentLevel.push(newGroup);
            };

            for (let i = 1; i < currentlyIterating.length; i++) {
                const thisNode = currentlyIterating[i];
                const thisNodeProvided = isColumnGroup(thisNode) ? thisNode.getProvidedColumnGroup() : thisNode;
                const thisNodeParent = thisNodeProvided.getOriginalParent();

                const previousNode = currentlyIterating[lastGroupedColIdx];
                const previousNodeProvided = isColumnGroup(previousNode)
                    ? previousNode.getProvidedColumnGroup()
                    : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent();

                if (thisNodeParent !== previousNodeParent) {
                    createGroupToIndex(i);
                }
            }

            if (lastGroupedColIdx < currentlyIterating.length) {
                createGroupToIndex(currentlyIterating.length);
            }
        }

        if (!isStandaloneStructure) {
            this.setupParentsIntoCols(topLevelResultCols, null);
        }
        return topLevelResultCols;
    }

    private createColGroup(
        providedGroup: AgProvidedColumnGroup,
        groupInstanceIdCreator: GroupInstanceIdCreator,
        oldColumnsMapped: { [key: string]: AgColumnGroup },
        pinned: ColumnPinnedType,
        isStandaloneStructure?: boolean
    ): AgColumnGroup {
        const groupId = providedGroup.getGroupId();
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = createUniqueColumnGroupId(groupId, instanceId);

        let columnGroup: AgColumnGroup | null = oldColumnsMapped[uniqueId];

        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getProvidedColumnGroup() !== providedGroup) {
            columnGroup = null;
        }

        if (_exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        } else {
            columnGroup = new AgColumnGroup(providedGroup, groupId, instanceId, pinned);
            if (!isStandaloneStructure) {
                this.createBean(columnGroup);
            }
        }

        return columnGroup;
    }

    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    private mapOldGroupsById(displayedGroups: (AgColumn | AgColumnGroup)[]): {
        [uniqueId: string]: AgColumnGroup;
    } {
        const result: { [uniqueId: HeaderColumnId]: AgColumnGroup } = {};

        const recursive = (columnsOrGroups: (AgColumn | AgColumnGroup)[] | null) => {
            columnsOrGroups!.forEach((columnOrGroup) => {
                if (isColumnGroup(columnOrGroup)) {
                    const columnGroup = columnOrGroup;
                    result[columnOrGroup.getUniqueId()] = columnGroup;
                    recursive(columnGroup.getChildren());
                }
            });
        };

        if (displayedGroups) {
            recursive(displayedGroups);
        }

        return result;
    }

    private setupParentsIntoCols(
        columnsOrGroups: (AgColumn | AgColumnGroup)[] | null,
        parent: AgColumnGroup | null
    ): void {
        columnsOrGroups!.forEach((columnsOrGroup) => {
            columnsOrGroup.setParent(parent);
            if (isColumnGroup(columnsOrGroup)) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoCols(columnGroup.getChildren(), columnGroup);
            }
        });
    }
}

function depthFirstAllColumnTreeSearch(
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
