import {OriginalColumnGroupChild} from "./originalColumnGroupChild";
import {ColGroupDef} from "./colDef";
import {ColumnGroup} from "./columnGroup";
import {Column} from "./column";
import {EventService} from "../eventService";
import {IEventEmitter} from "../interfaces/iEventEmitter";

export class OriginalColumnGroup implements OriginalColumnGroupChild, IEventEmitter  {
    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';

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

    public isPadding(): boolean {
        return this.padding;
    }

    public setExpanded(expanded: boolean): void {
        this.expanded = expanded;
        this.localEventService.dispatchEvent(OriginalColumnGroup.EVENT_EXPANDED_CHANGED);
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
        var result: Column[] = [];
        this.addLeafColumns(result);
        return result;
    }

    private addLeafColumns(leafColumns: Column[]): void {
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

    public calculateExpandable() {
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;

        for (var i = 0, j = this.children.length; i < j; i++) {
            var abstractColumn = this.children[i];
            // if the abstractColumn is a grid generated group, there will be no colDef
            var headerGroupShow = abstractColumn.getColumnGroupShow();
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

        this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
    }

    addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }
}
