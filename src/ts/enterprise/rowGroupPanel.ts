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

@Bean('rowGroupPanel')
export class RowGroupPanel {

    @Autowired('columnController') columnController: ColumnController;
    @Autowired('eventService') eventService: EventService;
    @Autowired('context') context: Context;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('dragAndDropService2') dragAndDropService2: DragAndDropService2;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private logger: Logger;
    private eGui: HTMLElement;
    private dropTarget: DropTarget;

    public agWire(): void {
        this.setupComponents();
    }

    public agPostWire(): void {
        this.logger = this.loggerFactory.create('RowGroupPanel');
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        this.setupDropTarget();
    }

    private setupDropTarget(): void {
        this.dropTarget = {
            eContainer: this.eGui,
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this)
        };
        this.dragAndDropService2.addDropTarget(this.dropTarget);
    }

    private onDragging(): void {
        this.logger.log('onDragging');
    }

    private onDragEnter(draggingEvent: DraggingEvent): void {
        this.columnController.addRowGroupColumn(draggingEvent.dragItem);
    }

    private onDragLeave(draggingEvent: DraggingEvent): void {
        this.columnController.removeRowGroupColumn(draggingEvent.dragItem);
    }

    private onDragStop(draggingEvent: DraggingEvent): void {
        //this.columnController.addRowGroupColumn(draggingEvent.dragItem);
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

    private addColumnsToGui(columns: Column[]): void {
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

    private eGui: HTMLElement;
    private column: Column;
    private dragSourceDropTarget: DropTarget;

    constructor(column: Column, dragSourceDropTarget: DropTarget) {
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
    }

    public agPostWire(): void {
        this.setupComponents();
        this.addDragSource();
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
            this.columnController.removeRowGroupColumn(this.column);
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}