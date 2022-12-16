import { IHeaderColumn } from "../interfaces/iHeaderColumn";
import { ColGroupDef } from "./colDef";
import { Column, ColumnPinnedType } from "./column";
import { AbstractColDef } from "./colDef";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { EventService } from "../eventService";
import { Autowired } from "../context/context";
import { AgEvent } from "../events";
import { last } from "../utils/array";
import { GridOptionsService } from "../gridOptionsService";
import { logDeprecation } from "../gridOptionsValidator";

export type ColumnGroupShowType = 'open' | 'closed';

export class ColumnGroup implements IHeaderColumn {

    public static EVENT_LEFT_CHANGED = 'leftChanged';
    public static EVENT_DISPLAYED_CHILDREN_CHANGED = 'displayedChildrenChanged';

    // this is static, a it is used outside of this class
    public static createUniqueId(groupId: string, instanceId: number): string {
        return groupId + '_' + instanceId;
    }

    @Autowired('gridOptionsService') gridOptionsService: GridOptionsService;

    // all the children of this group, regardless of whether they are opened or closed
    private children: IHeaderColumn[] | null;
    // depends on the open/closed state of the group, only displaying columns are stored here
    private displayedChildren: IHeaderColumn[] | null = [];

    private readonly groupId: string;
    private readonly instanceId: number;
    private readonly providedColumnGroup: ProvidedColumnGroup;
    private readonly pinned: ColumnPinnedType;

    // private moving = false
    private left: number | null;
    private oldLeft: number | null;
    private localEventService: EventService = new EventService();

    private parent: ColumnGroup | null;

    constructor(providedColumnGroup: ProvidedColumnGroup, groupId: string, instanceId: number, pinned: ColumnPinnedType) {
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.providedColumnGroup = providedColumnGroup;
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
        return this.parent!;
    }

    public setParent(parent: ColumnGroup): void {
        this.parent = parent;
    }

    public getUniqueId(): string {
        return ColumnGroup.createUniqueId(this.groupId, this.instanceId);
    }

    public isEmptyGroup(): boolean {
        return this.displayedChildren!.length === 0;
    }

    public isMoving(): boolean {
        const allLeafColumns = this.getProvidedColumnGroup().getLeafColumns();
        if (!allLeafColumns || allLeafColumns.length === 0) { return false; }

        return allLeafColumns.every(col => col.isMoving());
    }

    public checkLeft(): void {
        // first get all children to setLeft, as it impacts our decision below
        this.displayedChildren!.forEach((child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
                child.checkLeft();
            }
        });

        // set our left based on first displayed column
        if (this.displayedChildren!.length > 0) {
            if (this.gridOptionsService.is('enableRtl')) {
                const lastChild = last(this.displayedChildren!);
                const lastChildLeft = lastChild.getLeft();
                this.setLeft(lastChildLeft);
            } else {
                const firstChildLeft = this.displayedChildren![0].getLeft();
                this.setLeft(firstChildLeft);
            }
        } else {
            // this should never happen, as if we have no displayed columns, then
            // this groups should not even exist.
            this.setLeft(null);
        }
    }

    public getLeft(): number | null {
        return this.left;
    }

    public getOldLeft(): number | null {
        return this.oldLeft;
    }

    public setLeft(left: number | null) {
        this.oldLeft = left;
        if (this.left !== left) {
            this.left = left;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_LEFT_CHANGED));
        }
    }

    public getPinned(): ColumnPinnedType {
        return this.pinned;
    }

    private createAgEvent(type: string): AgEvent {
        return { type };
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

    public isChildInThisGroupDeepSearch(wantedChild: IHeaderColumn): boolean {
        let result = false;

        this.children!.forEach((foundChild: IHeaderColumn) => {
            if (wantedChild === foundChild) {
                result = true;
            }
            if (foundChild instanceof ColumnGroup) {
                if (foundChild.isChildInThisGroupDeepSearch(wantedChild)) {
                    result = true;
                }
            }
        });

        return result;
    }

    public getActualWidth(): number {
        let groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach((child: IHeaderColumn) => {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    }

    public isResizable(): boolean {
        if (!this.displayedChildren) { return false; }

        // if at least one child is resizable, then the group is resizable
        let result = false;
        this.displayedChildren.forEach((child: IHeaderColumn) => {
            if (child.isResizable()) {
                result = true;
            }
        });

        return result;
    }

    public getMinWidth(): number {
        let result = 0;
        this.displayedChildren!.forEach((groupChild: IHeaderColumn) => {
            result += groupChild.getMinWidth() || 0;
        });
        return result;
    }

    public addChild(child: IHeaderColumn): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    public getDisplayedChildren(): IHeaderColumn[] | null {
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

    public getDefinition(): AbstractColDef | null {
        return this.providedColumnGroup.getColGroupDef();
    }

    public getColGroupDef(): ColGroupDef | null {
        return this.providedColumnGroup.getColGroupDef();
    }

    public isPadding(): boolean {
        return this.providedColumnGroup.isPadding();
    }

    public isExpandable(): boolean {
        return this.providedColumnGroup.isExpandable();
    }

    public isExpanded(): boolean {
        return this.providedColumnGroup.isExpanded();
    }

    public setExpanded(expanded: boolean): void {
        this.providedColumnGroup.setExpanded(expanded);
    }

    private addDisplayedLeafColumns(leafColumns: Column[]): void {
        this.displayedChildren!.forEach((child: IHeaderColumn) => {
            if (child instanceof Column) {
                leafColumns.push(child);
            } else if (child instanceof ColumnGroup) {
                child.addDisplayedLeafColumns(leafColumns);
            }
        });
    }

    private addLeafColumns(leafColumns: Column[]): void {
        this.children!.forEach((child: IHeaderColumn) => {
            if (child instanceof Column) {
                leafColumns.push(child);
            } else if (child instanceof ColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    }

    public getChildren(): IHeaderColumn[] | null {
        return this.children;
    }

    public getColumnGroupShow(): ColumnGroupShowType | undefined {
        return this.providedColumnGroup.getColumnGroupShow();
    }

    public getProvidedColumnGroup(): ProvidedColumnGroup {
        return this.providedColumnGroup;
    }

    /** @deprecated v27 getOriginalColumnGroup is deprecated, use getProvidedColumnGroup. */
    public getOriginalColumnGroup(): ProvidedColumnGroup {
        logDeprecation<ColumnGroup>('27', 'getOriginalColumnGroup', 'getProvidedColumnGroup')
        return this.getProvidedColumnGroup();
    }

    public getPaddingLevel(): number {
        const parent = this.getParent();

        if (!this.isPadding() || !parent || !parent.isPadding()) {
            return 0;
        }

        return 1 + parent.getPaddingLevel();
    }

    public calculateDisplayedColumns() {
        // clear out last time we calculated
        this.displayedChildren = [];

        // find the column group that is controlling expandable. this is relevant when we have padding (empty)
        // groups, where the expandable is actually the first parent that is not a padding group.
        let parentWithExpansion: ColumnGroup = this;
        while (parentWithExpansion != null && parentWithExpansion.isPadding()) {
            parentWithExpansion = parentWithExpansion.getParent();
        }

        const isExpandable = parentWithExpansion ? parentWithExpansion.providedColumnGroup.isExpandable() : false;
        // it not expandable, everything is visible
        if (!isExpandable) {
            this.displayedChildren = this.children;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
            return;
        }

        // Add cols based on columnGroupShow
        // Note - the below also adds padding groups, these are always added because they never have
        // colDef.columnGroupShow set.
        this.children!.forEach(child => {
            // never add empty groups
            const emptyGroup = child instanceof ColumnGroup && (!child.displayedChildren || !child.displayedChildren.length);
            if (emptyGroup) { return; }

            const headerGroupShow = child.getColumnGroupShow();
            switch (headerGroupShow) {
                case 'open':
                    // when set to open, only show col if group is open
                    if (parentWithExpansion.providedColumnGroup.isExpanded()) {
                        this.displayedChildren!.push(child);
                    }
                    break;
                case 'closed':
                    // when set to open, only show col if group is open
                    if (!parentWithExpansion.providedColumnGroup.isExpanded()) {
                        this.displayedChildren!.push(child);
                    }
                    break;
                default:
                    this.displayedChildren!.push(child);
                    break;
            }
        });

        this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
    }
}
