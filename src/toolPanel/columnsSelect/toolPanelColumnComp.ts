import {
    AgCheckbox,
    Autowired,
    Column,
    ColumnApi,
    ColumnController,
    ColumnPivotChangeRequestEvent,
    ColumnRowGroupChangeRequestEvent,
    ColumnValueChangeRequestEvent,
    Component,
    Context,
    CssClassApplier,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    EventService,
    GridApi,
    GridOptionsWrapper,
    GridPanel,
    PostConstruct,
    QuerySelector,
    TouchListener,
    Utils
} from "ag-grid/main";

export class ToolPanelColumnComp extends Component {

    private static TEMPLATE =
        '<div class="ag-column-select-column">' +
          '<ag-checkbox class="ag-column-select-checkbox"></ag-checkbox>' +
          '<span class="ag-column-select-label"></span>' +
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('context') private context: Context;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

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

        this.setTemplate(ToolPanelColumnComp.TEMPLATE);

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        this.eText.innerHTML = this.displayName;

        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);

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
        let touchListener = new TouchListener(this.getGui(), true);
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
            this.columnController.setColumnVisible(this.column, event.selected, "columnMenu");
        }
    }

    private actionUnCheckedPivotMode(): void {
        let functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        let column = this.column;
        let columnController = this.columnController;

        // remove pivot if column is pivoted
        if (column.isPivotActive()) {
            if (functionPassive) {
                let copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                copyOfPivotColumns.push(column);
                let event: ColumnPivotChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                    columns: copyOfPivotColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            } else {
                columnController.removePivotColumn(column, "columnMenu");
            }
        }
        // remove value if column is value
        if (column.isValueActive()) {
            if (functionPassive) {
                let copyOfValueColumns = this.columnController.getValueColumns().slice();
                copyOfValueColumns.push(column);
                let event: ColumnValueChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                    columns: copyOfValueColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            } else {
                columnController.removeValueColumn(column, "columnMenu");
            }
        }
        // remove group if column is grouped
        if (column.isRowGroupActive()) {
            if (functionPassive) {
                let copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                copyOfRowGroupColumns.push(column);
                let event: ColumnRowGroupChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                    columns: copyOfRowGroupColumns,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.eventService.dispatchEvent(event);
            } else {
                columnController.removeRowGroupColumn(column, "columnMenu");
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
                let event: ColumnValueChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfValueColumns
                };
                this.eventService.dispatchEvent(event);
            } else {
                this.columnController.addValueColumn(column, "columnMenu");
            }
        } else if (column.isAllowRowGroup()) {
            if (functionPassive) {
                let copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                Utils.removeFromArray(copyOfRowGroupColumns, column);
                let event: ColumnRowGroupChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfRowGroupColumns
                };
                this.eventService.dispatchEvent(event);
            } else {
                this.columnController.addRowGroupColumn(column, "columnMenu");
            }
        } else if (column.isAllowPivot()) {
            if (functionPassive) {
                let copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                Utils.removeFromArray(copyOfPivotColumns, column);
                let event: ColumnPivotChangeRequestEvent = {
                    type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    columns: copyOfPivotColumns
                };
                this.eventService.dispatchEvent(event);
            } else {
                this.columnController.addPivotColumn(column, "columnMenu");
            }
        }
    }

    private addDragSource(): void {
        let dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.getGui(),
            dragItemName: this.displayName,
            dragItemCallback: () => this.createDragItem()
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
    }

    private createDragItem() {
        let visibleState: { [key: string]: boolean } = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private onColumnStateChanged(): void {
        this.processingColumnStateChange = true;
        let isPivotMode = this.columnController.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            let anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setSelected(anyFunctionActive);
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setSelected(this.column.isVisible());
        }

        let checkboxReadOnly: boolean;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            let functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            let noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            checkboxReadOnly = functionsReadOnly || noFunctionsAllowed;
        } else {
            // when in normal mode, the checkbox is read only if visibility is locked
            checkboxReadOnly = this.column.isLockVisible();
        }

        this.cbSelect.setReadOnly(checkboxReadOnly);

        let checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);

        this.processingColumnStateChange = false;
    }

}