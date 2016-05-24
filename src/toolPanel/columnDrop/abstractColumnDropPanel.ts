import {
    Utils,
    SvgFactory,
    Component,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridPanel,
    Logger,
    DropTarget,
    PostConstruct,
    Events,
    DraggingEvent,
    Column,
    DragSource
} from "ag-grid/main";

export interface AbstractColumnDropPanelParams {
    dragAndDropIcon:string;
    emptyMessage:string;
    title: string;
    iconFactory: ()=>HTMLImageElement;
}

export interface AbstractColumnDropPanelBeans {
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

    private horizontal: boolean;

    protected abstract isColumnDroppable(column: Column): boolean;
    protected abstract removeColumns(columns: Column[]): void;
    protected abstract addColumns(columns: Column[]): void;
    protected abstract getExistingColumns(): Column[];

    constructor(horizontal: boolean) {
        super(`<div class="ag-column-drop ag-font-style ag-column-drop-${horizontal?'horizontal':'vertical'}"></div>`);
        this.horizontal = horizontal;
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
        Utils.removeAllChildren(this.getGui());
    }

    public init(params: AbstractColumnDropPanelParams): void {
        this.params = params;

        this.logger = this.beans.loggerFactory.create('AbstractColumnDropPanel');
        this.beans.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshGui.bind(this));
        this.setupDropTarget();
        // we don't know if this bean will be initialised before columnController.
        // if columnController first, then below will work
        // if columnController second, then below will put blank in, and then above event gets first when columnController is set up
        this.refreshGui();
    }

    private setupDropTarget(): void {
        this.dropTarget = {
            eContainer: this.getGui(),
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this)
        };
        this.beans.dragAndDropService.addDropTarget(this.dropTarget);
    }

    private onDragging(): void {
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {
        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.dragItem;

        // take out columns that are not groupable
        var goodDragColumns = Utils.filter(dragColumns, this.isColumnDroppable.bind(this) );

        var weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
            this.potentialDndColumns = goodDragColumns;
            this.beans.dragAndDropService.setGhostIcon(this.params.dragAndDropIcon);
            this.refreshGui();
        } else {
            this.beans.dragAndDropService.setGhostIcon(null);
        }
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

    public refreshGui(): void {
        this.destroyGui();

        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addExistingColumnsToGui();
        this.addPotentialDragItemsToGui();
    }

    private addPotentialDragItemsToGui(): void {
        var first = this.isExistingColumnsEmpty();

        if (this.potentialDndColumns) {

            this.potentialDndColumns.forEach( (column) => {
                if (!first) {
                    this.addArrowToGui();
                }
                first = false;

                var ghostCell = new ColumnComponent(column, this.dropTarget, true);
                ghostCell.addEventListener(ColumnComponent.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
                this.beans.context.wireBean(ghostCell);
                this.getGui().appendChild(ghostCell.getGui());
                this.guiDestroyFunctions.push( ()=> ghostCell.destroy() );

            } );

        }
    }

    private addExistingColumnsToGui(): void {
        var existingColumns = this.getExistingColumns();
        existingColumns.forEach( (column: Column, index: number) => {
            if (index > 0) {
                this.addArrowToGui();
            }
            var cell = new ColumnComponent(column, this.dropTarget, false);
            cell.addEventListener(ColumnComponent.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
            this.beans.context.wireBean(cell);
            this.getGui().appendChild(cell.getGui());
            this.guiDestroyFunctions.push( ()=> cell.destroy() );
        });
    }

    private addIconAndTitleToGui(): void {
        var iconFaded = this.horizontal && this.isExistingColumnsEmpty();

        var eGroupIcon = this.params.iconFactory();
        
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

class ColumnComponent extends Component {

    public static EVENT_COLUMN_REMOVE = 'columnRemove';

    private static TEMPLATE =
        '<span class="ag-column-drop-cell">' +
        '<span id="eText" class="ag-column-drop-cell-text"></span>' +
        '<span id="btRemove" class="ag-column-drop-cell-button">&#10006;</span>' +
        '</span>';

    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('gridPanel') gridPanel: GridPanel;

    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private ghost: boolean;
    private displayName: string;

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost: boolean) {
        super(ColumnComponent.TEMPLATE);
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }

    @PostConstruct
    public init(): void {
        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        this.setupComponents();
        if (!this.ghost) {
            this.addDragSource();
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItem: [this.column],
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private setupComponents(): void {
        var eText = <HTMLElement> this.getGui().querySelector('#eText');
        var btRemove = <HTMLElement> this.getGui().querySelector('#btRemove');

        eText.innerHTML = this.displayName;
        this.addDestroyableEventListener(btRemove, 'click', ()=> this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE));

        if (this.ghost) {
            Utils.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }
    }
}
