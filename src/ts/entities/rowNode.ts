import {EventService} from "../eventService";
import {Events} from "../events";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SelectionController} from "../selectionController";
import {ColDef} from "./colDef";
import {Column} from "./column";
import {ValueService} from "../valueService";
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";

export class RowNode {

    public static EVENT_ROW_SELECTED = 'rowSelected';
    public static EVENT_DATA_CHANGED = 'dataChanged';
    public static EVENT_CELL_CHANGED = 'cellChanged';

    @Autowired('eventService') private mainEventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;

    /** Unique ID for the node. Can be thought of as the index of the row in the original list. */
    public id: number;
    /** The user provided data */
    public data: any;
    /** The parent node to this node, or empty if top level */
    public parent: RowNode;
    /** How many levels this node is from the top */
    public level: number;
    /** True if this node is a group node (ie has children) */
    public group: boolean;
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
    /** Groups only - Children of this group */
    public children: RowNode[];
    /** Groups only - The field we are grouping on eg Country*/
    public field: string;
    /** Groups only - The key for the group eg Ireland, UK, USA */
    public key: any;
    /** Groups only - Filtered children of this group */
    public childrenAfterFilter: RowNode[];
    /** Groups only - Sorted children of this group */
    public childrenAfterSort: RowNode[];
    /** Groups only - Number of children and grand children */
    public allChildrenCount: number;
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
        var column = this.columnController.getColumn(colKey);
        this.valueService.setValue(this, column, newValue);
        var event = {column: column, newValue: newValue};
        this.dispatchLocalEvent(RowNode.EVENT_CELL_CHANGED, event);
    }

    public resetQuickFilterAggregateText(): void {
        this.quickFilterAggregateText = null;
    }

    public isSelected(): boolean {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }

        return this.selected;
    }

    public deptFirstSearch( callback: (rowNode: RowNode) => void ): void {
        if (this.children) {
            this.children.forEach( child => child.deptFirstSearch(callback) );
        }
        callback(this);
    }

    // + rowController.updateGroupsInSelection()
    public calculateSelectedFromChildren(): void {
        var atLeastOneSelected = false;
        var atLeastOneDeSelected = false;
        var atLeastOneMixed = false;

        var newSelectedValue:boolean;
        if (this.children) {
            for (var i = 0; i < this.children.length; i++) {
                var childState = this.children[i].isSelected();
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
            this.parent.calculateSelectedFromChildren();
        }
    }

    public setSelectedInitialValue(selected: boolean): void {
        this.selected = selected;
    }

    /** Returns true if this row is selected */
    public setSelected(newValue: boolean, clearSelection: boolean = false, tailingNodeInSequence: boolean = false) {

        if (this.floating) {
            console.log('ag-Grid: cannot select floating rows');
            return;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            this.sibling.setSelected(newValue, clearSelection, tailingNodeInSequence);
            return;
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
            this.mainEventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED)

        }
    }

    public selectThisNode(newValue: boolean): void {
        if (this.selected !== newValue) {
            this.selected = newValue;

            if (this.eventService) {
                this.dispatchLocalEvent(RowNode.EVENT_ROW_SELECTED);
            }

            var event:any = {node: this};
            this.mainEventService.dispatchEvent(Events.EVENT_ROW_SELECTED, event)
        }
    }

    private selectChildNodes(newValue: boolean): void {
        for (var i = 0; i<this.children.length; i++) {
            this.children[i].setSelected(newValue, false, true);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.eventService) { this.eventService = new EventService(); }
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

}
