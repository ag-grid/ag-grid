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
    HDirection,
    Logger,
    LoggerFactory,
    VDirection,
    _
} from "ag-grid-community/main";
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

    private static CHAR_LEFT_ARROW = '&#8592;';
    private static CHAR_RIGHT_ARROW = '&#8594;';

    private state = BaseDropZonePanel.STATE_NOT_DRAGGING;

    private logger: Logger;
    private dropTarget: DropTarget;

    // when we are considering a drop from a dnd event,
    // the columns to be dropped go in here
    private potentialDndColumns: Column[];

    private guiDestroyFunctions: (() => void)[] = [];

    private params: BaseDropZonePanelParams;
    private beans: BaseDropZonePanelBeans;

    private childColumnComponents: DropZoneColumnComp[] = [];
    private insertIndex: number;

    private horizontal: boolean;
    private valueColumn: boolean;

    // when this component is refreshed, we rip out all DOM elements and build it up
    // again from scratch. one exception is eColumnDropList, as we want to maintain the
    // scroll position between the refreshes, so we create one instance of it here and
    // reuse it.
    private eColumnDropList: HTMLElement;

    protected abstract isColumnDroppable(column: Column): boolean;

    protected abstract updateColumns(columns: Column[]): void;

    protected abstract getExistingColumns(): Column[];

    protected abstract getIconName(): string;

    constructor(horizontal: boolean, valueColumn: boolean, name: string) {
        super(`<div class="ag-column-drop ag-unselectable ag-column-drop-${horizontal ? 'horizontal' : 'vertical'} ag-column-drop-${name}"></div>`);
        this.horizontal = horizontal;
        this.valueColumn = valueColumn;

        this.eColumnDropList = _.loadTemplate('<div class="ag-column-drop-list"></div>');
    }

    public isHorizontal(): boolean {
        return this.horizontal;
    }

    public setBeans(beans: BaseDropZonePanelBeans): void {
        this.beans = beans;
    }

    public destroy(): void {
        this.destroyGui();
        super.destroy();
    }

    private destroyGui(): void {
        this.guiDestroyFunctions.forEach((func) => func());
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        _.clearElement(this.getGui());
        _.clearElement(this.eColumnDropList);
    }

    public init(params: BaseDropZonePanelParams): void {
        this.params = params;

        this.logger = this.beans.loggerFactory.create('AbstractColumnDropPanel');
        this.beans.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshGui.bind(this));

        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'functionsReadOnly', this.refreshGui.bind(this));

        this.setupDropTarget();
        // we don't know if this bean will be initialised before columnController.
        // if columnController first, then below will work
        // if columnController second, then below will put blank in, and then above event gets first when columnController is set up
        this.refreshGui();
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

        let newIndex: number;
        if (this.horizontal) {
            newIndex = this.getNewHorizontalInsertIndex(draggingEvent);
        } else {
            newIndex = this.getNewVerticalInsertIndex(draggingEvent);
        }

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
        const goingLeft = draggingEvent.hDirection === HDirection.Left;
        const mouseX = mouseEvent.clientX;

        this.childColumnComponents.forEach(childColumn => {
            const rect = childColumn.getGui().getBoundingClientRect();
            const rectX = goingLeft ? rect.right : rect.left;
            const horizontalFit = enableRtl ? (mouseX <= rectX) : (mouseX >= rectX);
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
            if (draggingEvent.vDirection === VDirection.Down) {
                const verticalFit = mouseEvent.clientY >= rect.top;
                if (verticalFit) {
                    newIndex++;
                }
            } else {
                const verticalFit = mouseEvent.clientY >= rect.bottom;
                if (verticalFit) {
                    newIndex++;
                }
            }
        });

        return newIndex;
    }

    private checkDragStartedBySelf(draggingEvent: DraggingEvent): void {
        if (this.state !== BaseDropZonePanel.STATE_NOT_DRAGGING) {
            return;
        }

        this.state = BaseDropZonePanel.STATE_REARRANGE_COLUMNS;

        this.potentialDndColumns = draggingEvent.dragSource.dragItemCallback().columns || [];
        this.refreshGui();

        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    }

    private onDragging(draggingEvent: DraggingEvent): void {
        this.checkDragStartedBySelf(draggingEvent);

        const positionChanged = this.checkInsertIndex(draggingEvent);
        if (positionChanged) {
            this.refreshGui();
        }
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {

        // this will contain all columns that are potential drops
        const dragColumns: Column[] = draggingEvent.dragSource.dragItemCallback().columns || [];
        this.state = BaseDropZonePanel.STATE_NEW_COLUMNS_IN;

        // take out columns that are not groupable
        const goodDragColumns = _.filter(dragColumns, this.isColumnDroppable.bind(this));

        const weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
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
            const columns = draggingEvent.dragSource.dragItemCallback().columns || [];
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
            let success: boolean;
            if (this.state === BaseDropZonePanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            } else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = [];
            // if the function is passive, then we don't refresh, as we assume the client application
            // is going to call setRowGroups / setPivots / setValues at a later point which will then
            // cause a refresh. this gives a nice gui where the ghost stays until the app has caught
            // up with the changes.
            if (this.beans.gridOptionsWrapper.isFunctionsPassive()) {
                // when functions are passive, we don't refresh,
                // unless there was no change in the order, then we
                // do need to refresh to reset the columns
                if (!success) {
                    this.refreshGui();
                }
            } else {
                this.refreshGui();
            }
        }

        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    }

    private removeColumns(columnsToRemove: Column[]): void {
        const newColumnList = this.getExistingColumns().slice();
        columnsToRemove.forEach(column => _.removeFromArray(newColumnList, column));
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
        const noChangeDetected = _.shallowCompare(newColumnList, this.getExistingColumns());
        if (noChangeDetected) {
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
        let nonGhostColumns: Column[];
        if (this.isPotentialDndColumns()) {
            nonGhostColumns = _.filter(existingColumns, column => this.potentialDndColumns.indexOf(column) < 0);
        } else {
            nonGhostColumns = existingColumns;
        }
        return nonGhostColumns;
    }

    private addColumnsToGui(): void {
        const nonGhostColumns = this.getNonGhostColumns();

        const itemsToAddToGui: DropZoneColumnComp[] = [];

        const addingGhosts = this.isPotentialDndColumns();

        nonGhostColumns.forEach((column: Column, index: number) => {
            if (addingGhosts && index >= this.insertIndex) {
                return;
            }
            const columnComponent = this.createColumnComponent(column, false);
            itemsToAddToGui.push(columnComponent);
        });

        if (this.isPotentialDndColumns()) {
            this.potentialDndColumns.forEach((column) => {
                const columnComponent = this.createColumnComponent(column, true);
                itemsToAddToGui.push(columnComponent);
            });

            nonGhostColumns.forEach((column: Column, index: number) => {
                if (index < this.insertIndex) {
                    return;
                }
                const columnComponent = this.createColumnComponent(column, false);
                itemsToAddToGui.push(columnComponent);
            });
        }

        this.getGui().appendChild(this.eColumnDropList);

        itemsToAddToGui.forEach((columnComponent: DropZoneColumnComp, index: number) => {
            const needSeparator = index !== 0;
            if (needSeparator) {
                this.addArrow(this.eColumnDropList);
            }
            this.eColumnDropList.appendChild(columnComponent.getGui());
        });

    }

    private createColumnComponent(column: Column, ghost: boolean): DropZoneColumnComp {
        const columnComponent = new DropZoneColumnComp(column, this.dropTarget, ghost, this.valueColumn);
        columnComponent.addEventListener(DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.wireBean(columnComponent);
        this.guiDestroyFunctions.push(() => columnComponent.destroy());

        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }

        return columnComponent;
    }

    private addIconAndTitleToGui(): void {
        const iconFaded = this.horizontal && this.isExistingColumnsEmpty();

        const eGroupIcon = this.params.icon;
        const eContainer = document.createElement('div');

        _.addCssClass(eGroupIcon, 'ag-column-drop-icon');
        _.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);

        eContainer.appendChild(eGroupIcon);

        if (!this.horizontal) {
            const eTitle = document.createElement('span');
            eTitle.innerHTML = this.params.title;
            _.addCssClass(eTitle, 'ag-column-drop-title');
            _.addOrRemoveCssClass(eTitle, 'ag-faded', iconFaded);
            eContainer.appendChild(eTitle);
        }

        this.getGui().appendChild(eContainer);
    }

    private isExistingColumnsEmpty(): boolean {
        return this.getExistingColumns().length === 0;
    }

    private addEmptyMessageToGui(): void {
        const showEmptyMessage = this.isExistingColumnsEmpty() && !this.isPotentialDndColumns();

        if (!showEmptyMessage) {
            return;
        }

        const eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        _.addCssClass(eMessage, 'ag-column-drop-empty-message');
        this.getGui().appendChild(eMessage);
    }

    private addArrow(eParent: HTMLElement): void {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            const enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
            eParent.appendChild(_.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsWrapper));
        }
    }
}
