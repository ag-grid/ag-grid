import {
    Column,
    Component,
    Context,
    DragAndDropService,
    DraggingEvent,
    DragSourceType,
    DropTarget,
    Events,
    EventService,
    GridOptionsWrapper,
    HorizontalDirection,
    LoggerFactory,
    VerticalDirection,
    _
} from "@ag-grid-community/core";
import { DropZoneColumnComp } from "./dropZoneColumnComp";

export interface BaseDropZonePanelParams {
    dragAndDropIcon: string;
    emptyMessage: string;
    title: string;
    icon: HTMLElement;
}

export interface BaseDropZonePanelBeans {
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
}

export abstract class BaseDropZonePanel extends Component {

    private static STATE_NOT_DRAGGING = 'notDragging';
    private static STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    private static STATE_REARRANGE_COLUMNS = 'rearrangeColumns';

    private state = BaseDropZonePanel.STATE_NOT_DRAGGING;

    private dropTarget: DropTarget;

    // when we are considering a drop from a dnd event,
    // the columns to be dropped go in here
    private potentialDndColumns: Column[];

    private guiDestroyFunctions: (() => void)[] = [];

    private params: BaseDropZonePanelParams;
    private beans: BaseDropZonePanelBeans;

    private childColumnComponents: DropZoneColumnComp[] = [];
    private insertIndex: number;

    // when this component is refreshed, we rip out all DOM elements and build it up
    // again from scratch. one exception is eColumnDropList, as we want to maintain the
    // scroll position between the refreshes, so we create one instance of it here and
    // reuse it.
    private eColumnDropList: HTMLElement;

    protected abstract isColumnDroppable(column: Column): boolean;

    protected abstract updateColumns(columns: Column[]): void;

    protected abstract getExistingColumns(): Column[];

    protected abstract getIconName(): string;

    constructor(private horizontal: boolean, private valueColumn: boolean) {
        super(`<div class="ag-unselectable"></div>`);
        this.addElementClasses(this.getGui());
        this.eColumnDropList = document.createElement('div');
        this.addElementClasses(this.eColumnDropList, 'list');
    }

    public isHorizontal(): boolean {
        return this.horizontal;
    }

    public setBeans(beans: BaseDropZonePanelBeans): void {
        this.beans = beans;
    }

    protected destroy(): void {
        this.destroyGui();
        super.destroy();
    }

    private destroyGui(): void {
        this.guiDestroyFunctions.forEach(func => func());
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        _.clearElement(this.getGui());
        _.clearElement(this.eColumnDropList);
    }

    public init(params: BaseDropZonePanelParams): void {
        this.params = params;

        this.addDestroyableEventListener(this.beans.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshGui.bind(this));

        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'functionsReadOnly', this.refreshGui.bind(this));

        this.setupDropTarget();
        // we don't know if this bean will be initialised before columnController.
        // if columnController first, then below will work
        // if columnController second, then below will put blank in, and then above event gets first when columnController is set up
        this.refreshGui();
    }

    private addElementClasses(el: HTMLElement, suffix?: string) {
        suffix = suffix ? `-${suffix}` : '';
        _.addCssClass(el, `ag-column-drop${suffix}`);
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        _.addCssClass(el, `ag-column-drop-${direction}${suffix}`);
    }

    private setupDropTarget(): void {
        this.dropTarget = {
            getContainer: this.getGui.bind(this),
            getIconName: this.getIconName.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this),
            isInterestedIn: this.isInterestedIn.bind(this)
        };

        this.beans.dragAndDropService.addDropTarget(this.dropTarget);
    }

    private isInterestedIn(type: DragSourceType): boolean {
        // not interested in row drags
        return type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel;
    }

    private checkInsertIndex(draggingEvent: DraggingEvent): boolean {
        const newIndex = this.horizontal ? this.getNewHorizontalInsertIndex(draggingEvent) : this.getNewVerticalInsertIndex(draggingEvent);

        // <0 happens when drag is no a direction we are interested in, eg drag is up/down but in horizontal panel
        if (newIndex < 0) {
            return false;
        }

        const changed = newIndex !== this.insertIndex;

        if (changed) {
            this.insertIndex = newIndex;
        }

        return changed;
    }

    private getNewHorizontalInsertIndex(draggingEvent: DraggingEvent): number {
        if (_.missing(draggingEvent.hDirection)) {
            return -1;
        }

        let newIndex = 0;
        const mouseEvent = draggingEvent.event;
        const enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
        const goingLeft = draggingEvent.hDirection === HorizontalDirection.Left;
        const mouseX = mouseEvent.clientX;

        this.childColumnComponents.forEach(childColumn => {
            const rect = childColumn.getGui().getBoundingClientRect();
            const rectX = goingLeft ? rect.right : rect.left;
            const horizontalFit = enableRtl ? mouseX <= rectX : mouseX >= rectX;

            if (horizontalFit) {
                newIndex++;
            }
        });

        return newIndex;
    }

    private getNewVerticalInsertIndex(draggingEvent: DraggingEvent): number {
        if (_.missing(draggingEvent.vDirection)) {
            return -1;
        }

        let newIndex = 0;
        const mouseEvent = draggingEvent.event;

        this.childColumnComponents.forEach(childColumn => {
            const rect = childColumn.getGui().getBoundingClientRect();
            const verticalFit = mouseEvent.clientY >= (draggingEvent.vDirection === VerticalDirection.Down ? rect.top : rect.bottom);

            if (verticalFit) {
                newIndex++;
            }
        });

        return newIndex;
    }

    private checkDragStartedBySelf(draggingEvent: DraggingEvent): void {
        if (this.state !== BaseDropZonePanel.STATE_NOT_DRAGGING) {
            return;
        }

        this.state = BaseDropZonePanel.STATE_REARRANGE_COLUMNS;

        this.potentialDndColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.refreshGui();

        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    }

    private onDragging(draggingEvent: DraggingEvent): void {
        this.checkDragStartedBySelf(draggingEvent);

        if (this.checkInsertIndex(draggingEvent)) {
            this.refreshGui();
        }
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {
        // this will contain all columns that are potential drops
        const dragColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.state = BaseDropZonePanel.STATE_NEW_COLUMNS_IN;

        // take out columns that are not droppable
        const goodDragColumns = dragColumns.filter(this.isColumnDroppable.bind(this));

        if (goodDragColumns.length > 0) {
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    }

    protected isPotentialDndColumns(): boolean {
        return _.existsAndNotEmpty(this.potentialDndColumns);
    }

    private onDragLeave(draggingEvent: DraggingEvent): void {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'

        if (this.state === BaseDropZonePanel.STATE_REARRANGE_COLUMNS) {
            const columns = draggingEvent.dragSource.getDragItem().columns || [];
            this.removeColumns(columns);
        }

        if (this.isPotentialDndColumns()) {
            this.potentialDndColumns = [];
            this.refreshGui();
        }

        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    }

    private onDragStop(): void {
        if (this.isPotentialDndColumns()) {
            let success = false;

            if (this.state === BaseDropZonePanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            } else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }

            this.potentialDndColumns = [];

            // If the function is passive, then we don't refresh, as we assume the client application
            // is going to call setRowGroups / setPivots / setValues at a later point which will then
            // cause a refresh. This gives a nice GUI where the ghost stays until the app has caught
            // up with the changes. However, if there was no change in the order, then we do need to
            // refresh to reset the columns
            if (!this.beans.gridOptionsWrapper.isFunctionsPassive() || !success) {
                this.refreshGui();
            }
        }

        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    }

    private removeColumns(columnsToRemove: Column[]): void {
        const newColumnList = this.getExistingColumns().filter(col => !_.includes(columnsToRemove, col));
        this.updateColumns(newColumnList);
    }

    private addColumns(columnsToAdd: Column[]): void {
        const newColumnList = this.getExistingColumns().slice();
        _.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        this.updateColumns(newColumnList);
    }

    private rearrangeColumns(columnsToAdd: Column[]): boolean {
        const newColumnList = this.getNonGhostColumns().slice();
        _.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);

        if (_.areEqual(newColumnList, this.getExistingColumns())) {
            return false;
        } else {
            this.updateColumns(newColumnList);
            return true;
        }
    }

    public refreshGui(): void {
        // we reset the scroll position after the refresh.
        // if we don't do this, then the list will always scroll to the top
        // each time we refresh it. this is because part of the refresh empties
        // out the list which sets scroll to zero. so the user could be just
        // reordering the list - we want to prevent the resetting of the scroll.
        // this is relevant for vertical display only (as horizontal has no scroll)
        const scrollTop = this.eColumnDropList.scrollTop;

        this.destroyGui();

        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();

        if (!this.isHorizontal()) {
            this.eColumnDropList.scrollTop = scrollTop;
        }
    }

    private getNonGhostColumns(): Column[] {
        const existingColumns = this.getExistingColumns();

        if (this.isPotentialDndColumns()) {
            return existingColumns.filter(column => !_.includes(this.potentialDndColumns, column));
        } else {
            return existingColumns;
        }
    }

    private addColumnsToGui(): void {
        const nonGhostColumns = this.getNonGhostColumns();
        const addingGhosts = this.isPotentialDndColumns();
        const itemsToAddToGui: DropZoneColumnComp[] = [];

        nonGhostColumns.forEach((column, index) => {
            if (addingGhosts && index >= this.insertIndex) {
                return;
            }

            const columnComponent = this.createColumnComponent(column, false);

            itemsToAddToGui.push(columnComponent);
        });

        if (this.isPotentialDndColumns()) {
            this.potentialDndColumns.forEach(column => {
                const columnComponent = this.createColumnComponent(column, true);
                itemsToAddToGui.push(columnComponent);
            });

            nonGhostColumns.forEach((column, index) => {
                if (index < this.insertIndex) {
                    return;
                }

                const columnComponent = this.createColumnComponent(column, false);

                itemsToAddToGui.push(columnComponent);
            });
        }

        this.getGui().appendChild(this.eColumnDropList);

        itemsToAddToGui.forEach((columnComponent, index) => {
            if (index > 0) {
                this.addArrow(this.eColumnDropList);
            }

            this.eColumnDropList.appendChild(columnComponent.getGui());
        });

    }

    private createColumnComponent(column: Column, ghost: boolean): DropZoneColumnComp {
        const columnComponent = new DropZoneColumnComp(column, this.dropTarget, ghost, this.valueColumn, this.horizontal);
        columnComponent.addEventListener(DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));

        this.beans.context.createBean(columnComponent);
        this.guiDestroyFunctions.push(() => this.destroyBean(columnComponent));

        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }

        return columnComponent;
    }

    private addIconAndTitleToGui(): void {
        const eGroupIcon = this.params.icon;
        const eTitleBar = document.createElement('div');
        this.addElementClasses(eTitleBar, 'title-bar');
        this.addElementClasses(eGroupIcon, 'icon');
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-drop-empty', this.isExistingColumnsEmpty());

        eTitleBar.appendChild(eGroupIcon);

        if (!this.horizontal) {
            const eTitle = document.createElement('span');
            this.addElementClasses(eTitle, 'title');
            eTitle.innerHTML = this.params.title;

            eTitleBar.appendChild(eTitle);
        }

        this.getGui().appendChild(eTitleBar);
    }

    private isExistingColumnsEmpty(): boolean {
        return this.getExistingColumns().length === 0;
    }

    private addEmptyMessageToGui(): void {
        if (!this.isExistingColumnsEmpty() || this.isPotentialDndColumns()) {
            return;
        }

        const eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        this.addElementClasses(eMessage, 'empty-message');
        this.eColumnDropList.appendChild(eMessage);
    }

    private addArrow(eParent: HTMLElement): void {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            const enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
            const icon = _.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsWrapper);
            this.addElementClasses(icon, 'cell-separator');
            eParent.appendChild(icon);
        }
    }
}
