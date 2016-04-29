import {Utils as _} from "ag-grid/main";
import {SvgFactory} from "ag-grid/main";
import {Bean} from "ag-grid/main";
import {Component} from "ag-grid/main";
import {Autowired} from "ag-grid/main";
import {ColumnController} from "ag-grid/main";
import {EventService} from "ag-grid/main";
import {Context} from "ag-grid/main";
import {LoggerFactory} from "ag-grid/main";
import {DragAndDropService} from "ag-grid/main";
import {GridOptionsWrapper} from "ag-grid/main";
import {GridPanel} from "ag-grid/main";
import {Logger} from "ag-grid/main";
import {DropTarget} from "ag-grid/main";
import {PostConstruct} from "ag-grid/main";
import {Events} from "ag-grid/main";
import {DraggingEvent} from "ag-grid/main";
import {Column} from "ag-grid/main";
import {DragSource} from "ag-grid/main";

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

    // when we are considering a drop from a dnd event, the item to be dropped
    // is in here
    private potentialDragItem: Column;

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

    private onDragEnter(draggingEvent: DraggingEvent): void {
        // see if it's a column or a group. if its a group, we always reject
        var column = (draggingEvent.dragSource.dragItem instanceof Column) ? <Column> draggingEvent.dragSource.dragItem : null;

        var reject: boolean;

        if (column) {
            // see if column is already grouped, if it is, ignore it
            var columnNotGroupable = column.getColDef().suppressRowGroup;
            var columnAlreadyGrouped = this.columnController.isColumnRowGrouped(column);
            reject = columnAlreadyGrouped || columnNotGroupable;
        } else {
            reject = true;
        }

        if (reject) {
            // do not allow group
            this.dragAndDropService.setGhostIcon(null);
        } else {
            // allow group
            this.potentialDragItem = column;
            // this.addPotentialDropToGui(column);
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_GROUP);
            this.refreshGui();
        }

    }

    private onDragLeave(draggingEvent: DraggingEvent): void {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'

        var rowGroupColumns = this.columnController.getRowGroupColumns();

        var thisPanelStartedTheDrag = draggingEvent.dragSource.dragSourceDropTarget === this.dropTarget;
        var dragItemIsGrouped = rowGroupColumns.indexOf(<Column>draggingEvent.dragSource.dragItem) >= 0;
        var needToUngroupThisCol = thisPanelStartedTheDrag && dragItemIsGrouped;

        if (needToUngroupThisCol) {
            this.gridPanel.turnOnAnimationForABit();
            this.columnController.removeRowGroupColumn(draggingEvent.dragSource.dragItem);
            this.columnController.setColumnVisible(draggingEvent.dragSource.dragItem, true);
        }

        if (this.potentialDragItem) {
            this.potentialDragItem = null;
            this.refreshGui();
        }
    }

    private onDragStop(draggingEvent: DraggingEvent): void {
        //this.columnController.addRowGroupColumn(draggingEvent.dragItem);
        if (this.potentialDragItem) {
            // not necessary to remove it, as the change to rowGroups results in
            // this panel refreshing, however my brain will be more at peace if we do
            // this.removePotentialDropFromGui();
            this.columnController.addRowGroupColumn(draggingEvent.dragSource.dragItem);
            this.potentialDragItem = null;
            this.refreshGui();
        }
    }

    private refreshGui(): void {
        this.destroyGui();

        this.addGroupIconToGui();
        this.addEmptyMessageToGui();
        this.addRowGroupColumnsToGui();
        this.addPotentialDragItemToGui();
    }

    private addPotentialDragItemToGui(): void {
        var rowGroupColumns = this.columnController.getRowGroupColumns();
        if (this.potentialDragItem) {
            if (rowGroupColumns.length!==0) {
                this.addArrowToGui();
            }
            var ghostCell = new RenderedGroupedColumnCell(this.potentialDragItem, this.dropTarget, true);
            this.context.wireBean(ghostCell);
            this.getGui().appendChild(ghostCell.getGui());
            this.guiDestroyFunctions.push( ()=> ghostCell.destroy() );
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
        var showEmptyMessage = rowGroupColumns.length === 0 && !this.potentialDragItem;
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

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost = false) {
        super(RenderedGroupedColumnCell.TEMPLATE);
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }

    @PostConstruct
    public init(): void {
        this.setupComponents();
        if (!this.ghost) {
            this.addDragSource();
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItem: this.column,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private setupComponents(): void {
        var eText = <HTMLElement> this.getGui().querySelector('#eText');
        var btRemove = <HTMLElement> this.getGui().querySelector('#btRemove');

        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);
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