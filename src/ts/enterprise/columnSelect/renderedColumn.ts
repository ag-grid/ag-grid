
import {Autowired} from "../../context/context";
import {ColumnController} from "../../columnController/columnController";
import {DragAndDropService2} from "../../dragAndDrop/dragAndDropService2";
import Column from "../../entities/column";
import _ from '../../utils';
import {DragSource} from "../../dragAndDrop/dragAndDropService2";
import {RenderedItem} from "./renderedItem";

export class RenderedColumn extends RenderedItem {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <label>' +
        '    <input id="eCheckbox" type="checkbox" class="ag-column-select-checkbox"/>' +
        '    <span id="eText" class="ag-column-select-label"></span>' +
        '  </label>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService2') private dragAndDropService2: DragAndDropService2;

    private column: Column;
    private columnDept: number;

    private eCheckbox: HTMLInputElement;

    constructor(column: Column, columnDept: number) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
    }

    public agPostWire(): void {
        var eText = <HTMLElement> this.queryForHtmlElement('#eText');
        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);

        this.eCheckbox = <HTMLInputElement> this.queryForHtmlElement('#eCheckbox');
        this.eCheckbox.checked = this.column.isVisible();
        var changeEventListener = () => {
            if (this.column.isVisible()!==this.eCheckbox.checked) {
                this.columnController.setColumnVisible(this.column, this.eCheckbox.checked);
            }
        };
        this.eCheckbox.addEventListener('change', changeEventListener);

        var columnStateChangedListener = this.onColumnStateChanged.bind(this);
        this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        this.addDestroyFunc( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );

        var eIndent = <HTMLElement> this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        this.addDragSource();
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItem: this.column
        };
        this.dragAndDropService2.addDragSource(dragSource);
    }

    public onColumnStateChanged(): void {
        if (this.column.isVisible()!==this.eCheckbox.checked) {
            this.eCheckbox.checked = this.column.isVisible();
        }
    }

}