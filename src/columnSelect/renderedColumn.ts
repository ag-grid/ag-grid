import {Utils as _} from "ag-grid/main";
import {SvgFactory} from "ag-grid/main";
import {RenderedItem} from "./renderedItem";
import {Autowired} from "ag-grid/main";
import {ColumnController} from "ag-grid/main";
import {DragAndDropService} from "ag-grid/main";
import {GridPanel} from "ag-grid/main";
import {Column} from "ag-grid/main";
import {PostConstruct} from "ag-grid/main";
import {DragSource} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedColumn extends RenderedItem {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eColumnVisibleIcon" class="ag-column-visible-icon"></span>' +
        '    <span id="eColumnHiddenIcon" class="ag-column-hidden-icon"></span>' +
        '  </span>' +
        '    <span id="eText" class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private column: Column;
    private columnDept: number;

    private eColumnVisibleIcon: HTMLInputElement;
    private eColumnHiddenIcon: HTMLInputElement;
    private allowDragging: boolean;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        var eText = <HTMLElement> this.queryForHtmlElement('#eText');
        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);
        eText.addEventListener('dblclick', this.onColumnVisibilityChanged.bind(this));

        this.setupVisibleIcons();

        var eIndent = <HTMLElement> this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        if (this.allowDragging) {
            this.addDragSource();
        }
    }

    private setupVisibleIcons(): void {
        this.eColumnHiddenIcon = <HTMLInputElement> this.queryForHtmlElement('#eColumnHiddenIcon');
        this.eColumnVisibleIcon = <HTMLInputElement> this.queryForHtmlElement('#eColumnVisibleIcon');

        this.eColumnHiddenIcon.appendChild(svgFactory.createColumnHiddenIcon());
        this.eColumnVisibleIcon.appendChild(svgFactory.createColumnVisibleIcon());

        this.eColumnHiddenIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));
        this.eColumnVisibleIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));

        var columnStateChangedListener = this.onColumnStateChangedListener.bind(this);
        this.column.addEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        this.addDestroyFunc( ()=> this.column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener) );

        this.setIconVisibility();
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItem: this.column
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private onColumnStateChangedListener(): void {
        this.setIconVisibility();
    }

    private setIconVisibility(): void {
        var visible = this.column.isVisible();
        _.setVisible(this.eColumnVisibleIcon, visible);
        _.setVisible(this.eColumnHiddenIcon, !visible);
    }

    public onColumnVisibilityChanged(): void {
        var newValue = !this.column.isVisible();
        this.columnController.setColumnVisible(this.column, newValue);
    }

}