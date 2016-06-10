import {
    Utils,
    SvgFactory,
    Autowired,
    Component,
    ColumnController,
    DragAndDropService,
    GridOptionsWrapper,
    GridPanel,
    Column,
    Events,
    QuerySelector,
    Listener,
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
        '    <span class="ag-column-checked"></span>' +
        '    <span class="ag-column-unchecked"></span>' +
        '  </span>' +
        '  <span class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    @QuerySelector('.ag-column-checked') private eColumnCheckedIcon: HTMLElement;
    @QuerySelector('.ag-column-unchecked') private eColumnUncheckedIcon: HTMLElement;
    @QuerySelector('.ag-column-select-label') private eText: HTMLElement;

    private checked: boolean;

    private column: Column;
    private columnDept: number;

    private allowDragging: boolean;
    private displayName: string;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {

        this.eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);

        this.setupIcons();

        var eIndent = <HTMLElement> this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';

        if (this.allowDragging) {
            this.addDragSource();
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.checkIconVisibility.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.checkIconVisibility.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.checkIconVisibility.bind(this) );
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_REDUCE_CHANGED, this.checkIconVisibility.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.checkIconVisibility.bind(this));
    }

    private setupIcons(): void {

        this.eColumnCheckedIcon.appendChild(Utils.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxCheckedIcon));
        this.eColumnUncheckedIcon.appendChild(Utils.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null, svgFactory.createCheckboxUncheckedIcon));

        this.checkIconVisibility();
    }

    @Listener('click')
    private onClick(): void {
        this.checked = !this.checked;

        this.setIconVisibility();

        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.checked) {
            setTimeout(this.actionChecked.bind(this), 0);
        } else {
            setTimeout(this.actionUnChecked.bind(this), 0);
        }
    }

    private actionUnChecked(): void {
        // what we do depends on the reduce state
        if (this.columnController.isReduce()) {
            // remove pivot if column is pivoted
            if (this.columnController.isColumnPivoted(this.column)) {
                this.columnController.removePivotColumn(this.column);
            }
            // remove value if column is value
            if (this.columnController.isColumnValue(this.column)) {
                this.columnController.removeValueColumn(this.column);
            }
            // remove group if column is grouped
            if (this.columnController.isColumnRowGrouped(this.column)) {
                this.columnController.removeRowGroupColumn(this.column);
            }
        } else {
            // if not reducing, then it's just column visibility
            this.columnController.setColumnVisible(this.column, false);
        }
    }

    private actionChecked(): void {
        // what we do depends on the reduce state
        if (this.columnController.isReduce()) {
            this.columnController.addRowGroupColumn(this.column);
        } else {
            this.columnController.setColumnVisible(this.column, true);
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource);
    }

    private setIconVisibility(): void {
        Utils.setVisible(this.eColumnCheckedIcon, this.checked);
        Utils.setVisible(this.eColumnUncheckedIcon, !this.checked);
    }

    private checkIconVisibility(): void {

        if (this.columnController.isReduce()) {
            // if reducing, checkbox means column is one of pivot, value or group
            var isPivot = this.columnController.getPivotColumns().indexOf(this.column) >= 0;
            var isRowGroup = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
            var isValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;
            this.checked = isPivot || isRowGroup || isValue;
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.checked = this.column.isVisible();
        }

        this.setIconVisibility();
    }

}