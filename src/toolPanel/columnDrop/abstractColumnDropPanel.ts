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
    Column
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

    constructor(horizontal: boolean, valueColumn: boolean) {
        super(`<div class="ag-column-drop ag-font-style ag-column-drop-${horizontal?'horizontal':'vertical'}"></div>`);
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
            onDragStop: this.onDragStop.bind(this)
        };
        this.beans.dragAndDropService.addDropTarget(this.dropTarget);
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

        var changed = newIndex!==this.insertIndex;
        if (changed) {
            this.insertIndex = newIndex;
        }
        return changed;
    }

    private getNewHorizontalInsertIndex(draggingEvent: DraggingEvent): number {

        if (Utils.missing(draggingEvent.hDirection)) { return -1; }

        let newIndex = 0;
        let mouseEvent = draggingEvent.event;

        this.childColumnComponents.forEach( childColumn => {
            let rect = childColumn.getGui().getBoundingClientRect();
            if (draggingEvent.hDirection===HDirection.Left) {
                let horizontalFit = mouseEvent.clientX >= rect.right;
                if (horizontalFit) {
                    newIndex++;
                }
            } else {
                let horizontalFit = mouseEvent.clientX >= rect.left;
                if (horizontalFit) {
                    newIndex++;
                }
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

    private onDragging(draggingEvent: DraggingEvent): void {
        var positionChanged = this.checkInsertIndex(draggingEvent);
        if (positionChanged) {
            this.refreshGui();
        }
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {

        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.dragItem;

        // take out columns that are not groupable
        var goodDragColumns = Utils.filter(dragColumns, this.isColumnDroppable.bind(this) );

        var weHaveColumnsToDrag = goodDragColumns.length > 0;
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

        var thisPanelStartedTheDrag = draggingEvent.dragSource.dragSourceDropTarget === this.dropTarget;
        if (thisPanelStartedTheDrag) {
            var columns = draggingEvent.dragSource.dragItem;
            this.removeColumns(columns);
        }

        if (this.potentialDndColumns) {
            this.potentialDndColumns = null;
            this.refreshGui();
        }
    }

    private onDragStop(): void {
        if (this.potentialDndColumns) {
            this.addColumns(this.potentialDndColumns);
            this.potentialDndColumns = null;
            this.refreshGui();
        }
    }

    protected removeColumns(columnsToRemove: Column[]): void {
        var newColumnList = this.getExistingColumns().slice();
        columnsToRemove.forEach( column => Utils.removeFromArray(newColumnList, column) );
        this.updateColumns(newColumnList);
    }

    protected addColumns(columnsToAdd: Column[]): void {
        var newColumnList = this.getExistingColumns().slice();
        var columnsToAddReverse = columnsToAdd.slice().reverse();
        columnsToAddReverse.forEach( column => Utils.insertIntoArray(newColumnList, column, this.insertIndex) );
        this.updateColumns(newColumnList);
    }

    public refreshGui(): void {
        this.destroyGui();

        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
    }

    private addColumnsToGui(): void {
        var existingColumns = this.getExistingColumns();

        var itemsToAddToGui: ColumnComponent[] = [];

        var addingGhosts = Utils.exists(this.potentialDndColumns);

        existingColumns.forEach( (column: Column, index: number) => {
            if (addingGhosts && index >= this.insertIndex) { return; }
            let columnComponent = this.createColumnComponent(column, false);
            itemsToAddToGui.push(columnComponent);
        });

        if (this.potentialDndColumns) {
            this.potentialDndColumns.forEach( (column) => {
                let columnComponent = this.createColumnComponent(column, true);
                itemsToAddToGui.push(columnComponent);
            } );

            existingColumns.forEach( (column: Column, index: number) => {
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
        var columnComponent = new ColumnComponent(column, this.dropTarget, ghost, this.valueColumn);
        columnComponent.addEventListener(ColumnComponent.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.wireBean(columnComponent);
        this.guiDestroyFunctions.push( ()=> columnComponent.destroy() );

        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }

        return columnComponent;
    }

    private addIconAndTitleToGui(): void {
        var iconFaded = this.horizontal && this.isExistingColumnsEmpty();

        var eGroupIcon = this.params.icon;
        
        Utils.addCssClass(eGroupIcon, 'ag-column-drop-icon');
        Utils.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);
        this.getGui().appendChild(eGroupIcon);

        if (!this.horizontal) {
            var eTitle = document.createElement('span');
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
        var showEmptyMessage = this.isExistingColumnsEmpty() && !this.potentialDndColumns;
        if (!showEmptyMessage) { return; }

        var eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        Utils.addCssClass(eMessage, 'ag-column-drop-empty-message');
        this.getGui().appendChild(eMessage);
    }

    private addArrowToGui(): void {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            var eArrow = document.createElement('span');
            eArrow.innerHTML = '&#8594;';
            this.getGui().appendChild(eArrow);
        }
    }
}
