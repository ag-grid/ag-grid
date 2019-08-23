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
    CssClassApplier,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    EventService,
    GridApi,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector,
    _
} from "ag-grid-community/main";
import { BaseColumnItem } from "./primaryColsPanel";

export class ToolPanelColumnComp extends Component implements BaseColumnItem {

    private static TEMPLATE =
        `<div class="ag-column-tool-panel-column">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-tool-panel-column-label" ref="eLabel"></span>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;
    private eDragHandle: HTMLElement;

    private column: Column;
    private columnDept: number;
    private selectionCallback: (selected: boolean) => void;

    private allowDragging: boolean;
    private displayName: string | null;

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
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        _.addCssClass(this.eDragHandle, 'ag-column-drag');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
        const displayNameSanitised: any = _.escape(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;

        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        const indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-toolpanel-add-group-indent');
        }
        this.addCssClass(`ag-toolpanel-indent-${indent}`);

        this.setupDragging();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addDestroyableEventListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));

        this.addDestroyableEventListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));

        this.addDestroyableEventListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));

        this.onColumnStateChanged();

        CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private onLabelClicked(): void {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }

        const nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    }

    private onCheckboxChanged(event: any): void {
        this.onChangeCommon(event.selected);
    }

    private onChangeCommon(nextState: boolean): void {
        // ignore lock visible columns
        if (this.column.getColDef().lockVisible) {
            return;
        }

        // only want to action if the user clicked the checkbox, not is we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }

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

        if (this.selectionCallback) {
            this.selectionCallback(this.isSelected());
        }
    }

    private actionUnCheckedPivotMode(): void {
        const functionPassive = this.gridOptionsWrapper.isFunctionsPassive();
        const column = this.column;
        const columnController = this.columnController;

        // remove pivot if column is pivoted
        if (column.isPivotActive()) {
            if (functionPassive) {
                const copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                copyOfPivotColumns.push(column);
                const event: ColumnPivotChangeRequestEvent = {
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
                const copyOfValueColumns = this.columnController.getValueColumns().slice();
                copyOfValueColumns.push(column);
                const event: ColumnValueChangeRequestEvent = {
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
                const copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                copyOfRowGroupColumns.push(column);
                const event: ColumnRowGroupChangeRequestEvent = {
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
        const column = this.column;

        // function already active, so do nothing
        if (column.isValueActive() || column.isPivotActive() || column.isRowGroupActive()) {
            return;
        }

        const functionPassive = this.gridOptionsWrapper.isFunctionsPassive();

        if (column.isAllowValue()) {
            if (functionPassive) {
                const copyOfValueColumns = this.columnController.getValueColumns().slice();
                _.removeFromArray(copyOfValueColumns, column);
                const event: ColumnValueChangeRequestEvent = {
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
                const copyOfRowGroupColumns = this.columnController.getRowGroupColumns().slice();
                _.removeFromArray(copyOfRowGroupColumns, column);
                const event: ColumnRowGroupChangeRequestEvent = {
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
                const copyOfPivotColumns = this.columnController.getPivotColumns().slice();
                _.removeFromArray(copyOfPivotColumns, column);
                const event: ColumnPivotChangeRequestEvent = {
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
            _.setDisplayed(this.eDragHandle, false);
            return;
        }

        const dragSource: DragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            dragItemCallback: () => this.createDragItem()
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    private createDragItem() {
        const visibleState: { [key: string]: boolean } = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private onColumnStateChanged(): void {
        this.processingColumnStateChange = true;
        const isPivotMode = this.columnController.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            const anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
            if (this.selectionCallback) {
                this.selectionCallback(this.isSelected());
            }
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
            if (this.selectionCallback) {
                this.selectionCallback(this.isSelected());
            }
        }

        let checkboxReadOnly: boolean;

        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            const functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            const noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            checkboxReadOnly = functionsReadOnly || noFunctionsAllowed;
        } else {
            // when in normal mode, the checkbox is read only if visibility is locked
            checkboxReadOnly = !!this.column.getColDef().lockVisible;
        }

        this.cbSelect.setReadOnly(checkboxReadOnly);

        const checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);

        this.processingColumnStateChange = false;
    }

    public getDisplayName(): string | null {
        return this.displayName;
    }

    public onSelectAllChanged(value: boolean): void {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    }

    public isSelected(): boolean {
        return this.cbSelect.getValue();
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
