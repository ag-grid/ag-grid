import {EventService} from "../eventService";
import {Events} from "../events";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SelectionController} from "../selectionController";
import {ColDef} from "./colDef";
import {Column} from "./column";
import {ValueService} from "../valueService";
import {ColumnController} from "../columnController/columnController";
import {Autowired, Context} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {Constants} from "../constants";
import {Utils as _} from "../utils";
import {InMemoryRowModel} from "../rowControllers/inMemory/inMemoryRowModel";

export interface SetSelectedParams {
    // true or false, whatever you want to set selection to
    newValue: boolean;
    // whether to remove other selections after this selection is done
    clearSelection?: boolean;
    // true when action is NOT on this node, ie user clicked a group and this is the child of a group
    tailingNodeInSequence?: boolean;
    // gets used when user shif-selects a range
    rangeSelect?: boolean;
    // used in group selection, if true, filtered out children will not be selected
    groupSelectsFiltered?: boolean;
}

export class RowNode {

    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_DATA_CHANGED = 'dataChanged';
    public static EVENT_CELL_CHANGED = 'cellChanged';
    public static EVENT_MOUSE_ENTER = 'mouseEnter';
    public static EVENT_MOUSE_LEAVE = 'mouseLeave';
    public static EVENT_HEIGHT_CHANGED = 'heightChanged';
    public static EVENT_TOP_CHANGED = 'topChanged';
    public static EVENT_ROW_INDEX_CHANGED = 'rowIndexChanged';
    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';

    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;

    /** Unique ID for the node. Either provided by the grid, or user can set to match the primary
     * key in the database (or whatever data source is used). */
    public id: string;
    /** The user provided data */
    public data: any;
    /** The parent node to this node, or empty if top level */
    public parent: RowNode;
    /** How many levels this node is from the top */
    public level: number;
    /** If doing in memory grouping, this is the index of the group column this cell is for.
     * This will always be the same as the level, unless we are collapsing groups ie groupRemoveSingleChildren = true */
    public rowGroupIndex: number;
    /** True if this node is a group node (ie has children) */
    public group: boolean;
    /** True if this node can flower (ie can be expanded, but has no direct children) */
    public canFlower: boolean;
    /** True if this node is a flower */
    public flower: boolean;
    /** The child flower of this node */
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
    /** Either 'top' or 'bottom' if floating, otherwise undefined or null */
    public floating: string;
    /** If using quick filter, stores a string representation of the row for searching against */
    public quickFilterAggregateText: string;
    /** Groups only - True if row is a footer. Footers  have group = true and footer = true */
    public footer: boolean;
    /** Groups only - The field we are grouping on eg Country*/
    public field: string;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    public key: any;

    /** All user provided nodes */
    public allLeafChildren: RowNode[];

    /** Groups only - Children of this group */
    public childrenAfterGroup: RowNode[];
    /** Groups only - Filtered children of this group */
    public childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    public childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    public allChildrenCount: number;

    /** Children mapped by the pivot columns */
    public childrenMapped: {[key: string]: any} = {};

    /** Groups only - True if group is expanded, otherwise false */
    public expanded: boolean;
    /** Groups only - If doing footers, reference to the footer node for this group */
    public sibling: RowNode;

    /** The height, in pixels, of this row */
    public rowHeight: number;
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

    private selected = false;
    private eventService: EventService;

    public setData(data: any): void {
        var oldData = this.data;
        this.data = data;

        var event = {oldData: oldData, newData: data};
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
    }

    private createDaemonNode(): RowNode {
        let oldNode = new RowNode();
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

    public setDataAndId(data: any, id: string): void {
        let oldNode = _.exists(this.id) ? this.createDaemonNode() : null;

        let oldData = this.data;
        this.data = data;

        this.setId(id);

        this.selectionController.syncInRowNode(this, oldNode);

        let event = {oldData: oldData, newData: data};
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
    }

    public setId(id: string): void {
        // see if user is providing the id's
        var getRowNodeId = this.gridOptionsWrapper.getRowNodeIdFunc();
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

    public clearRowTop(): void {
        this.oldRowTop = this.rowTop;
        this.setRowTop(null);
    }

    public setRowTop(rowTop: number): void {
        if (this.rowTop === rowTop) { return; }
        this.rowTop = rowTop;
        if (this.eventService) {
            this.eventService.dispatchEvent(RowNode.EVENT_TOP_CHANGED);
        }
    }

    public setRowHeight(rowHeight: number): void {
        this.rowHeight = rowHeight;
        if (this.eventService) {
            this.eventService.dispatchEvent(RowNode.EVENT_HEIGHT_CHANGED);
        }
    }

    public setRowIndex(rowIndex: number): void {
        this.rowIndex = rowIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(RowNode.EVENT_ROW_INDEX_CHANGED);
        }
    }

    public setExpanded(expanded: boolean): void {
        if (this.expanded === expanded) { return; }

        this.expanded = expanded;
        if (this.eventService) {
            this.eventService.dispatchEvent(RowNode.EVENT_EXPANDED_CHANGED);
        }

        var event: any = {node: this};
        this.mainEventService.dispatchEvent(Events.EVENT_ROW_GROUP_OPENED, event)
    }

    private dispatchLocalEvent(eventName: string, event?: any): void {
        if (this.eventService) {
            this.eventService.dispatchEvent(eventName, event);
        }
    }

    // we also allow editing the value via the editors. when it is done via
    // the editors, no 'cell changed' event gets fired, as it's assumed that
    // the cell knows about the change given it's in charge of the editing.
    // this method is for the client to call, so the cell listens for the change
    // event, and also flashes the cell when the change occurs.
    public setDataValue(colKey: string|ColDef|Column, newValue: any): void {
        var column = this.columnController.getGridColumn(colKey);
        this.valueService.setValue(this, column, newValue);
        var event = {column: column, newValue: newValue};
        this.dispatchLocalEvent(RowNode.EVENT_CELL_CHANGED, event);
    }

    public resetQuickFilterAggregateText(): void {
        this.quickFilterAggregateText = null;
    }

    public isExpandable(): boolean {
        return this.group || this.canFlower;
    }

    public isSelected(): boolean {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }

        return this.selected;
    }

    public depthFirstSearch( callback: (rowNode: RowNode) => void ): void {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach( child => child.depthFirstSearch(callback) );
        }
        callback(this);
    }

    // + rowController.updateGroupsInSelection()
    public calculateSelectedFromChildren(): void {
        var atLeastOneSelected = false;
        var atLeastOneDeSelected = false;
        var atLeastOneMixed = false;

        var newSelectedValue:boolean;
        if (this.childrenAfterGroup) {
            for (var i = 0; i < this.childrenAfterGroup.length; i++) {
                var childState = this.childrenAfterGroup[i].isSelected();
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

    private calculateSelectedFromChildrenBubbleUp(): void {
        this.calculateSelectedFromChildren();
        if (this.parent) {
            this.parent.calculateSelectedFromChildrenBubbleUp();
        }
    }

    public setSelectedInitialValue(selected: boolean): void {
        this.selected = selected;
    }

    public setSelected(newValue: boolean, clearSelection: boolean = false, tailingNodeInSequence: boolean = false) {
        this.setSelectedParams({
            newValue: newValue,
            clearSelection: clearSelection,
            tailingNodeInSequence: tailingNodeInSequence,
            rangeSelect: false
        });
    }

    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    public setSelectedParams(params: SetSelectedParams): number {

        var groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        var newValue = params.newValue === true;
        var clearSelection = params.clearSelection === true;
        var tailingNodeInSequence = params.tailingNodeInSequence === true;
        var rangeSelect = params.rangeSelect === true;
        // groupSelectsFiltered only makes sense when group selects children
        var groupSelectsFiltered = groupSelectsChildren && (params.groupSelectsFiltered === true);

        if (this.id===undefined) {
            console.warn('ag-Grid: cannot select node until id for node is known');
            return 0;
        }

        if (this.floating) {
            console.log('ag-Grid: cannot select floating rows');
            return 0;
        }

        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            let count = this.sibling.setSelectedParams(params);
            return count;
        }

        if (rangeSelect) {
            var rowModelNormal = this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL;
            var newRowClicked = this.selectionController.getLastSelectedNode() !== this;
            var allowMultiSelect = this.gridOptionsWrapper.isRowSelectionMulti();
            if (rowModelNormal && newRowClicked && allowMultiSelect) {
                return this.doRowRangeSelection();
            }
        }

        let updatedCount = 0;

        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        let skipThisNode = groupSelectsFiltered && this.group;
        if (!skipThisNode) {
            var thisNodeWasSelected = this.selectThisNode(newValue);
            if (thisNodeWasSelected) { updatedCount++; }
        }

        if (groupSelectsChildren && this.group) {
            updatedCount += this.selectChildNodes(newValue, groupSelectsFiltered);
        }

        // clear other nodes if not doing multi select
        var actionWasOnThisNode = !tailingNodeInSequence;
        if (actionWasOnThisNode) {

            if (newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti())) {
                updatedCount += this.selectionController.clearOtherNodes(this);
            }

            // only if we selected something, then update groups and fire events
            if (updatedCount>0) {

                // update groups
                if (groupSelectsFiltered) {
                    // if the group was selecting filtered, then all nodes above and or below
                    // this node could have check, unchecked or intermediate, so easiest is to
                    // recalculate selected state for all group nodes
                    this.calculatedSelectedForAllGroupNodes();
                } else {
                    // if no selecting filtered, then everything below the group node was either
                    // selected or not selected, no intermediate, so no need to check items below
                    // this one, just the parents all the way up to the root
                    if (groupSelectsChildren && this.parent) {
                        this.parent.calculateSelectedFromChildrenBubbleUp();
                    }
                }

                // fire events

                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                this.mainEventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED);
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
        var lastSelectedNode = this.selectionController.getLastSelectedNode();

        // if lastSelectedNode is missing, we start at the first row
        var firstRowHit = !lastSelectedNode;
        var lastRowHit = false;
        var lastRow: RowNode;

        var groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        let updatedCount = 0;

        var inMemoryRowModel = <InMemoryRowModel> this.rowModel;
        inMemoryRowModel.forEachNodeAfterFilterAndSort( (rowNode: RowNode) => {

            var lookingForLastRow = firstRowHit && !lastRowHit;

            // check if we need to flip the select switch
            if (!firstRowHit) {
                if (rowNode===lastSelectedNode || rowNode===this) {
                    firstRowHit = true;
                }
            }

            var skipThisGroupNode = rowNode.group && groupsSelectChildren;
            if (!skipThisGroupNode) {
                var inRange = firstRowHit && !lastRowHit;
                var childOfLastRow = rowNode.isParentOfNode(lastRow);
                let nodeWasSelected = rowNode.selectThisNode(inRange || childOfLastRow);
                if (nodeWasSelected) {
                    updatedCount++;
                }
            }

            if (lookingForLastRow) {
                if (rowNode===lastSelectedNode || rowNode===this) {

                    lastRowHit = true;
                    if (rowNode===lastSelectedNode) {
                        lastRow = lastSelectedNode;
                    } else {
                        lastRow = this;
                    }
                }
            }
        });

        if (groupsSelectChildren) {
            this.calculatedSelectedForAllGroupNodes();
        }

        this.mainEventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED);

        return updatedCount;
    }

    private isParentOfNode(potentialParent: RowNode): boolean {
        var parentNode = this.parent;
        while (parentNode) {
            if (parentNode === potentialParent) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    }

    private calculatedSelectedForAllGroupNodes(): void {
        // we have to make sure we do this dept first, as parent nodes
        // will have dependencies on the children having correct values
        var inMemoryRowModel = <InMemoryRowModel> this.rowModel;
        inMemoryRowModel.getTopLevelNodes().forEach( topLevelNode => {
            if (topLevelNode.group) {
                topLevelNode.depthFirstSearch( childNode => {
                    if (childNode.group) {
                        childNode.calculateSelectedFromChildren();
                    }
                });
                topLevelNode.calculateSelectedFromChildren();
            }
        });
    }

    public selectThisNode(newValue: boolean): boolean {
        if (this.selected === newValue) { return false; }

        this.selected = newValue;

        if (this.eventService) {
            this.dispatchLocalEvent(RowNode.EVENT_ROW_SELECTED);
        }

        var event: any = {node: this};
        this.mainEventService.dispatchEvent(Events.EVENT_ROW_SELECTED, event);

        return true;
    }

    private selectChildNodes(newValue: boolean, groupSelectsFiltered: boolean): number {
        var children = groupSelectsFiltered ? this.childrenAfterFilter : this.childrenAfterGroup;
        let updatedCount = 0;
        if (_.missing(children)) { return; }
        for (var i = 0; i<children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                tailingNodeInSequence: true
            });
        }
        return updatedCount;
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.eventService) { this.eventService = new EventService(); }
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

    public onMouseEnter(): void {
        this.dispatchLocalEvent(RowNode.EVENT_MOUSE_ENTER);
    }

    public onMouseLeave(): void {
        this.dispatchLocalEvent(RowNode.EVENT_MOUSE_LEAVE);
    }
}
