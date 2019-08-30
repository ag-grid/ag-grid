import { ColumnGroupChild } from "./columnGroupChild";
import { ColGroupDef } from "./colDef";
import { Column } from "./column";
import { AbstractColDef } from "./colDef";
import { OriginalColumnGroup } from "./originalColumnGroup";
import { EventService } from "../eventService";
import { Autowired } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { _ } from "../utils";

export class ColumnGroup implements ColumnGroupChild {

    public static HEADER_GROUP_SHOW_OPEN = 'open';
    public static HEADER_GROUP_SHOW_CLOSED = 'closed';
    public static HEADER_GROUP_PADDING = 'padding';

    public static EVENT_LEFT_CHANGED = 'leftChanged';
    public static EVENT_DISPLAYED_CHILDREN_CHANGED = 'displayedChildrenChanged';

    // this is static, a it is used outside of this class
    public static createUniqueId(groupId: string, instanceId: number): string {
        return groupId + '_' + instanceId;
    }

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    // all the children of this group, regardless of whether they are opened or closed
    private children: ColumnGroupChild[];
    // depends on the open/closed state of the group, only displaying columns are stored here
    private displayedChildren: ColumnGroupChild[] = [];

    private readonly groupId: string;
    private readonly instanceId: number;
    private readonly originalColumnGroup: OriginalColumnGroup;
    private readonly pinned: string;

    // private moving = false
    private left: number;
    private oldLeft: number;
    private localEventService: EventService = new EventService();

    private parent: ColumnGroup;

    constructor(originalColumnGroup: OriginalColumnGroup, groupId: string, instanceId: number, pinned: string) {
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.originalColumnGroup = originalColumnGroup;
        this.pinned = pinned;
    }

    // as the user is adding and removing columns, the groups are recalculated.
    // this reset clears out all children, ready for children to be added again
    public reset(): void {
        this.parent = null;
        this.children = null;
        this.displayedChildren = null;
    }

    public getParent(): ColumnGroup {
        return this.parent;
    }

    public setParent(parent: ColumnGroup): void {
        this.parent = parent;
    }

    public getUniqueId(): string {
        return ColumnGroup.createUniqueId(this.groupId, this.instanceId);
    }

    public isEmptyGroup(): boolean {
        return this.displayedChildren.length === 0;
    }

    public isMoving(): boolean {
        const allLeafColumns = this.getOriginalColumnGroup().getLeafColumns();
        if (!allLeafColumns || allLeafColumns.length === 0) { return false; }

        let allMoving = true;
        allLeafColumns.forEach(col => {
            if (!col.isMoving()) {
                allMoving = false;
            }
        });
        return allMoving;
    }

    public checkLeft(): void {
        // first get all children to setLeft, as it impacts our decision below
        this.displayedChildren.forEach((child: ColumnGroupChild) => {
            if (child instanceof ColumnGroup) {
                (child as ColumnGroup).checkLeft();
            }
        });

        // set our left based on first displayed column
        if (this.displayedChildren.length > 0) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                const lastChild = _.last(this.displayedChildren);
                const lastChildLeft = lastChild.getLeft();
                this.setLeft(lastChildLeft);
            } else {
                const firstChildLeft = this.displayedChildren[0].getLeft();
                this.setLeft(firstChildLeft);
            }
        } else {
            // this should never happen, as if we have no displayed columns, then
            // this groups should not even exist.
            this.setLeft(null);
        }
    }

    public getLeft(): number {
        return this.left;
    }

    public getOldLeft(): number {
        return this.oldLeft;
    }

    public setLeft(left: number) {
        this.oldLeft = left;
        if (this.left !== left) {
            this.left = left;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_LEFT_CHANGED));
        }
    }

    public getPinned(): string {
        return this.pinned;
    }

    private createAgEvent(type: string): AgEvent {
        return {
            type: type,
        };
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.localEventService.removeEventListener(eventType, listener);
    }

    public getGroupId(): string {
        return this.groupId;
    }

    public getInstanceId(): number {
        return this.instanceId;
    }

    public isChildInThisGroupDeepSearch(wantedChild: ColumnGroupChild): boolean {
        let result = false;

        this.children.forEach((foundChild: ColumnGroupChild) => {
            if (wantedChild === foundChild) {
                result = true;
            }
            if (foundChild instanceof ColumnGroup) {
                if ((foundChild as ColumnGroup).isChildInThisGroupDeepSearch(wantedChild)) {
                    result = true;
                }
            }
        });

        return result;
    }

    public getActualWidth(): number {
        let groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach((child: ColumnGroupChild) => {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    }

    public isResizable(): boolean {
        if (!this.displayedChildren) { return false; }

        // if at least one child is resizable, then the group is resizable
        let result = false;
        this.displayedChildren.forEach((child: ColumnGroupChild) => {
            if (child.isResizable()) {
                result = true;
            }
        });

        return result;
    }

    public getMinWidth(): number {
        let result = 0;
        this.displayedChildren.forEach((groupChild: ColumnGroupChild) => {
            result += groupChild.getMinWidth();
        });
        return result;
    }

    public addChild(child: ColumnGroupChild): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    public getDisplayedChildren(): ColumnGroupChild[] {
        return this.displayedChildren;
    }

    public getLeafColumns(): Column[] {
        const result: Column[] = [];
        this.addLeafColumns(result);
        return result;
    }

    public getDisplayedLeafColumns(): Column[] {
        const result: Column[] = [];
        this.addDisplayedLeafColumns(result);
        return result;
    }

    // why two methods here doing the same thing?
    public getDefinition(): AbstractColDef {
        return this.originalColumnGroup.getColGroupDef();
    }

    public getColGroupDef(): ColGroupDef {
        return this.originalColumnGroup.getColGroupDef();
    }

    public isPadding(): boolean {
        return this.originalColumnGroup.isPadding();
    }

    public isExpandable(): boolean {
        return this.originalColumnGroup.isExpandable();
    }

    public isExpanded(): boolean {
        return this.originalColumnGroup.isExpanded();
    }

    public setExpanded(expanded: boolean): void {
        this.originalColumnGroup.setExpanded(expanded);
    }

    private addDisplayedLeafColumns(leafColumns: Column[]): void {
        this.displayedChildren.forEach((child: ColumnGroupChild) => {
            if (child instanceof Column) {
                leafColumns.push(child as Column);
            } else if (child instanceof ColumnGroup) {
                (child as ColumnGroup).addDisplayedLeafColumns(leafColumns);
            }
        });
    }

    private addLeafColumns(leafColumns: Column[]): void {
        this.children.forEach((child: ColumnGroupChild) => {
            if (child instanceof Column) {
                leafColumns.push(child as Column);
            } else if (child instanceof ColumnGroup) {
                (child as ColumnGroup).addLeafColumns(leafColumns);
            }
        });
    }

    public getChildren(): ColumnGroupChild[] {
        return this.children;
    }

    public getColumnGroupShow(): string | undefined {
        return this.originalColumnGroup.getColumnGroupShow();
    }

    public getOriginalColumnGroup(): OriginalColumnGroup {
        return this.originalColumnGroup;
    }

    public calculateDisplayedColumns() {
        // clear out last time we calculated
        this.displayedChildren = [];
        let topLevelGroup: ColumnGroup = this;

        // find the column group that is controlling expandable. this is relevant when we have padding (empty)
        // groups, where the expandable is actually the first parent that is not a padding group.
        if (this.isPadding()) {
            while (topLevelGroup.getParent() && topLevelGroup.isPadding()) {
                topLevelGroup = topLevelGroup.getParent();
            }
        }

        const isExpandable = topLevelGroup.originalColumnGroup.isExpandable();
        // it not expandable, everything is visible
        if (!isExpandable) {
            this.displayedChildren = this.children;
        } else {
            // Add cols based on columnGroupShow

            // Note - the below also adds padding groups, these are always added because they never have
            // colDef.columnGroupShow set.
            this.children.forEach(abstractColumn => {
                const headerGroupShow = abstractColumn.getColumnGroupShow();
                switch (headerGroupShow) {
                    case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
                        // when set to open, only show col if group is open
                        if (topLevelGroup.originalColumnGroup.isExpanded()) {
                            this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
                        // when set to open, only show col if group is open
                        if (!topLevelGroup.originalColumnGroup.isExpanded()) {
                            this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    default:
                        // default is always show the column
                        this.displayedChildren.push(abstractColumn);
                        break;
                }
            });
        }

        this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
    }
}
