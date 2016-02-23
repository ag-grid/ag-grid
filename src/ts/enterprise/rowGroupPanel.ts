import {Autowired} from "../context/context";
import {ColumnController} from "../columnController/columnController";
import EventService from "../eventService";
import {Events} from "../events";
import _ from '../utils';
import Column from "../entities/column";
import {Context} from "../context/context";
import {Bean} from "../context/context";
import {DragAndDropService2} from "../dragAndDrop/dragAndDropService2";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {DraggingEvent} from "../dragAndDrop/dragAndDropService2";
import {DragSource} from "../dragAndDrop/dragAndDropService2";
import {DropTarget} from "../dragAndDrop/dragAndDropService2";
import GridOptionsWrapper from "../gridOptionsWrapper";
import SvgFactory from "../svgFactory";
import GridPanel from "../gridPanel/gridPanel";
import {PostConstruct} from "../context/context";

var svgFactory = SvgFactory.getInstance();

@Bean('rowGroupPanel')
export class RowGroupPanel {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('eventService') eventService: EventService;
    @Autowired('context') context: Context;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService2') dragAndDropService2: DragAndDropService2;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridPanel') gridPanel: GridPanel;

    private logger: Logger;
    private eGui: HTMLElement;
    private dropTarget: DropTarget;
    private ePotentialDropGui: HTMLElement;

    public agWire(): void {
        this.setupComponents();
    }

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('RowGroupPanel');
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        this.setupDropTarget();
    }

    private setupDropTarget(): void {
        this.dropTarget = {
            eContainer: this.eGui,
            iconName: DragAndDropService2.ICON_GROUP,
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this)
        };
        this.dragAndDropService2.addDropTarget(this.dropTarget);
    }

    private onDragging(): void {
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {
        // is if column is already grouped, if it is, ignore it
        if (!this.columnController.isColumnRowGrouped(draggingEvent.dragItem)) {
            this.addPotentialDropToGui(draggingEvent.dragItem);
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
        _.removeAllChildren(this.eGui);

        var columns = this.columnController.getRowGroupColumns();

        if (columns.length > 0) {
            this.addColumnsToGui(columns);
        } else {
            this.addEmptyMessageToGui();
        }
    }

    private removePotentialDropFromGui(): void {
        this.eGui.removeChild(this.ePotentialDropGui);
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
            _.removeAllChildren(this.eGui);
            var eGroupIcon = svgFactory.createGroupIcon();
            _.addCssClass(eGroupIcon, 'ag-faded ag-row-group-icon');
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

        this.eGui.appendChild(this.ePotentialDropGui);
    }

    private addColumnsToGui(columns: Column[]): void {
        var eGroupIcon = svgFactory.createGroupIcon();
        _.addCssClass(eGroupIcon, 'ag-row-group-icon');
        this.eGui.appendChild(eGroupIcon);

        columns.forEach( (column: Column, index: number) => {
            if (index > 0) {
                var eArrow = document.createElement('span');
                eArrow.innerHTML = '&#8594;';
                this.eGui.appendChild(eArrow);
            }
            var cell = new RenderedGroupedColumnCell(column, this.dropTarget);
            this.context.wireBean(cell);
            this.eGui.appendChild(cell.getGui());
        });
    }

    private addEmptyMessageToGui(): void {
        // add in faded group icon
        var eGroupIcon = svgFactory.createGroupIcon();
        _.addCssClass(eGroupIcon, 'ag-faded ag-row-group-icon');
        this.eGui.appendChild(eGroupIcon);

        // add in message
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns here to group');
        var eMessage = document.createElement('span');
        eMessage.innerHTML = rowGroupColumnsEmptyMessage;
        _.addCssClass(eMessage, 'ag-row-group-empty-message');

        this.eGui.appendChild(eMessage);
    }

    private setupComponents(): void {
        this.eGui = _.loadTemplate('<div class="ag-row-group-panel ag-font-style"></div>');
        this.addEmptyMessageToGui();
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}

class RenderedGroupedColumnCell {

    private static TEMPLATE =
        '<span class="ag-row-group-cell">' +
            '<span id="eText" class="ag-row-group-cell-text"></span>' +
            '<span id="btRemove" class="ag-row-group-cell-button">&#10006;</span>' +
        '</span>';

    @Autowired('dragAndDropService2') dragAndDropService2: DragAndDropService2;
    @Autowired('columnController') columnController: ColumnController;
    @Autowired('gridPanel') gridPanel: GridPanel;

    private eGui: HTMLElement;
    private column: Column;
    private dragSourceDropTarget: DropTarget;
    private ghost: boolean;

    constructor(column: Column, dragSourceDropTarget: DropTarget, ghost = false) {
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
            eElement: this.eGui,
            dragItem: this.column,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService2.addDragSource(dragSource);
    }

    private setupComponents(): void {
        this.eGui = _.loadTemplate(RenderedGroupedColumnCell.TEMPLATE);

        var eText = <HTMLElement> this.eGui.querySelector('#eText');
        var btRemove = <HTMLElement> this.eGui.querySelector('#btRemove');

        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);
        btRemove.addEventListener('click', ()=> {
            this.gridPanel.turnOnAnimationForABit();
            this.columnController.removeRowGroupColumn(this.column);
            this.columnController.setColumnVisible(this.column, true);
        });

        if (this.ghost) {
            _.addCssClass(this.eGui, 'ag-row-group-cell-ghost');
        }
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}