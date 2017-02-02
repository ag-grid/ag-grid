import {
    Context,
    DragSourceType,
    Autowired,
    Component,
    ColumnController,
    DragAndDropService,
    CssClassApplier,
    GridOptionsWrapper,
    GridPanel,
    Column,
    Events,
    TouchListener,
    QuerySelector,
    PostConstruct,
    EventService,
    Utils,
    AgCheckbox,
    DragSource
} from "ag-grid/main";

export class RenderedColumn extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
          '<span class="ag-column-select-indent"></span>' +
          '<ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
          '<span class="ag-column-select-label"></span>' +
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
        super();
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {

        this.setTemplate(RenderedColumn.TEMPLATE);

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
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

        this.addTap();
        CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private addTap(): void {
        let touchListener = new TouchListener(this.getGui());
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, this.onClick.bind(this));
        this.addDestroyFunc( touchListener.destroy.bind(touchListener) );
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
                let copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                copyOfPivotColumns.push(column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST, {columns: copyOfPivotColumns});
            } else {
                columnController.removePivotColumn(column);
            }
        }
        // remove value if column is value
        if (column.isValueActive()) {
            if (functionPassive) {
                let copyOfValueColumns = this.columnController.getValueColumns().slice();
                copyOfValueColumns.push(column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST, {columns: copyOfValueColumns});
            } else {
                columnController.removeValueColumn(column);
            }
        }
        // remove group if column is grouped
        if (column.isRowGroupActive()) {
            if (functionPassive) {
                let copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                copyOfRowGroupColumns.push(column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST, {columns: copyOfRowGroupColumns});
            } else {
                columnController.removeRowGroupColumn(column);
            }
        }
    }

    private actionCheckedPivotMode(): void {
        let column = this.column;

        // function already active, so do nothing
        if (column.isValueActive() || column.isPivotActive() || column.isRowGroupActive()) { return; }

        let functionPassive = this.gridOptionsWrapper.isFunctionsPassive();

        if (column.isAllowValue()) {
            if (functionPassive) {
                let copyOfValueColumns = this.columnController.getValueColumns().slice();
                Utils.removeFromArray(copyOfValueColumns, column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST, {columns: copyOfValueColumns});
            } else {
                this.columnController.addValueColumn(column);
            }
        } else if (column.isAllowRowGroup()) {
            if (functionPassive) {
                let copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                Utils.removeFromArray(copyOfRowGroupColumns, column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST, {columns: copyOfRowGroupColumns});
            } else {
                this.columnController.addRowGroupColumn(column);
            }
        } else if (column.isAllowPivot()) {
            if (functionPassive) {
                let copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                Utils.removeFromArray(copyOfPivotColumns, column);
                this.eventService.dispatchEvent(Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST, {columns: copyOfPivotColumns});
            } else {
                this.columnController.addPivotColumn(column);
            }
        }
    }

    private addDragSource(): void {
        var dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItem: [this.column]
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
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