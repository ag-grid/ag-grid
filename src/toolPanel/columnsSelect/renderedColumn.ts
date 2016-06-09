import {
    Utils,
    SvgFactory,
    Autowired,
    Component,
    ColumnController,
    DragAndDropService,
    GridPanel,
    Column,
    PostConstruct,
    EventService,
    DragSource
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedColumn extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eColumnVisibleIcon" class="ag-column-visible-icon"></span>' +
        '    <span id="eColumnHiddenIcon" class="ag-column-hidden-icon"></span>' +
        '  </span>' +
        '  <input class="ag-cb-operation" type="checkbox">' +
        '  </input>' +
        '  <span id="eText" class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private column: Column;
    private columnDept: number;

    private eColumnVisibleIcon: HTMLInputElement;
    private eColumnHiddenIcon: HTMLInputElement;
    private allowDragging: boolean;

    private displayName: string;

    private cbOperation: HTMLInputElement;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        var eText = <HTMLElement> this.queryForHtmlElement('#eText');
        eText.innerHTML = this.displayName;
        eText.addEventListener('dblclick', this.onColumnVisibilityChanged.bind(this));

        this.setupVisibleIcons();

        var eIndent = <HTMLElement> this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        if (this.allowDragging) {
            this.addDragSource();
        }

        this.addDestroyableEventListener(this.eventService, 'columnValueChanged', this.onColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, 'columnPivotChanged', this.onColumnsChanged.bind(this) );
        this.addDestroyableEventListener(this.eventService, 'columnRowGroupChanged', this.onColumnsChanged.bind(this) );

        this.cbOperation = this.queryForHtmlInputElement('.ag-cb-operation');
        this.addDestroyableEventListener(this.cbOperation, 'change', this.onCbOperation.bind(this) );
        this.onColumnsChanged();
    }

    private onCbOperation(): void {
        var isPivot = this.columnController.getPivotColumns().indexOf(this.column) >= 0;
        var isRowGroup = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var isValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;

        var oldCheckedState = isPivot || isRowGroup || isValue;
        var newCheckedState = this.cbOperation.checked;

        if (newCheckedState !== oldCheckedState) {
            if (newCheckedState) {
                // turn on the operation
                this.columnController.addRowGroupColumn(this.column);
            } else {
                // turn off the operation
                if (isPivot) {
                    this.columnController.removePivotColumn(this.column);
                }
                if (isValue) {
                    this.columnController.removeValueColumn(this.column);
                }
                if (isRowGroup) {
                    this.columnController.removeRowGroupColumn(this.column);
                }
            }
        }
    }

    private onColumnsChanged(): void {
        var isPivot = this.columnController.getPivotColumns().indexOf(this.column) >= 0;
        var isRowGroup = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var isValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;
        var checked = isPivot || isRowGroup || isValue;
        this.cbOperation.checked = checked;
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
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private onColumnStateChangedListener(): void {
        this.setIconVisibility();
    }

    private setIconVisibility(): void {
        var visible = this.column.isVisible();
        Utils.setVisible(this.eColumnVisibleIcon, visible);
        Utils.setVisible(this.eColumnHiddenIcon, !visible);
    }

    public onColumnVisibilityChanged(): void {
        var newValue = !this.column.isVisible();
        this.columnController.setColumnVisible(this.column, newValue);
    }

}