import {EventService} from "../eventService";
import {Events} from "../events";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SelectionController} from "../selectionController";
import {ColDef} from "./colDef";
import {Column} from "./column";
import {ValueService} from "../valueService";
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {Constants} from "../constants";
import {InMemoryRowModel} from "../rowControllers/inMemory/inMemoryRowModel";

export class RowNode {

    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_DATA_CHANGED = 'dataChanged';
    public static EVENT_CELL_CHANGED = 'cellChanged';
    public static EVENT_MOUSE_ENTER = 'mouseEnter';
    public static EVENT_MOUSE_LEAVE = 'mouseLeave';

    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('rowModel') private rowModel: IRowModel;

    /** Unique ID for the node. Either provided by the grid, or user can set to match the primary
     * key in the database (or whatever data source is used). */
    public id: string;
    /** The user provided data */
    public data: any;
    /** The parent node to this node, or empty if top level */
    public parent: RowNode;
    /** How many levels this node is from the top */
    public level: number;
    /** True if this node is a group node (ie has children) */
    public group: boolean;
    /** True if this node can flower (ie can be expanded, but has no direct children) */
    public canFlower: boolean;
    /** True if this node is a flower */
    public flower: boolean;
    /** True if this node is a group and the group is the bottom level in the tree */
    public leafGroup: boolean;
    /** True if this is the first child in this group */
    public firstChild: boolean;
    /** True if this is the last child in this group */
    public lastChild: boolean;
    /** The index of this node in the group */
    public childIndex: number;
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
    /** Not to be used, internal temporary map used by the grid when creating groups */
    public _childrenMap: {};
    /** The height, in pixels, of this row */
    public rowHeight: number;
    /** The top pixel for this row */
    public rowTop: number;

    private selected = false;
    private eventService: EventService;

    public setData(data: any): void {
        var oldData = this.data;
        this.data = data;

        var event = {oldData: oldData, newData: data};
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
    }

    public setDataAndId(data: any, id: string): void {
        var oldData = this.data;
        this.data = data;

        this.setId(id);

        this.selectionController.syncInRowNode(this);

        var event = {oldData: oldData, newData: data};
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

    public deptFirstSearch( callback: (rowNode: RowNode) => void ): void {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach( child => child.deptFirstSearch(callback) );
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
    public setSelectedParams(params: {newValue: boolean, clearSelection?: boolean, tailingNodeInSequence?: boolean, rangeSelect?: boolean}): void {

        var newValue = params.newValue === true;
        var clearSelection = params.clearSelection === true;
        var tailingNodeInSequence = params.tailingNodeInSequence === true;
        var rangeSelect = params.rangeSelect === true;

        if (this.id===undefined) {
            console.warn('ag-Grid: cannot select node until id for node is known');
            return;
        }

        if (this.floating) {
            console.log('ag-Grid: cannot select floating rows');
            return;
        }

        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            this.sibling.setSelectedParams(params);
            return;
        }

        if (rangeSelect) {
            var rowModelNormal = this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL;
            var newRowClicked = this.selectionController.getLastSelectedNode() !== this;
            var allowMultiSelect = this.gridOptionsWrapper.isRowSelectionMulti();
            if (rowModelNormal && newRowClicked && allowMultiSelect) {
                this.doRowRangeSelection();
                return;
            }
        }

        this.selectThisNode(newValue);

        var groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

        if (groupSelectsChildren && this.group) {
            this.selectChildNodes(newValue);
        }

        // clear other nodes if not doing multi select
        var actionWasOnThisNode = !tailingNodeInSequence;
        if (actionWasOnThisNode) {

            if (newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti())) {
                this.selectionController.clearOtherNodes(this);
            }

            if (groupSelectsChildren && this.parent) {
                this.parent.calculateSelectedFromChildrenBubbleUp();
            }

            // this is the very end of the 'action node', so we are finished all the updates,
            // include any parent / child changes that this method caused
            this.mainEventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED);

            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.selectionController.setLastSelectedNode(this);
            }
        }
    }

    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    private doRowRangeSelection(): void {
        var lastSelectedNode = this.selectionController.getLastSelectedNode();

        // if lastSelectedNode is missing, we start at the first row
        var firstRowHit = !lastSelectedNode;
        var lastRowHit = false;
        var lastRow: RowNode;

        var groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();

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
                rowNode.selectThisNode(inRange || childOfLastRow);
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
                topLevelNode.deptFirstSearch( childNode => {
                    if (childNode.group) {
                        childNode.calculateSelectedFromChildren();
                    }
                });
                topLevelNode.calculateSelectedFromChildren();
            }
        });
    }

    public selectThisNode(newValue: boolean): void {
        if (this.selected !== newValue) {
            this.selected = newValue;

            if (this.eventService) {
                this.dispatchLocalEvent(RowNode.EVENT_ROW_SELECTED);
            }

            var event: any = {node: this};
            this.mainEventService.dispatchEvent(Events.EVENT_ROW_SELECTED, event)
        }
    }

    private selectChildNodes(newValue: boolean): void {
        for (var i = 0; i<this.childrenAfterGroup.length; i++) {
            this.childrenAfterGroup[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                tailingNodeInSequence: true
            });
        }
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
