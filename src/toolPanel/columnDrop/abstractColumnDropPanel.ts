import {
    Utils,
    HDirection,
    VDirection,
    Component,
    EventService,
    GridOptionsWrapper,
    Context,
    LoggerFactory,
    DragAndDropService,
    Logger,
    DropTarget,
    Events,
    DraggingEvent,
    Column,
    DragSourceType
} from "ag-grid/main";
import {ColumnComponent} from "./columnComponent";

export interface AbstractColumnDropPanelParams {
    dragAndDropIcon:string;
    emptyMessage:string;
    title: string;
    icon: HTMLElement;
}

export interface AbstractColumnDropPanelBeans {
    gridOptionsWrapper: GridOptionsWrapper;
    eventService: EventService;
    context: Context;
    loggerFactory: LoggerFactory;
    dragAndDropService: DragAndDropService;
}

export abstract class AbstractColumnDropPanel extends Component {

    private static STATE_NOT_DRAGGING = 'notDragging';
    private static STATE_NEW_COLUMNS_IN = 'newColumnsIn';
    private static STATE_REARRANGE_COLUMNS = 'rearrangeColumns';

    private static CHAR_LEFT_ARROW = '&#8592;';
    private static CHAR_RIGHT_ARROW = '&#8594;';

    private state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;

    private logger: Logger;
    private dropTarget: DropTarget;

    // when we are considering a drop from a dnd event,
    // the columns to be dropped go in here
    private potentialDndColumns: Column[];

    private guiDestroyFunctions: (()=>void)[] = [];

    private params: AbstractColumnDropPanelParams;
    private beans: AbstractColumnDropPanelBeans;

    private childColumnComponents: ColumnComponent[] = [];
    private insertIndex: number;

    private horizontal: boolean;
    private valueColumn: boolean;

    protected abstract isColumnDroppable(column: Column): boolean;
    protected abstract updateColumns(columns: Column[]): void;
    protected abstract getExistingColumns(): Column[];
    protected abstract getIconName(): string;

    constructor(horizontal: boolean, valueColumn: boolean, name: string) {
        super(`<div class="ag-column-drop ag-font-style ag-column-drop-${horizontal?'horizontal':'vertical'} ag-column-drop-${name}"></div>`);
        this.horizontal = horizontal;
        this.valueColumn = valueColumn;
    }

    public isHorizontal(): boolean {
        return this.horizontal;
    }

    public setBeans(beans: AbstractColumnDropPanelBeans): void {
        this.beans = beans;
    }

    public destroy(): void {
        this.destroyGui();
        super.destroy();
    }

    private destroyGui(): void {
        this.guiDestroyFunctions.forEach( (func) => func() );
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        Utils.removeAllChildren(this.getGui());
    }

    public init(params: AbstractColumnDropPanelParams): void {
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
        if (newIndex<0) {
            return false;
        }

        let changed = newIndex!==this.insertIndex;
        if (changed) {
            this.insertIndex = newIndex;
        }
        return changed;
    }

    private getNewHorizontalInsertIndex(draggingEvent: DraggingEvent): number {

        if (Utils.missing(draggingEvent.hDirection)) { return -1; }

        let newIndex = 0;
        let mouseEvent = draggingEvent.event;

        let enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
        let goingLeft = draggingEvent.hDirection===HDirection.Left;
        let mouseX = mouseEvent.clientX;

        this.childColumnComponents.forEach( childColumn => {
            let rect = childColumn.getGui().getBoundingClientRect();
            let rectX = goingLeft ? rect.right : rect.left;
            let horizontalFit = enableRtl ? (mouseX <= rectX) : (mouseX >= rectX);
            if (horizontalFit) {
                newIndex++;
            }
        });

        return newIndex;
    }

    private getNewVerticalInsertIndex(draggingEvent: DraggingEvent): number {

        if (Utils.missing(draggingEvent.vDirection)) { return -1; }

        let newIndex = 0;
        let mouseEvent = draggingEvent.event;

        this.childColumnComponents.forEach( childColumn => {
            let rect = childColumn.getGui().getBoundingClientRect();
            if (draggingEvent.vDirection===VDirection.Down) {
                let verticalFit = mouseEvent.clientY >= rect.top;
                if (verticalFit) {
                    newIndex++;
                }
            } else {
                let verticalFit = mouseEvent.clientY >= rect.bottom;
                if (verticalFit) {
                    newIndex++;
                }
            }
        });

        return newIndex;
    }

    private checkDragStartedBySelf(draggingEvent: DraggingEvent): void {
        if (this.state!==AbstractColumnDropPanel.STATE_NOT_DRAGGING) { return; }

        this.state = AbstractColumnDropPanel.STATE_REARRANGE_COLUMNS;

        this.potentialDndColumns = draggingEvent.dragSource.dragItemCallback().columns;
        this.refreshGui();

        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    }

    private onDragging(draggingEvent: DraggingEvent): void {
        this.checkDragStartedBySelf(draggingEvent);

        let positionChanged = this.checkInsertIndex(draggingEvent);
        if (positionChanged) {
            this.refreshGui();
        }
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {

        // this will contain all columns that are potential drops
        let dragColumns: Column[] = draggingEvent.dragSource.dragItemCallback().columns;
        this.state = AbstractColumnDropPanel.STATE_NEW_COLUMNS_IN;

        // take out columns that are not groupable
        let goodDragColumns = Utils.filter(dragColumns, this.isColumnDroppable.bind(this) );

        let weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    }

    protected isPotentialDndColumns(): boolean {
        return Utils.existsAndNotEmpty(this.potentialDndColumns);
    }
    
    private onDragLeave(draggingEvent: DraggingEvent): void {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'

        if (this.state===AbstractColumnDropPanel.STATE_REARRANGE_COLUMNS) {
            let columns = draggingEvent.dragSource.dragItemCallback().columns;
            this.removeColumns(columns);
        }

        if (this.potentialDndColumns) {
            this.potentialDndColumns = null;
            this.refreshGui();
        }

        this.state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;
    }

    private onDragStop(): void {
        if (this.potentialDndColumns) {
            let success: boolean;
            if (this.state === AbstractColumnDropPanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            } else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = null;
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

        this.state = AbstractColumnDropPanel.STATE_NOT_DRAGGING;
    }

    private removeColumns(columnsToRemove: Column[]): void {
        let newColumnList = this.getExistingColumns().slice();
        columnsToRemove.forEach( column => Utils.removeFromArray(newColumnList, column) );
        this.updateColumns(newColumnList);
    }

    private addColumns(columnsToAdd: Column[]): void {
        let newColumnList = this.getExistingColumns().slice();
        Utils.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        this.updateColumns(newColumnList);
    }

    private rearrangeColumns(columnsToAdd: Column[]): boolean {
        let newColumnList = this.getNonGhostColumns().slice();
        Utils.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        let noChangeDetected = Utils.shallowCompare(newColumnList, this.getExistingColumns());
        if (noChangeDetected) {
            return false;
        } else {
            this.updateColumns(newColumnList);
            return true;
        }
    }

    public refreshGui(): void {
        this.destroyGui();

        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
    }

    private getNonGhostColumns(): Column[] {
        let existingColumns = this.getExistingColumns();
        let nonGhostColumns: Column[];
        if (Utils.exists(this.potentialDndColumns)) {
            nonGhostColumns = Utils.filter(existingColumns, column => this.potentialDndColumns.indexOf(column) < 0 );
        } else {
            nonGhostColumns = existingColumns;
        }
        return nonGhostColumns;
    }

    private addColumnsToGui(): void {
        let nonGhostColumns = this.getNonGhostColumns();

        let itemsToAddToGui: ColumnComponent[] = [];

        let addingGhosts = Utils.exists(this.potentialDndColumns);

        nonGhostColumns.forEach( (column: Column, index: number) => {
            if (addingGhosts && index >= this.insertIndex) { return; }
            let columnComponent = this.createColumnComponent(column, false);
            itemsToAddToGui.push(columnComponent);
        });

        if (this.potentialDndColumns) {
            this.potentialDndColumns.forEach( (column) => {
                let columnComponent = this.createColumnComponent(column, true);
                itemsToAddToGui.push(columnComponent);
            } );

            nonGhostColumns.forEach( (column: Column, index: number) => {
                if (index < this.insertIndex) { return; }
                let columnComponent = this.createColumnComponent(column, false);
                itemsToAddToGui.push(columnComponent);
            });
        }

        itemsToAddToGui.forEach( (columnComponent: ColumnComponent, index: number) => {
            let needSeparator = index!==0;
            if (needSeparator) {
                this.addArrowToGui();
            }
            this.getGui().appendChild(columnComponent.getGui());
        });

    }

    private createColumnComponent(column: Column, ghost: boolean): ColumnComponent {
        let columnComponent = new ColumnComponent(column, this.dropTarget, ghost, this.valueColumn);
        columnComponent.addEventListener(ColumnComponent.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.wireBean(columnComponent);
        this.guiDestroyFunctions.push( ()=> columnComponent.destroy() );

        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }

        return columnComponent;
    }

    private addIconAndTitleToGui(): void {
        let iconFaded = this.horizontal && this.isExistingColumnsEmpty();

        let eGroupIcon = this.params.icon;
        
        Utils.addCssClass(eGroupIcon, 'ag-column-drop-icon');
        Utils.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);
        this.getGui().appendChild(eGroupIcon);

        if (!this.horizontal) {
            let eTitle = document.createElement('span');
            eTitle.innerHTML = this.params.title;
            Utils.addCssClass(eTitle, 'ag-column-drop-title');
            Utils.addOrRemoveCssClass(eTitle, 'ag-faded', iconFaded);
            this.getGui().appendChild(eTitle);
        }

    }

    private isExistingColumnsEmpty(): boolean {
        return this.getExistingColumns().length === 0;
    }

    private addEmptyMessageToGui(): void {
        let showEmptyMessage = this.isExistingColumnsEmpty() && !this.potentialDndColumns;
        if (!showEmptyMessage) { return; }

        let eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        Utils.addCssClass(eMessage, 'ag-column-drop-empty-message');
        this.getGui().appendChild(eMessage);
    }

    private addArrowToGui(): void {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            let enableRtl = this.beans.gridOptionsWrapper.isEnableRtl();
            let charCode = enableRtl ?
                AbstractColumnDropPanel.CHAR_LEFT_ARROW : AbstractColumnDropPanel.CHAR_RIGHT_ARROW;
            let spanClass = enableRtl ? 'ag-left-arrow' : 'ag-right-arrow';
            let eArrow = document.createElement('span');

            eArrow.className = spanClass;
            eArrow.innerHTML = charCode;
            this.getGui().appendChild(eArrow);
        }
    }
}
