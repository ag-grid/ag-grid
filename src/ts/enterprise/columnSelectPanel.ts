import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {ColumnController} from "../columnController/columnController";
import _ from '../utils';
import EventService from "../eventService";
import {Events} from "../events";
import Column from "../entities/column";
import {Context} from "../context/context";
import {DragAndDropService2} from "../dragAndDrop/dragAndDropService2";
import {DragSource} from "../dragAndDrop/dragAndDropService2";

export class ColumnSelectPanel {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private static TEMPLATE = '<div class="ag-column-select-panel"></div>';

    private eGui: HTMLElement;

    private renderedColumns: RenderedColumn[] = [];

    public agPostWire(): void {
        console.log('ColumnSelectPanel is alive!!');
        this.eGui = _.loadTemplate(ColumnSelectPanel.TEMPLATE);
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
    }

    public onColumnsChanged(): void {
        _.removeAllChildren(this.eGui);
        this.renderedColumns.forEach( renderedColumn => renderedColumn.destroy() );
        this.renderedColumns.length = 0;

        var columns = this.columnController.getAllColumns();

        columns.forEach( (column: Column) => {
            var renderedColumn = new RenderedColumn(column);
            this.context.wireBean(renderedColumn);
            this.renderedColumns.push(renderedColumn);
            this.eGui.appendChild(renderedColumn.getGui());
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}

class RenderedColumn {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '<label>' +
        '  <input id="eCheckbox" type="checkbox" class="ag-column-select-label"/>' +
        '  <span id="eText" class="ag-column-select-label"></span>' +
        '</label>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService2') private dragAndDropService2: DragAndDropService2;

    private column: Column;

    private eGui: HTMLElement;
    private eCheckbox: HTMLInputElement;

    private destroyFunctions: Function[] = [];

    constructor(column: Column) {
        this.column = column;
        this.eGui = _.loadTemplate(RenderedColumn.TEMPLATE);
    }

    public agPostWire(): void {
        var eText = <HTMLElement> this.eGui.querySelector('#eText');
        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);

        this.eCheckbox = <HTMLInputElement> this.eGui.querySelector('#eCheckbox');
        this.eCheckbox.checked = this.column.isVisible();
        var changeEventListener = () => {
            if (this.column.isVisible()!==this.eCheckbox.checked) {
                this.columnController.setColumnVisible(this.column, this.eCheckbox.checked);
            }
        };
        this.eCheckbox.addEventListener('change', changeEventListener);

        var columnStateChangedListener = this.onColumnStateChanged.bind(this);
        this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        this.destroyFunctions.push( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );

        this.addDragSource();
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.eGui,
            dragItem: this.column
        };
        this.dragAndDropService2.addDragSource(dragSource);
    }

    public onColumnStateChanged(): void {
        if (this.column.isVisible()!==this.eCheckbox.checked) {
            this.eCheckbox.checked = this.column.isVisible();
        }
    }

    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}