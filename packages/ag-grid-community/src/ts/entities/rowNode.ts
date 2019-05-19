import { EventService } from "../eventService";
import { AgEvent, Events, RowEvent, RowGroupOpenedEvent, RowSelectedEvent, SelectionChangedEvent } from "../events";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { SelectionController } from "../selectionController";
import { Column } from "./column";
import { ValueService } from "../valueService/valueService";
import { ColumnController } from "../columnController/columnController";
import { ColumnApi } from "../columnController/columnApi";
import { Autowired, Context } from "../context/context";
import { IRowModel } from "../interfaces/iRowModel";
import { Constants } from "../constants";
import { RowNodeCache, RowNodeCacheParams } from "../rowModels/cache/rowNodeCache";
import { RowNodeBlock } from "../rowModels/cache/rowNodeBlock";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ValueCache } from "../valueService/valueCache";
import { DetailGridInfo, GridApi } from "../gridApi";
import { _ } from "../utils";

export interface SetSelectedParams {
    // true or false, whatever you want to set selection to
    newValue: boolean;
    // whether to remove other selections after this selection is done
    clearSelection?: boolean;
    // true when action is NOT on this node, ie user clicked a group and this is the child of a group
    suppressFinishActions?: boolean;
    // gets used when user shift-selects a range
    rangeSelect?: boolean;
    // used in group selection, if true, filtered out children will not be selected
    groupSelectsFiltered?: boolean;
}

export interface RowNodeEvent extends AgEvent {
    node: RowNode;
}

export interface DataChangedEvent extends RowNodeEvent {
    oldData: any;
    newData: any;
    update: boolean;
}

export interface CellChangedEvent extends RowNodeEvent {
    column: Column;
    newValue: any;
}

export class RowNode implements IEventEmitter {

    private static OBJECT_ID_SEQUENCE = 0;

    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_DATA_CHANGED = 'dataChanged';
    public static EVENT_CELL_CHANGED = 'cellChanged';
    public static EVENT_ALL_CHILDREN_COUNT_CHANGED = 'allChildrenCountChanged';
    public static EVENT_MOUSE_ENTER = 'mouseEnter';
    public static EVENT_MOUSE_LEAVE = 'mouseLeave';
    public static EVENT_HEIGHT_CHANGED = 'heightChanged';
    public static EVENT_TOP_CHANGED = 'topChanged';
    public static EVENT_FIRST_CHILD_CHANGED = 'firstChildChanged';
    public static EVENT_LAST_CHILD_CHANGED = 'lastChildChanged';
    public static EVENT_CHILD_INDEX_CHANGED = 'childIndexChanged';
    public static EVENT_ROW_INDEX_CHANGED = 'rowIndexChanged';
    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';
    public static EVENT_SELECTABLE_CHANGED = 'selectableChanged';
    public static EVENT_UI_LEVEL_CHANGED = 'uiLevelChanged';
    public static EVENT_DRAGGING_CHANGED = 'draggingChanged';

    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    /** Unique ID for the node. Either provided by the grid, or user can set to match the primary
     * key in the database (or whatever data source is used). */
    public id: string;
    /** The group data */
    public groupData: any;
    /** The aggregated data */
    public aggData: any;
    /** The user provided data */
    public data: any;
    /** The parent node to this node, or empty if top level */
    public parent: RowNode | null;
    /** How many levels this node is from the top */
    public level: number;
    /** How many levels this node is from the top in the UI (different to the level when removing parents)*/
    public uiLevel: number;
    /** If doing in memory grouping, this is the index of the group column this cell is for.
     * This will always be the same as the level, unless we are collapsing groups ie groupRemoveSingleChildren = true */
    public rowGroupIndex: number | null;
    /** True if this node is a group node (ie has children) */
    public group: boolean | undefined;
    /** True if this row is getting dragged */
    public dragging: boolean;

    /** True if this row is a master row, part of master / detail (ie row can be expanded to show detail) */
    public master: boolean;
    /** True if this row is a detail row, part of master / detail (ie child row of an expanded master row)*/
    public detail: boolean;
    /** If this row is a master row that was expanded, this points to the associated detail row. */
    public detailNode: RowNode;
    /** If master detail, this contains details about the detail grid */
    public detailGridInfo: DetailGridInfo | null;

    /** Same as master, kept for legacy reasons */
    public canFlower: boolean;
    /** Same as detail, kept for legacy reasons */
    public flower: boolean;
    /** Same as detailNode, kept for legacy reasons */
    public childFlower: RowNode;

    /** True if this node is a group and the group is the bottom level in the tree */
    public leafGroup: boolean;
    /** True if this is the first child in this group */
    public firstChild: boolean;
    /** True if this is the last child in this group */
    public lastChild: boolean;
    /** The index of this node in the group */
    public childIndex: number;
    /** The index of this node in the grid, only valid if node is displayed in the grid, otherwise it should be ignored as old index may be present */
    public rowIndex: number;
    /** Either 'top' or 'bottom' if row pinned, otherwise undefined or null */
    public rowPinned: string;
    /** If using quick filter, stores a string representation of the row for searching against */
    public quickFilterAggregateText: string;
    /** Groups only - True if row is a footer. Footers  have group = true and footer = true */
    public footer: boolean;
    /** Groups only - The field we are grouping on eg Country*/
    public field: string | null;
    /** Groups only - the row group column for this group */
    public rowGroupColumn: Column | null;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    public key: any;
    /** Used by server side row model, true if this row node is a stub */
    public stub: boolean;

    /** All user provided nodes */
    public allLeafChildren: RowNode[];

    /** Groups only - Children of this group */
    public childrenAfterGroup: RowNode[];
    /** Groups only - Filtered children of this group */
    public childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    public childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    public allChildrenCount: number | null;

    /** Children mapped by the pivot columns */
    public childrenMapped: { [key: string]: any } | null = {};

    /** Server Side Row Model Only - the children are in an infinite cache */
    public childrenCache: RowNodeCache<RowNodeBlock, RowNodeCacheParams> | null;

    /** Groups only - True if group is expanded, otherwise false */
    public expanded: boolean;
    /** Groups only - If doing footers, reference to the footer node for this group */
    public sibling: RowNode;

    /** The height, in pixels, of this row */
    public rowHeight: number;
    /** Dynamic row heights are done on demand, only when row is visible. However for row virtualisation
     * we need a row height to do the 'what rows are in viewport' maths. So we assign a row height to each
     * row based on defaults and rowHeightEstimated=true, then when the row is needed for drawing we do
     * the row height calculation and set rowHeightEstimated=false.*/
    public rowHeightEstimated: boolean;
    /** The top pixel for this row */
    public rowTop: number;
    /** The top pixel for this row last time, makes sense if data set was ordered or filtered,
     * it is used so new rows can animate in from their old position. */
    public oldRowTop: number;
    /** True if this node is a daemon. This means row is not part of the model. Can happen when then
     * the row is selected and then the user sets a different ID onto the node. The nodes is then
     * representing a different entity, so the selection controller, if the node is selected, takes
     * a copy where daemon=true. */
    public daemon: boolean;

    /** True by default - can be overridden via gridOptions.isRowSelectable(rowNode) */
    public selectable = true;

    /** Used by the value service, stores values for a particular change detection turn. */
    public __cacheData: { [colId: string]: any };
    public __cacheVersion: number;

    /** Used by sorting service - to give deterministic sort to groups. Previously we
     * just id for this, however id is a string and had slower sorting compared to numbers. */
    public __objectId: number = RowNode.OBJECT_ID_SEQUENCE++;

    /** True when nodes with the same id are being removed and added as part of the same batch transaction */
    public alreadyRendered = false;

    private selected = false;
    private eventService: EventService;

    public setData(data: any): void {
        const oldData = this.data;
        this.data = data;

        this.valueCache.onDataChanged();

        this.updateDataOnDetailNode();

        this.checkRowSelectable();

        const event: DataChangedEvent = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    }

    // when we are doing master / detail, the detail node is lazy created, but then kept around.
    // so if we show / hide the detail, the same detail rowNode is used. so we need to keep the data
    // in sync, otherwise expand/collapse of the detail would still show the old values.
    private updateDataOnDetailNode(): void {
        if (this.detailNode) {
            this.detailNode.data = this.data;
        }
    }

    private createDataChangedEvent(newData: any, oldData: any, update: boolean): DataChangedEvent {
        return {
            type: RowNode.EVENT_DATA_CHANGED,
            node: this,
            oldData: oldData,
            newData: newData,
            update: update
        };
    }

    private createLocalRowEvent(type: string): RowNodeEvent {
        return {
            type: type,
            node: this
        };
    }

    // similar to setRowData, however it is expected that the data is the same data item. this
    // is intended to be used with Redux type stores, where the whole data can be changed. we are
    // guaranteed that the data is the same entity (so grid doesn't need to worry about the id of the
    // underlying data changing, hence doesn't need to worry about selection). the grid, upon receiving
    // dataChanged event, will refresh the cells rather than rip them all out (so user can show transitions).
    public updateData(data: any): void {
        const oldData = this.data;
        this.data = data;

        this.updateDataOnDetailNode();

        this.checkRowSelectable();

        this.updateDataOnDetailNode();

        const event: DataChangedEvent = this.createDataChangedEvent(data, oldData, true);
        this.dispatchLocalEvent(event);
    }

    public getRowIndexString(): string {
        if (this.rowPinned === Constants.PINNED_TOP) {
            return 't-' + this.rowIndex;
        } else if (this.rowPinned === Constants.PINNED_BOTTOM) {
            return 'b-' + this.rowIndex;
        } else {
            return this.rowIndex.toString();
        }
    }

    private createDaemonNode(): RowNode {
        const oldNode = new RowNode();
        this.context.wireBean(oldNode);
        // just copy the id and data, this is enough for the node to be used
        // in the selection controller (the selection controller is the only
        // place where daemon nodes can live).
        oldNode.id = this.id;
        oldNode.data = this.data;
        oldNode.daemon = true;
        oldNode.selected = this.selected;
        oldNode.level = this.level;
        return oldNode;
    }

    public setDataAndId(data: any, id: string | undefined): void {
        const oldNode = _.exists(this.id) ? this.createDaemonNode() : null;

        const oldData = this.data;
        this.data = data;
        this.updateDataOnDetailNode();

        this.setId(id);

        this.selectionController.syncInRowNode(this, oldNode);

        this.checkRowSelectable();

        const event: DataChangedEvent = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    }

    private checkRowSelectable() {
        const isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
        const shouldInvokeIsRowSelectable = isRowSelectableFunc && _.exists(this);
        this.setRowSelectable(shouldInvokeIsRowSelectable ? isRowSelectableFunc(this) : true);
    }

    public setRowSelectable(newVal: boolean) {
        if (this.selectable !== newVal) {
            this.selectable = newVal;
            if (this.eventService) {
                this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_SELECTABLE_CHANGED));
            }
        }
    }

    public setId(id: string): void {
        // see if user is providing the id's
        const getRowNodeId = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (getRowNodeId) {
            // if user is providing the id's, then we set the id only after the data has been set.
            // this is important for virtual pagination and viewport, where empty rows exist.
            if (this.data) {
                this.id = getRowNodeId(this.data);
            } else {
                // this can happen if user has set blank into the rowNode after the row previously
                // having data. this happens in virtual page row model, when data is delete and
                // the page is refreshed.
                this.id = undefined;
            }
        } else {
            this.id = id;
        }
    }

    public isPixelInRange(pixel: number): boolean {
        return pixel >= this.rowTop && pixel < (this.rowTop + this.rowHeight);
    }

    public clearRowTop(): void {
        this.oldRowTop = this.rowTop;
        this.setRowTop(null);
    }

    public setFirstChild(firstChild: boolean): void {
        if (this.firstChild === firstChild) {
            return;
        }
        this.firstChild = firstChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_FIRST_CHILD_CHANGED));
        }
    }

    public setLastChild(lastChild: boolean): void {
        if (this.lastChild === lastChild) {
            return;
        }
        this.lastChild = lastChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_LAST_CHILD_CHANGED));
        }
    }

    public setChildIndex(childIndex: number): void {
        if (this.childIndex === childIndex) {
            return;
        }
        this.childIndex = childIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_CHILD_INDEX_CHANGED));
        }
    }

    public setRowTop(rowTop: number | null): void {
        if (this.rowTop === rowTop) {
            return;
        }
        this.rowTop = rowTop;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_TOP_CHANGED));
        }
    }

    public setDragging(dragging: boolean): void {
        if (this.dragging === dragging) {
            return;
        }
        this.dragging = dragging;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DRAGGING_CHANGED));
        }
    }

    public setAllChildrenCount(allChildrenCount: number | null): void {
        if (this.allChildrenCount === allChildrenCount) {
            return;
        }
        this.allChildrenCount = allChildrenCount;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED));
        }
    }

    public setRowHeight(rowHeight: number | undefined | null, estimated = false): void {
        this.rowHeight = rowHeight;
        this.rowHeightEstimated = estimated;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HEIGHT_CHANGED));
        }
    }

    public setRowIndex(rowIndex: number): void {
        this.rowIndex = rowIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_INDEX_CHANGED));
        }
    }

    public setUiLevel(uiLevel: number): void {
        if (this.uiLevel === uiLevel) {
            return;
        }

        this.uiLevel = uiLevel;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_UI_LEVEL_CHANGED));
        }
    }

    public setExpanded(expanded: boolean): void {
        if (this.expanded === expanded) {
            return;
        }

        this.expanded = expanded;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_EXPANDED_CHANGED));
        }

        const event: RowGroupOpenedEvent = this.createGlobalRowEvent(Events.EVENT_ROW_GROUP_OPENED);
        this.mainEventService.dispatchEvent(event);

        if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
            this.gridApi.redrawRows({rowNodes: [this]});
        }
    }

    private createGlobalRowEvent(type: string): RowEvent {
        const event: RowGroupOpenedEvent = {
            type: type,
            node: this,
            data: this.data,
            rowIndex: this.rowIndex,
            rowPinned: this.rowPinned,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        return event;
    }

    private dispatchLocalEvent(event: AgEvent): void {
        if (this.eventService) {
            this.eventService.dispatchEvent(event);
        }
    }

    // we also allow editing the value via the editors. when it is done via
    // the editors, no 'cell changed' event gets fired, as it's assumed that
    // the cell knows about the change given it's in charge of the editing.
    // this method is for the client to call, so the cell listens for the change
    // event, and also flashes the cell when the change occurs.
    public setDataValue(colKey: string | Column, newValue: any): void {
        const column = this.columnController.getPrimaryColumn(colKey);
        this.valueService.setValue(this, column, newValue);
        this.dispatchCellChangedEvent(column, newValue);
    }

    public setGroupValue(colKey: string | Column, newValue: any): void {
        const column = this.columnController.getGridColumn(colKey);

        if (_.missing(this.groupData)) {
            this.groupData = {};
        }

        this.groupData[column.getColId()] = newValue;
        this.dispatchCellChangedEvent(column, newValue);
    }

    // sets the data for an aggregation
    public setAggData(newAggData: any): void {

        // find out all keys that could potentially change
        const colIds = _.getAllKeysInObjects([this.aggData, newAggData]);

        this.aggData = newAggData;

        // if no event service, nobody has registered for events, so no need fire event
        if (this.eventService) {
            colIds.forEach(colId => {
                const column = this.columnController.getGridColumn(colId);
                const value = this.aggData ? this.aggData[colId] : undefined;
                this.dispatchCellChangedEvent(column, value);
            });
        }
    }

    public hasChildren(): boolean {
        // we need to return true when this.group=true, as this is used by server side row model
        // (as children are lazy loaded and stored in a cache anyway). otherwise we return true
        // if children exist.
        return this.group || (this.childrenAfterGroup && this.childrenAfterGroup.length > 0);
    }

    public isEmptyRowGroupNode(): boolean {
        return this.group && _.missingOrEmpty(this.childrenAfterGroup);
    }

    private dispatchCellChangedEvent(column: Column, newValue: any): void {
        const cellChangedEvent: CellChangedEvent = {
            type: RowNode.EVENT_CELL_CHANGED,
            node: this,
            column: column,
            newValue: newValue
        };
        this.dispatchLocalEvent(cellChangedEvent);
    }

    public resetQuickFilterAggregateText(): void {
        this.quickFilterAggregateText = null;
    }

    public isExpandable(): boolean {
        return this.hasChildren() || this.master;
    }

    public isSelected(): boolean {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }

        return this.selected;
    }

    public depthFirstSearch(callback: (rowNode: RowNode) => void): void {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach(child => child.depthFirstSearch(callback));
        }
        callback(this);
    }

    // + rowController.updateGroupsInSelection()
    // + selectionController.calculatedSelectedForAllGroupNodes()
    public calculateSelectedFromChildren(): void {
        let atLeastOneSelected = false;
        let atLeastOneDeSelected = false;
        let atLeastOneMixed = false;

        let newSelectedValue: boolean;
        if (this.childrenAfterGroup) {
            for (let i = 0; i < this.childrenAfterGroup.length; i++) {
                const child = this.childrenAfterGroup[i];

                // skip non-selectable nodes to prevent inconsistent selection values
                if (!child.selectable) { continue; }

                const childState = child.isSelected();
                switch (childState) {
                    case true:
                        atLeastOneSelected = true;
                        break;
                    case false:
                        atLeastOneDeSelected = true;
                        break;
                    default:
                        atLeastOneMixed = true;
                        break;
                }
            }
        }

        if (atLeastOneMixed) {
            newSelectedValue = undefined;
        } else if (atLeastOneSelected && !atLeastOneDeSelected) {
            newSelectedValue = true;
        } else if (!atLeastOneSelected && atLeastOneDeSelected) {
            newSelectedValue = false;
        } else {
            newSelectedValue = undefined;
        }
        this.selectThisNode(newSelectedValue);
    }

    public setSelectedInitialValue(selected: boolean): void {
        this.selected = selected;
    }

    public setSelected(newValue: boolean, clearSelection: boolean = false, suppressFinishActions: boolean = false) {
        this.setSelectedParams({
            newValue: newValue,
            clearSelection: clearSelection,
            suppressFinishActions: suppressFinishActions,
            rangeSelect: false
        });
    }

    public isRowPinned(): boolean {
        return this.rowPinned === Constants.PINNED_TOP || this.rowPinned === Constants.PINNED_BOTTOM;
    }

    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    public setSelectedParams(params: SetSelectedParams): number {

        const groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        const newValue = params.newValue === true;
        const clearSelection = params.clearSelection === true;
        const suppressFinishActions = params.suppressFinishActions === true;
        const rangeSelect = params.rangeSelect === true;
        // groupSelectsFiltered only makes sense when group selects children
        const groupSelectsFiltered = groupSelectsChildren && (params.groupSelectsFiltered === true);

        if (this.id === undefined) {
            console.warn('ag-Grid: cannot select node until id for node is known');
            return 0;
        }

        if (this.rowPinned) {
            console.warn('ag-Grid: cannot select pinned rows');
            return 0;
        }

        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            const count = this.sibling.setSelectedParams(params);
            return count;
        }

        if (rangeSelect) {
            const newRowClicked = this.selectionController.getLastSelectedNode() !== this;
            const allowMultiSelect = this.gridOptionsWrapper.isRowSelectionMulti();
            if (newRowClicked && allowMultiSelect) {
                return this.doRowRangeSelection();
            }
        }

        let updatedCount = 0;

        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        const skipThisNode = groupSelectsFiltered && this.group;
        if (!skipThisNode) {
            const thisNodeWasSelected = this.selectThisNode(newValue);
            if (thisNodeWasSelected) {
                updatedCount++;
            }
        }

        if (groupSelectsChildren && this.group) {
            updatedCount += this.selectChildNodes(newValue, groupSelectsFiltered);
        }

        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {

            const clearOtherNodes = newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti());
            if (clearOtherNodes) {
                updatedCount += this.selectionController.clearOtherNodes(this);
            }

            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {

                this.selectionController.updateGroupsFromChildrenSelections();

                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                const event: SelectionChangedEvent = {
                    type: Events.EVENT_SELECTION_CHANGED,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.mainEventService.dispatchEvent(event);
            }

            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.selectionController.setLastSelectedNode(this);
            }
        }

        return updatedCount;
    }

    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    private doRowRangeSelection(): number {
        let updatedCount = 0;

        const groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        const lastSelectedNode = this.selectionController.getLastSelectedNode();

        const nodesToSelect = this.rowModel.getNodesInRangeForSelection(this, lastSelectedNode);

        nodesToSelect.forEach(rowNode => {
            if (rowNode.group && groupsSelectChildren) {
                return;
            }

            const nodeWasSelected = rowNode.selectThisNode(true);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });

        this.selectionController.updateGroupsFromChildrenSelections();

        const event: SelectionChangedEvent = {
            type: Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.mainEventService.dispatchEvent(event);

        return updatedCount;
    }

    public isParentOfNode(potentialParent: RowNode): boolean {
        let parentNode = this.parent;
        while (parentNode) {
            if (parentNode === potentialParent) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    }

    public selectThisNode(newValue: boolean): boolean {
        if (!this.selectable || this.selected === newValue) { return false; }

        this.selected = newValue;

        if (this.eventService) {
            this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_SELECTED));
        }

        const event: RowSelectedEvent = this.createGlobalRowEvent(Events.EVENT_ROW_SELECTED);
        this.mainEventService.dispatchEvent(event);

        return true;
    }

    private selectChildNodes(newValue: boolean, groupSelectsFiltered: boolean): number {
        const children = groupSelectsFiltered ? this.childrenAfterFilter : this.childrenAfterGroup;

        let updatedCount = 0;
        if (_.missing(children)) {
            return;
        }
        for (let i = 0; i < children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                suppressFinishActions: true,
                groupSelectsFiltered
            });
        }
        return updatedCount;
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.eventService) {
            this.eventService = new EventService();
        }
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    public onMouseEnter(): void {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_ENTER));
    }

    public onMouseLeave(): void {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_LEAVE));
    }

    public getFirstChildOfFirstChild(rowGroupColumn: Column | null): RowNode {
        let currentRowNode: RowNode = this;

        // if we are hiding groups, then if we are the first child, of the first child,
        // all the way up to the column we are interested in, then we show the group cell.

        let isCandidate = true;
        let foundFirstChildPath = false;
        let nodeToSwapIn: RowNode;

        while (isCandidate && !foundFirstChildPath) {

            const parentRowNode = currentRowNode.parent;
            const firstChild = _.exists(parentRowNode) && currentRowNode.firstChild;

            if (firstChild) {
                if (parentRowNode.rowGroupColumn === rowGroupColumn) {
                    foundFirstChildPath = true;
                    nodeToSwapIn = parentRowNode;
                }
            } else {
                isCandidate = false;
            }

            currentRowNode = parentRowNode;
        }

        return foundFirstChildPath ? nodeToSwapIn : null;
    }
}