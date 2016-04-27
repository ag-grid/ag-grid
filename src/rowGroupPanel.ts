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
    private ePotentialDropGui: HTMLElement;

    constructor() {
        super('<div class="ag-row-group-panel ag-font-style"></div>');
    }

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('RowGroupPanel');
        this.globalEventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        this.globalEventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        this.setupDropTarget();
        // we don't know if this bean will be initialised before columnController.
        // if columnController first, then below will work
        // if columnController second, then below will put blank in, and then above event gets first when columnController is set up
        this.onColumnChanged();
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
        var column = (draggingEvent.dragItem instanceof Column) ? <Column> draggingEvent.dragItem : null;

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
            this.addPotentialDropToGui(column);
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_GROUP);
        }

    }

    private onDragLeave(draggingEvent: DraggingEvent): void {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'
        if (draggingEvent.dragSource.dragSourceDropTarget === this.dropTarget) {
            this.gridPanel.turnOnAnimationForABit();
            this.columnController.removeRowGroupColumn(draggingEvent.dragItem);
            this.columnController.setColumnVisible(draggingEvent.dragItem, true);
        }
        if (this.ePotentialDropGui) {
            this.removePotentialDropFromGui();
        }
    }

    private onDragStop(draggingEvent: DraggingEvent): void {
        //this.columnController.addRowGroupColumn(draggingEvent.dragItem);
        if (this.ePotentialDropGui) {
            // not necessary to remove it, as the change to rowGroups results in
            // this panel refreshing, however my brain will be more at peace if we do
            this.removePotentialDropFromGui();
            this.columnController.addRowGroupColumn(draggingEvent.dragItem);
        }
    }

    private onColumnChanged(): void {
        _.removeAllChildren(this.getGui());

        var columns = this.columnController.getRowGroupColumns();

        if (columns.length > 0) {
            this.addColumnsToGui(columns);
        } else {
            this.addEmptyMessageToGui();
        }
    }

    private removePotentialDropFromGui(): void {
        this.getGui().removeChild(this.ePotentialDropGui);
        this.ePotentialDropGui = null;
        // if no groupings, need to add the empty message back in
        if (this.columnController.getRowGroupColumns().length === 0) {
            this.addEmptyMessageToGui();
        }
    }

    private addPotentialDropToGui(column: Column): void {
        this.ePotentialDropGui = document.createElement('span');
        if (this.columnController.getRowGroupColumns().length === 0) {
            // if no groupings, need to remove the empty message
            _.removeAllChildren(this.getGui());
            var eGroupIcon = svgFactory.createGroupIcon();
            _.addCssClass(eGroupIcon, 'ag-faded');
            _.addCssClass(eGroupIcon, 'ag-row-group-icon');
            this.ePotentialDropGui.appendChild(eGroupIcon);
        } else {
            // otherwise we need to add an arrow
            var eArrow = document.createElement('span');
            eArrow.innerHTML = '&#8594;';
            this.ePotentialDropGui.appendChild(eArrow);
        }
        var cell = new RenderedGroupedColumnCell(column, this.dropTarget, true);
        this.context.wireBean(cell);
        this.ePotentialDropGui.appendChild(cell.getGui());

        this.getGui().appendChild(this.ePotentialDropGui);
    }

    private addColumnsToGui(columns: Column[]): void {
        var eGroupIcon = svgFactory.createGroupIcon();
        _.addCssClass(eGroupIcon, 'ag-row-group-icon');
        this.getGui().appendChild(eGroupIcon);

        columns.forEach( (column: Column, index: number) => {
            if (index > 0) {
                var eArrow = document.createElement('span');
                eArrow.innerHTML = '&#8594;';
                this.getGui().appendChild(eArrow);
            }
            var cell = new RenderedGroupedColumnCell(column, this.dropTarget);
            this.context.wireBean(cell);
            this.getGui().appendChild(cell.getGui());
        });
    }

    private addEmptyMessageToGui(): void {
        // add in faded group icon
        var eGroupIcon = svgFactory.createGroupIcon();
        _.addCssClass(eGroupIcon, 'ag-faded ag-row-group-icon');
        this.getGui().appendChild(eGroupIcon);

        // add in message
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns here to group');
        var eMessage = document.createElement('span');
        eMessage.innerHTML = rowGroupColumnsEmptyMessage;
        _.addCssClass(eMessage, 'ag-row-group-empty-message');

        this.getGui().appendChild(eMessage);
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