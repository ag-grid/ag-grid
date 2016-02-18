
import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import Column from "../../entities/column";
import _ from '../../utils';
import {DragSource} from "../../dragAndDrop/dragAndDropService2";

export class RenderedColumn {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '<label>' +
        '  <input id="eCheckbox" type="checkbox" class="ag-column-select-checkbox"/>' +
        '  <span id="eText" class="ag-column-select-label"></span>' +
        '</label>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService2') private dragAndDropService2: DragAndDropService2;

    private column: Column;
    private columnDept: number;

    private eGui: HTMLElement;
    private eCheckbox: HTMLInputElement;

    private destroyFunctions: Function[] = [];

    constructor(column: Column, columnDept: number) {
        this.column = column;
        this.eGui = _.loadTemplate(RenderedColumn.TEMPLATE);
        this.columnDept = columnDept;
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

        this.eGui.style.marginLeft = (this.columnDept * 10) + 'px';

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