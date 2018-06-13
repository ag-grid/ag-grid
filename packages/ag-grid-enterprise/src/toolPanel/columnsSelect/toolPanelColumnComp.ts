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
    Utils,
    RefSelector,
    _
} from "ag-grid/main";
import {BaseColumnItem} from "./columnSelectComp";

export class ToolPanelColumnComp extends Component implements BaseColumnItem{

    private static TEMPLATE =
        `<div class="ag-column-select-column">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox" (change)="onCheckboxChanged"></ag-checkbox>
            <span class="ag-column-drag" ref="eDragHandle"></span>
            <span class="ag-column-select-label" ref="eLabel" (click)="onLabelClicked"></span>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('context') private context: Context;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;

    private column: Column;
    private columnDept: number;
    private selectionCallback: (selected:boolean)=>void;

    private allowDragging: boolean;
    private displayName: string;

    private processingColumnStateChange = false;
    private groupsExist: boolean;

    constructor(column: Column, columnDept: number, allowDragging: boolean, groupsExist: boolean) {
        super();
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
        this.groupsExist = groupsExist;
    }

    @PostConstruct
    public init(): void {

        this.setTemplate(ToolPanelColumnComp.TEMPLATE);

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        this.eLabel.innerHTML = this.displayName;

        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        let indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-toolpanel-add-group-indent');
        }
        this.addCssClass(`ag-toolpanel-indent-${indent}`);

        this.setupDragging();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this) );
        this.addDestroyableEventListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));

        this.instantiate(this.context);

        this.onColumnStateChanged();

        CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private onLabelClicked(): void {
        let nextState = !this.cbSelect.isSelected();
        this.onChangeCommon(nextState);
    }

    private onCheckboxChanged(event: any): void {
        this.onChangeCommon(event.selected);
    }

    private onChangeCommon(nextState: boolean): void {
        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) { return; }

        // action in a timeout, as the action takes some time, we want to update the icons first
        // so the user gets nice feedback when they click. otherwise there would be a lag and the
        // user would think the checkboxes were clunky
        if (this.columnController.isPivotMode()) {
            if (nextState) {
                this.actionCheckedPivotMode();
            } else {
                this.actionUnCheckedPivotMode();
            }
        } else {
            this.columnController.setColumnVisible(this.column, nextState, "columnMenu");
        }

        if (this.selectionCallback){
            this.selectionCallback(this.isSelected());
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

    private setupDragging(): void {
        if (!this.allowDragging) {
            _.setVisible(this.eDragHandle, false);
            return;
        }

        let dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
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
            if (this.selectionCallback){
                this.selectionCallback(this.isSelected());
            }
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setSelected(this.column.isVisible());
            if (this.selectionCallback){
                this.selectionCallback(this.isSelected());
            }
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

    public getDisplayName(): string {
        return this.displayName;
    }

    public onSelectAllChanged(value: boolean): void {
        if (value !== this.cbSelect.isSelected()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    }

    public isSelected(): boolean {
        return this.cbSelect.isSelected();
    }

    public isSelectable(): boolean {
        return !this.cbSelect.isReadOnly();
    }

    public isExpandable(): boolean {
        return false;
    }

    public setExpanded(value: boolean): void {
        console.warn('ag-grid: can not expand a column item that does not represent a column group header');
    }
}