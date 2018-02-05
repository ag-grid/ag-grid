import {OriginalColumnGroupChild} from "./originalColumnGroupChild";
import {ColGroupDef} from "./colDef";
import {ColumnGroup} from "./columnGroup";
import {Column} from "./column";
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {Autowired} from "../context/context";
import {ColumnApi} from "../columnController/columnApi";
import {GridApi} from "../gridApi";
import {AgEvent} from "../events";

export class OriginalColumnGroup implements OriginalColumnGroupChild, IEventEmitter  {

    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';
    public static EVENT_EXPANDABLE_CHANGED = 'expandableChanged';

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private localEventService = new EventService();

    private colGroupDef: ColGroupDef;

    private children: OriginalColumnGroupChild[];
    private groupId: string;
    private expandable = false;

    private expanded: boolean;
    private padding: boolean;

    constructor(colGroupDef: ColGroupDef, groupId: string, padding: boolean) {
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
    }

    public isVisible(): boolean {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(child => child.isVisible());
        } else {
            return false;
        }
    }

    public isPadding(): boolean {
        return this.padding;
    }

    public setExpanded(expanded: boolean): void {
        this.expanded = expanded;
        let event: AgEvent = {
            type: OriginalColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    }

    public isExpandable(): boolean {
        return this.expandable;
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public getGroupId(): string {
        return this.groupId;
    }

    public getId(): string {
        return this.getGroupId();
    }

    public setChildren(children: OriginalColumnGroupChild[]): void {
        this.children = children;
    }

    public getChildren(): OriginalColumnGroupChild[] {
        return this.children;
    }

    public getColGroupDef(): ColGroupDef {
        return this.colGroupDef;
    }

    public getLeafColumns(): Column[] {
        let result: Column[] = [];
        this.addLeafColumns(result);
        return result;
    }

    private addLeafColumns(leafColumns: Column[]): void {
        if (!this.children) { return; }
        this.children.forEach( (child: OriginalColumnGroupChild) => {
            if (child instanceof Column) {
                leafColumns.push(<Column>child);
            } else if (child instanceof OriginalColumnGroup) {
                (<OriginalColumnGroup>child).addLeafColumns(leafColumns);
            }
        });
    }

    public getColumnGroupShow(): string {
        if (!this.padding) {
            return this.colGroupDef.columnGroupShow;
        } else {
            // if this is padding we have exactly only child. we then
            // take the value from the child and push it up, making
            // this group 'invisible'.
            return this.children[0].getColumnGroupShow();
        }
    }

    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group

    public setupExpandable() {
        this.setExpandable();
        // note - we should be removing this event listener
        this.getLeafColumns().forEach( col => col.addEventListener(Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibilityChanged.bind(this)));
    }

    public setExpandable() {
        // want to make sure the group doesn't disappear when it's open
        let atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        let atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        let atLeastOneChangeable = false;

        for (let i = 0, j = this.children.length; i < j; i++) {
            let abstractColumn = this.children[i];
            if (!abstractColumn.isVisible()) {
                continue;
            }
            // if the abstractColumn is a grid generated group, there will be no colDef
            let headerGroupShow = abstractColumn.getColumnGroupShow();
            if (headerGroupShow === ColumnGroup.HEADER_GROUP_SHOW_OPEN) {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            } else if (headerGroupShow === ColumnGroup.HEADER_GROUP_SHOW_CLOSED) {
                atLeastOneShowingWhenClosed = true;
                atLeastOneChangeable = true;
            } else {
                atLeastOneShowingWhenOpen = true;
                atLeastOneShowingWhenClosed = true;
            }
        }

        let expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;

        if (this.expandable !== expandable) {
            this.expandable = expandable;
            let event: AgEvent = {
                type: OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event);
        }
    }

    private onColumnVisibilityChanged(): void {
        this.setExpandable();
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }
}
