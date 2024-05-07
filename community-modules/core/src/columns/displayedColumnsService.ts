import { Column, ColumnPinnedType } from "../entities/column";
import { GroupInstanceIdCreator } from "./groupInstanceIdCreator";
import { HeaderColumnId, IHeaderColumn } from "../interfaces/iHeaderColumn";
import { ColumnGroup } from "../entities/columnGroup";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";
import { ColumnContainerWidthChanged, ColumnEventType, DisplayedColumnsWidthChangedEvent, Events } from "../events";
import { last, removeAllFromUnorderedArray } from "../utils/array";
import { RowNode } from "../entities/rowNode";
import { ColumnModel } from "./columnModel";
import { ColumnUtilsFeature } from "./columnUtilsFeature";
import { WithoutGridCommon } from "../interfaces/iCommon";

// takes in a list of columns, as specified by the column definitions, and returns column groups
@Bean('displayedColumnsService')
export class DisplayedColumnsService extends BeanStub {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private columnUtilsFeature: ColumnUtilsFeature;

    // tree of columns to be displayed for each section
    private displayedTreeLeft: IHeaderColumn[];
    private displayedTreeRight: IHeaderColumn[];
    private displayedTreeCentre: IHeaderColumn[];

    // leave level columns of the displayed trees
    private displayedColumnsLeft: Column[] = [];
    private displayedColumnsRight: Column[] = [];
    private displayedColumnsCenter: Column[] = [];
    // all three lists above combined
    private displayedColumns: Column[] = [];

    private displayedAutoHeightCols: Column[];

    // for fast lookup, to see if a column or group is still displayed
    private displayedColumnsAndGroupsMap: { [id: HeaderColumnId]: IHeaderColumn } = {};

    private bodyWidth = 0;
    private leftWidth = 0;
    private rightWidth = 0;

    private bodyWidthDirty = true;

    // list of all columns (displayed and hidden) in visible order including pinned
    private ariaOrderColumns: Column[];

    @PostConstruct
    private postConstruct(): void {
        this.columnUtilsFeature = this.createManagedBean(new ColumnUtilsFeature());
    }

    public clear(): void {
        this.displayedColumnsLeft = [];
        this.displayedColumnsRight = [];
        this.displayedColumnsCenter = [];
        this.displayedColumns = [];
        this.ariaOrderColumns = [];
    }

    public deriveDisplayedColumns(source: ColumnEventType): void {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeLeft, this.displayedColumnsLeft);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeRight, this.displayedColumnsRight);
        this.joinColumnsAriaOrder();
        this.joinDisplayedColumns();
        this.setLeftValues(source);
        this.displayedAutoHeightCols = this.displayedColumns.filter(col => col.isAutoHeight());
    }

    private joinColumnsAriaOrder(): void {
        const allColumns = this.columnModel.getAllGridColumns();
        const pinnedLeft: Column[] = [];
        const center: Column[] = [];
        const pinnedRight: Column[] = [];

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

    public getAriaColumnIndex(colOrGroup: Column | ColumnGroup): number {
        let col: Column;

        if (colOrGroup instanceof ColumnGroup) {
            col = colOrGroup.getLeafColumns()[0];
        } else {
            col = colOrGroup;
        }

        return this.ariaOrderColumns.indexOf(col) + 1;
    }

    public getAllDisplayedAutoHeightCols(): Column[] {
        return this.displayedAutoHeightCols;
    }

    // sets the left pixel position of each column
    public setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfColumns(source);
        this.setLeftValuesOfGroups();
    }

    private setLeftValuesOfGroups(): void {
        // a groups left value is the lest left value of it's children
        [
            this.displayedTreeLeft,
            this.displayedTreeRight,
            this.displayedTreeCentre
        ].forEach(columns => {
            columns.forEach(column => {
                if (column instanceof ColumnGroup) {
                    const columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    }

    private setLeftValuesOfColumns(source: ColumnEventType): void {
        const primaryCols = this.columnModel.getAllPrimaryColumns();
        if (!primaryCols) { return; }

        // go through each list of displayed columns
        const allColumns = this.columnModel.getPrimaryAndPivotResultAndAutoColumns().slice(0);

        // let totalColumnWidth = this.getWidthOfColsInList()
        const doingRtl = this.gos.get('enableRtl');

        [
            this.displayedColumnsLeft,
            this.displayedColumnsRight,
            this.displayedColumnsCenter
        ].forEach(columns => {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                let left = this.columnUtilsFeature.getWidthOfColsInList(columns);
                columns.forEach(column => {
                    left -= column.getActualWidth();
                    column.setLeft(left, source);
                });
            } else {
                // otherwise normal LTR, we start at zero
                let left = 0;
                columns.forEach(column => {
                    column.setLeft(left, source);
                    left += column.getActualWidth();
                });
            }
            removeAllFromUnorderedArray(allColumns, columns);
        });

        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach((column: Column) => {
            column.setLeft(null, source);
        });
    }

    private joinDisplayedColumns(): void {
        if (this.gos.get('enableRtl')) {
            this.displayedColumns = this.displayedColumnsRight
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsLeft);
        } else {
            this.displayedColumns = this.displayedColumnsLeft
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsRight);
        }
    }

    private derivedDisplayedColumnsFromDisplayedTree(tree: IHeaderColumn[], columns: Column[]): void {
        columns.length = 0;
        depthFirstAllColumnTreeSearch(tree, true, (child: IHeaderColumn) => {
            if (child instanceof Column) {
                columns.push(child);
            }
        });
    }

    public getDisplayedColumnsCenter(): Column[] {
        return this.displayedColumnsCenter;
    }

    public getAllDisplayedTrees(): IHeaderColumn[] | null {
        if (this.displayedTreeLeft && this.displayedTreeRight && this.displayedTreeCentre) {
            return this.displayedTreeLeft
                .concat(this.displayedTreeCentre)
                .concat(this.displayedTreeRight);
        }

        return null;
    }
    
    // + headerRenderer -> setting pinned body width
    public getDisplayedTreeLeft(): IHeaderColumn[] {
        return this.displayedTreeLeft;
    }

    // + headerRenderer -> setting pinned body width
    public getDisplayedTreeRight(): IHeaderColumn[] {
        return this.displayedTreeRight;
    }

    // + headerRenderer -> setting pinned body width
    public getDisplayedTreeCentre(): IHeaderColumn[] {
        return this.displayedTreeCentre;
    }

    // + csvCreator
    public getAllDisplayedColumns(): Column[] {
        return this.displayedColumns;
    }
    
    // gridPanel -> ensureColumnVisible
    public isColumnDisplayed(column: Column): boolean {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }
    
    public getDisplayedLeftColumnsForRow(rowNode: RowNode): Column[] {
        const colSpanActive = this.columnModel.isColSpanActive();
        if (!colSpanActive) {
            return this.displayedColumnsLeft;
        }

        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsLeft);
    }

    public getDisplayedRightColumnsForRow(rowNode: RowNode): Column[] {
        const colSpanActive = this.columnModel.isColSpanActive();
        if (!colSpanActive) {
            return this.displayedColumnsRight;
        }

        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsRight);
    }
    
    public getDisplayedColumnsForRow(
        rowNode: RowNode, displayedColumns: Column[],
        filterCallback?: (column: Column) => boolean,
        emptySpaceBeforeColumn?: (column: Column) => boolean
    ): Column[] {
        const result: Column[] = [];
        let lastConsideredCol: Column | null = null;

        for (let i = 0; i < displayedColumns.length; i++) {
            const col = displayedColumns[i];
            const maxAllowedColSpan = displayedColumns.length - i;
            const colSpan = Math.min(col.getColSpan(rowNode), maxAllowedColSpan);
            const columnsToCheckFilter: Column[] = [col];

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
                columnsToCheckFilter.forEach(colForFilter => {
                    if (filterCallback(colForFilter)) { filterPasses = true; }
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

    // after setColumnWidth or updateGroupsAndDisplayedColumns
    public updateBodyWidths(): void {
        const newBodyWidth = this.columnUtilsFeature.getWidthOfColsInList(this.displayedColumnsCenter);
        const newLeftWidth = this.columnUtilsFeature.getWidthOfColsInList(this.displayedColumnsLeft);
        const newRightWidth = this.columnUtilsFeature.getWidthOfColsInList(this.displayedColumnsRight);

        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;

        const atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;

        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;

            // this event is fired to allow the grid viewport to resize before the
            // scrollbar tries to update its visibility.
            const evt: WithoutGridCommon<ColumnContainerWidthChanged> = {
                type: Events.EVENT_COLUMN_CONTAINER_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(evt);

            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            const event: WithoutGridCommon<DisplayedColumnsWidthChangedEvent> = {
                type: Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(event);
        }
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

    // + rowController -> while inserting rows
    public getDisplayedCenterColumns(): Column[] {
        return this.displayedColumnsCenter;
    }

    // + rowController -> while inserting rows
    public getDisplayedLeftColumns(): Column[] {
        return this.displayedColumnsLeft;
    }

    public getDisplayedRightColumns(): Column[] {
        return this.displayedColumnsRight;
    }
    
    public getDisplayedColBefore(col: Column): Column | null {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }

        return null;
    }

    public getDisplayedGroupAtDirection(columnGroup: ColumnGroup, direction: 'After' | 'Before'): ColumnGroup | null {
        // pick the last displayed column in this group
        const requiredLevel = columnGroup.getProvidedColumnGroup().getLevel() + columnGroup.getPaddingLevel();
        const colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        const col: Column | null = direction === 'After' ? last(colGroupLeafColumns) : colGroupLeafColumns[0];
        const getDisplayColMethod: 'getDisplayedColAfter' | 'getDisplayedColBefore' = `getDisplayedCol${direction}` as any;

        while (true) {
            // keep moving to the next col, until we get to another group
            const column = this[getDisplayColMethod](col);

            if (!column) { return null; }

            const groupPointer = this.getColumnGroupAtLevel(column, requiredLevel);

            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    }

    public getColumnGroupAtLevel(column: Column, level: number): ColumnGroup | null {
        // get group at same level as the one we are looking for
        let groupPointer: ColumnGroup = column.getParent();
        let originalGroupLevel: number;
        let groupPointerLevel: number;

        while (true) {
            const groupPointerProvidedColumnGroup = groupPointer.getProvidedColumnGroup();
            originalGroupLevel = groupPointerProvidedColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();

            if (originalGroupLevel + groupPointerLevel <= level) { break; }
            groupPointer = groupPointer.getParent();
        }

        return groupPointer;
    }

    public isPinningLeft(): boolean {
        return this.displayedColumnsLeft.length > 0;
    }

    public isPinningRight(): boolean {
        return this.displayedColumnsRight.length > 0;
    }

    public buildDisplayedTrees(visibleColumns: Column[]) {
        const leftVisibleColumns: Column[] = [];
        const rightVisibleColumns: Column[] = [];
        const centerVisibleColumns: Column[] = [];

        visibleColumns.forEach(column => {
            switch (column.getPinned()) {
                case "left":
                    leftVisibleColumns.push(column);
                    break;
                case "right":
                    rightVisibleColumns.push(column);
                    break;
                default:
                    centerVisibleColumns.push(column);
                    break;
            }
        });

        const groupInstanceIdCreator = new GroupInstanceIdCreator();

        this.displayedTreeLeft = this.createDisplayedGroups(
            leftVisibleColumns, groupInstanceIdCreator, 'left', this.displayedTreeLeft);
        this.displayedTreeRight = this.createDisplayedGroups(
            rightVisibleColumns, groupInstanceIdCreator, 'right', this.displayedTreeRight);
        this.displayedTreeCentre = this.createDisplayedGroups(
            centerVisibleColumns, groupInstanceIdCreator, null, this.displayedTreeCentre);

        this.updateDisplayedMap();
    }

    private updateDisplayedMap(): void {
        this.displayedColumnsAndGroupsMap = {};

        const func = (child: IHeaderColumn) => {
            this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };

        depthFirstAllColumnTreeSearch(this.displayedTreeCentre, false, func);
        depthFirstAllColumnTreeSearch(this.displayedTreeLeft, false, func);
        depthFirstAllColumnTreeSearch(this.displayedTreeRight, false, func);
    }

    public isDisplayed(item: IHeaderColumn): boolean {
        const fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    }

    public updateOpenClosedVisibilityInColumnGroups(): void {
        const allColumnGroups = this.getAllDisplayedTrees();

        depthFirstAllColumnTreeSearch(allColumnGroups, false, child => {
            if (child instanceof ColumnGroup) {
                child.calculateDisplayedColumns();
            }
        });
    }

    public getFirstDisplayedColumn(): Column | null {
        const isRtl = this.gos.get('enableRtl');
        const queryOrder: ('getDisplayedLeftColumns' | 'getDisplayedCenterColumns' | 'getDisplayedRightColumns')[] = [
            'getDisplayedLeftColumns',
            'getDisplayedCenterColumns',
            'getDisplayedRightColumns'
        ];

        if (isRtl) {
            queryOrder.reverse();
        }

        for (let i = 0; i < queryOrder.length; i++) {
            const container = this[queryOrder[i]]();
            if (container.length) {
                return isRtl ? last(container) : container[0];
            }
        }

        return null;
    }

    // niall note - why is this looking at displayed columns only???
    //
    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string | ColumnGroup, partId?: number): ColumnGroup | null {
        if (!colId) { return null; }
        if (colId instanceof ColumnGroup) { return colId; }

        const allColumnGroups = this.getAllDisplayedTrees();
        const checkPartId = typeof partId === 'number';
        let result: ColumnGroup | null = null;

        depthFirstAllColumnTreeSearch(allColumnGroups, false, (child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
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
    public getDisplayedColAfter(col: Column): Column | null {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }

        return null;
    }

    public isBodyWidthDirty(): boolean {
        return this.bodyWidthDirty;
    }

    public setBodyWidthDirty(): void {
        this.bodyWidthDirty = true;
    }

    // used by:
    // + angularGrid -> setting pinned body width
    // note: this should be cached
    public getDisplayedColumnsLeftWidth() {
        return this.columnUtilsFeature.getWidthOfColsInList(this.displayedColumnsLeft);
    }

    // note: this should be cached
    public getDisplayedColumnsRightWidth() {
        return this.columnUtilsFeature.getWidthOfColsInList(this.displayedColumnsRight);
    }

    public isColumnAtEdge(col: Column | ColumnGroup, edge: 'first' | 'last'): boolean {
        const allColumns = this.getAllDisplayedColumns();
        if (!allColumns.length) { return false; }

        const isFirst = edge === 'first';

        let columnToCompare: Column;
        if (col instanceof ColumnGroup) {
            const leafColumns = col.getDisplayedLeafColumns();
            if (!leafColumns.length) { return false; }

            columnToCompare = isFirst ? leafColumns[0] : last(leafColumns);
        } else {
            columnToCompare = col;
        }

        return (isFirst ? allColumns[0] : last(allColumns)) === columnToCompare;
    }

    public getFirstRightAndLastLeftPinned(): {lastLeft: Column | null, firstRight: Column | null} {
        let lastLeft: Column | null;
        let firstRight: Column | null;

        if (this.gos.get('enableRtl')) {
            lastLeft = this.displayedColumnsLeft ? this.displayedColumnsLeft[0] : null;
            firstRight = this.displayedColumnsRight ? last(this.displayedColumnsRight) : null;
        } else {
            lastLeft = this.displayedColumnsLeft ? last(this.displayedColumnsLeft) : null;
            firstRight = this.displayedColumnsRight ? this.displayedColumnsRight[0] : null;
        }

        return { firstRight, lastLeft };
    }

    public createDisplayedGroups(
        // all displayed columns sorted - this is the columns the grid should show
        sortedVisibleColumns: Column[],
        // creates unique id's for the group
        groupInstanceIdCreator: GroupInstanceIdCreator,
        // whether it's left, right or center col
        pinned: ColumnPinnedType,
        // we try to reuse old groups if we can, to allow gui to do animation
        oldDisplayedGroups?: IHeaderColumn[]): IHeaderColumn[] {
        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups!);

        /**
         * The following logic starts at the leaf level of columns, iterating through them to build their parent
         * groups when the parents match.
         * 
         * The created groups are then added to an array, and similarly iterated on until we reach the top level.
         * 
         * When row groups have no original parent, it's added to the result.
         */
        const topLevelResultCols: (Column | ColumnGroup)[] = [];
        
        // this is an array of cols or col groups at one level of depth, starting from leaf and ending at root
        let groupsOrColsAtCurrentLevel: (Column | ColumnGroup)[] = sortedVisibleColumns;
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
                const previousNodeProvided = previousNode instanceof ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent();

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
                const newGroup = this.createColumnGroup(
                    previousNodeParent,
                    groupInstanceIdCreator,
                    oldColumnsMapped,
                    pinned
                );

                for (let i = from; i < to; i++) {
                    newGroup.addChild(currentlyIterating[i]);
                }
                groupsOrColsAtCurrentLevel.push(newGroup);
            };

            for (let i = 1; i < currentlyIterating.length; i++) {
                const thisNode = currentlyIterating[i];
                const thisNodeProvided = thisNode instanceof ColumnGroup ? thisNode.getProvidedColumnGroup() : thisNode;
                const thisNodeParent = thisNodeProvided.getOriginalParent();

                const previousNode = currentlyIterating[lastGroupedColIdx];
                const previousNodeProvided = previousNode instanceof ColumnGroup ? previousNode.getProvidedColumnGroup() : previousNode;
                const previousNodeParent = previousNodeProvided.getOriginalParent();

                if (thisNodeParent !== previousNodeParent) {
                    createGroupToIndex(i);
                }
            }

            if (lastGroupedColIdx < currentlyIterating.length) {
                createGroupToIndex(currentlyIterating.length);
            }
        }
        this.setupParentsIntoColumns(topLevelResultCols, null);
        return topLevelResultCols;
    }

    private createColumnGroup(
            providedGroup: ProvidedColumnGroup,
            groupInstanceIdCreator: GroupInstanceIdCreator,
            oldColumnsMapped: {[key: string]: ColumnGroup},
            pinned: ColumnPinnedType
        ): ColumnGroup {

        const groupId = providedGroup.getGroupId();
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = ColumnGroup.createUniqueId(groupId, instanceId);

        let columnGroup: ColumnGroup | null = oldColumnsMapped[uniqueId];

        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.getProvidedColumnGroup() !== providedGroup) {
            columnGroup = null;
        }

        if (exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        } else {
            columnGroup = new ColumnGroup(providedGroup, groupId, instanceId, pinned);
            this.context.createBean(columnGroup);
        }

        return columnGroup;
    }

    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    private mapOldGroupsById(displayedGroups: IHeaderColumn[]): {[uniqueId: string]: ColumnGroup} {
        const result: {[uniqueId: HeaderColumnId]: ColumnGroup} = {};

        const recursive = (columnsOrGroups: IHeaderColumn[] | null) => {
            columnsOrGroups!.forEach(columnOrGroup => {
                if (columnOrGroup instanceof ColumnGroup) {
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

    private setupParentsIntoColumns(columnsOrGroups: IHeaderColumn[] | null, parent: ColumnGroup | null): void {
        columnsOrGroups!.forEach(columnsOrGroup => {
            columnsOrGroup.setParent(parent);
            if (columnsOrGroup instanceof ColumnGroup) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoColumns(columnGroup.getChildren(), columnGroup);
            }
        });
    }
}

function depthFirstAllColumnTreeSearch(
    tree: IHeaderColumn[] | null,
    useDisplayedChildren: boolean,
    callback: (treeNode: IHeaderColumn) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (child instanceof ColumnGroup) {
            const childTree = useDisplayedChildren ? child.getDisplayedChildren() : child.getChildren();
            depthFirstAllColumnTreeSearch(childTree, useDisplayedChildren, callback);
        }
        callback(child);
    }
}
