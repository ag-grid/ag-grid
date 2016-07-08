import {
    Context,
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
    PostConstruct,
    EventService,
    Utils,
    AgCheckbox,
    DragSource
} from "ag-grid/main";

var svgFactory = SvgFactory.getInstance();

export class RenderedColumn extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
        '  <span class="ag-column-select-indent"></span>' +
        '  <ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
        '  <span class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;

    @QuerySelector('.ag-column-select-label') private eText: HTMLElement;
    @QuerySelector('.ag-column-select-indent') private eIndent: HTMLElement;
    @QuerySelector('.ag-column-select-checkbox') private cbSelect: AgCheckbox;

    private column: Column;
    private columnDept: number;

    private allowDragging: boolean;
    private displayName: string;

    private processingColumnStateChange = false;

    constructor(column: Column, columnDept: number, allowDragging: boolean) {
        super(RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {

        this.displayName = this.columnController.getDisplayNameForCol(this.column);
        this.eText.innerHTML = this.displayName;

        this.eIndent.style.width = (this.columnDept * 10) + 'px';

        if (this.allowDragging) {
            this.addDragSource();
        }

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));

        this.instantiate(this.context);

        this.onColumnStateChanged();

        this.addDestroyableEventListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onChange.bind(this));
        this.addDestroyableEventListener(this.eText, 'click', this.onClick.bind(this));
    }

    private onClick(): void {
        if (this.cbSelect.isReadOnly()) { return; }

        this.cbSelect.toggle();
    }

    private onChange(event: any): void {
        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) { return; }

        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.columnController.isPivotMode()) {
            if (event.selected) {
                this.actionCheckedPivotMode();
            } else {
                this.actionUnCheckedPivotMode();
            }
        } else {
            this.columnController.setColumnVisible(this.column, event.selected);
        }
    }

    private actionUnCheckedPivotMode(): void {
        var functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        var column = this.column;
        var columnController = this.columnController;

        // remove pivot if column is pivoted
        if (column.isPivotActive()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_REMOVE_REQUEST, {columns: [column]});
            } else {
                columnController.removePivotColumn(column);
            }
        }
        // remove value if column is value
        if (column.isValueActive()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_REMOVE_REQUEST, {columns: [column]});
            } else {
                columnController.removeValueColumn(column);
            }
        }
        // remove group if column is grouped
        if (column.isRowGroupActive()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_REMOVE_REQUEST, {columns: [column]});
            } else {
                columnController.removeRowGroupColumn(column);
            }
        }
    }

    private actionCheckedPivotMode(): void {
        var column = this.column;
        var columnController = this.columnController;

        // function already active, so do nothing
        if (column.isValueActive() || column.isPivotActive() || column.isRowGroupActive()) { return; }

        var functionPassive = this.gridOptionsWrapper.isFunctionsPassive();

        if (column.isAllowValue()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_ADD_REQUEST, {columns: [column]});
            } else {
                columnController.addValueColumn(column);
            }
        } else if (column.isAllowRowGroup()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_ADD_REQUEST, {columns: [column]});
            } else {
                columnController.addRowGroupColumn(column);
            }
        } else if (column.isAllowPivot()) {
            if (functionPassive) {
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_ADD_REQUEST, {columns: [column]});
            } else {
                columnController.addPivotColumn(column);
            }
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

    private onColumnStateChanged(): void {
        this.processingColumnStateChange = true;
        var isPivotMode = this.columnController.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            var anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setSelected(anyFunctionActive);
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setSelected(this.column.isVisible());
        }

        // read only in pivot mode if:
        var checkboxReadOnly = isPivotMode
            // a) gui is not allowed make any changes or
            && (this.gridOptionsWrapper.isFunctionsReadOnly()
            // b) column is not allow any functions on it
            || !this.column.isAnyFunctionAllowed());

        this.cbSelect.setReadOnly(checkboxReadOnly);

        var checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);

        this.processingColumnStateChange = false;
    }

}