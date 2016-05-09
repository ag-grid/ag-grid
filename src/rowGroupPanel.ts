import {
    Utils as _,
    SvgFactory,
    Bean,
    Component,
    Autowired,
    ColumnController,
    EventService,
    Context,
    LoggerFactory,
    DragAndDropService,
    GridOptionsWrapper,
    GridPanel,
    Logger,
    DropTarget,
    PostConstruct,
    Events,
    DraggingEvent,
    Column,
    ColumnGroup,
    DragSource
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

@Bean('rowGroupPanel')
export class RowGroupPanel extends Component {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('context') context: Context;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridPanel') gridPanel: GridPanel;
    @Autowired('eventService') globalEventService: EventService;

    private logger: Logger;
    private dropTarget: DropTarget;

    // when we are considering a drop from a dnd event,
    // the columns to be dropped go in here
    private potentialDndColumns: Column[];

    private guiDestroyFunctions: (()=>void)[] = [];

    constructor() {
        super('<div class="ag-row-group-panel ag-font-style"></div>');
    }

    public destroy(): void {
        this.destroyGui();
        super.destroy();
    }

    private destroyGui(): void {
        this.guiDestroyFunctions.forEach( (func) => func() );
        this.guiDestroyFunctions.length = 0;
        _.removeAllChildren(this.getGui());
    }

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('RowGroupPanel');
        this.globalEventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshGui.bind(this));
        this.globalEventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshGui.bind(this));
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
        this.dragAndDropService.addDropTarget(this.dropTarget);
    }

    private onDragging(): void {
    }

    private isColumnGroupable(column: Column): boolean {
        var columnGroupable = !column.getColDef().suppressRowGroup;
        var columnNotAlreadyGrouped = !this.columnController.isColumnRowGrouped(column);
        return columnGroupable && columnNotAlreadyGrouped;
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {
        // this will contain all columns that are potential drops
        var dragColumns = draggingEvent.dragSource.dragItem;

        // take out columns that are not groupable
        var goodDragColumns = _.filter(dragColumns, this.isColumnGroupable.bind(this) );

        var weHaveColumnsToDrag = goodDragColumns.length > 0;
        if (weHaveColumnsToDrag) {
            this.potentialDndColumns = goodDragColumns;
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_GROUP);
            this.refreshGui();
        } else {
            this.dragAndDropService.setGhostIcon(null);
        }
    }

    private onDragLeave(draggingEvent: DraggingEvent): void {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'

        var rowGroupColumns = this.columnController.getRowGroupColumns();

        var thisPanelStartedTheDrag = draggingEvent.dragSource.dragSourceDropTarget === this.dropTarget;
        if (thisPanelStartedTheDrag) {
            // this panel only allows dragging columns (not column groups) so we are guaranteed
            // the dragItem is a column
            var columns = draggingEvent.dragSource.dragItem;
            columns.forEach( column => {
                var columnIsGrouped = rowGroupColumns.indexOf(column) >= 0;
                if (columnIsGrouped) {
                    this.gridPanel.turnOnAnimationForABit();
                    this.columnController.removeRowGroupColumn(column);
                    this.columnController.setColumnVisible(column, true);
                }
            });
        }

        if (this.potentialDndColumns) {
            this.potentialDndColumns = null;
            this.refreshGui();
        }
    }

    private onDragStop(): void {
        if (this.potentialDndColumns) {
            this.potentialDndColumns.forEach( (column) => {
                this.columnController.addRowGroupColumn(column);
                this.potentialDndColumns = null;
                this.refreshGui();
            });
        }
    }

    private refreshGui(): void {
        this.destroyGui();

        this.addGroupIconToGui();
        this.addEmptyMessageToGui();
        this.addRowGroupColumnsToGui();
        this.addPotentialDragItemsToGui();
    }

    private addPotentialDragItemsToGui(): void {
        var rowGroupColumns = this.columnController.getRowGroupColumns();
        var first = rowGroupColumns.length === 0;

        if (this.potentialDndColumns) {

            this.potentialDndColumns.forEach( (column) => {
                if (!first) {
                    this.addArrowToGui();
                }
                first = false;

                var ghostCell = new RenderedGroupedColumnCell(column, this.dropTarget, true);
                this.context.wireBean(ghostCell);
                this.getGui().appendChild(ghostCell.getGui());
                this.guiDestroyFunctions.push( ()=> ghostCell.destroy() );

            } );

        }
    }

    private addRowGroupColumnsToGui(): void {
        var rowGroupColumns = this.columnController.getRowGroupColumns();
        rowGroupColumns.forEach( (column: Column, index: number) => {
            if (index > 0) {
                this.addArrowToGui();
            }
            var cell = new RenderedGroupedColumnCell(column, this.dropTarget);
            this.context.wireBean(cell);
            this.getGui().appendChild(cell.getGui());
            this.guiDestroyFunctions.push( ()=> cell.destroy() );
        });
    }

    private addGroupIconToGui(): void {
        var rowGroupColumns = this.columnController.getRowGroupColumns();
        var iconFaded = rowGroupColumns.length === 0;
        var eGroupIcon = svgFactory.createGroupIcon();
        _.addCssClass(eGroupIcon, 'ag-row-group-icon');
        _.addOrRemoveCssClass(eGroupIcon, 'ag-faded', iconFaded);
        this.getGui().appendChild(eGroupIcon);
    }

    private addEmptyMessageToGui(): void {
        var rowGroupColumns = this.columnController.getRowGroupColumns();
        var showEmptyMessage = rowGroupColumns.length === 0 && !this.potentialDndColumns;
        if (!showEmptyMessage) { return; }

        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns here to group');
        var eMessage = document.createElement('span');
        eMessage.innerHTML = rowGroupColumnsEmptyMessage;
        _.addCssClass(eMessage, 'ag-row-group-empty-message');
        this.getGui().appendChild(eMessage);
    }

    private addArrowToGui(): void {
        var eArrow = document.createElement('span');
        eArrow.innerHTML = '&#8594;';
        this.getGui().appendChild(eArrow);
    }
}

class RenderedGroupedColumnCell extends Component {

    private static TEMPLATE =
        '<span class="ag-row-group-cell">' +
            '<span id="eText" class="ag-row-group-cell-text"></span>' +
            '<span id="btRemove" class="ag-row-group-cell-button">&#10006;</span>' +
        '</span>';

    @Autowired('dragAndDropService') dragAndDropService: DragAndDropService;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('gridPanel') gridPanel: GridPanel;

    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private ghost: boolean;
    private displayName: string;

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost = false) {
        super(RenderedGroupedColumnCell.TEMPLATE);
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
        btRemove.addEventListener('click', ()=> {
            this.gridPanel.turnOnAnimationForABit();
            this.columnController.removeRowGroupColumn(this.column);
            this.columnController.setColumnVisible(this.column, true);
        });

        if (this.ghost) {
            _.addCssClass(this.getGui(), 'ag-row-group-cell-ghost');
        }
    }
}