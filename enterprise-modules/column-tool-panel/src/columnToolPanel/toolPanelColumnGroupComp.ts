import {
    _,
    AgCheckbox,
    Autowired,
    Column,
    ColumnController,
    Component,
    CssClassApplier,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    EventService,
    GridOptionsWrapper,
    OriginalColumnGroup,
    PostConstruct,
    RefSelector,
    TouchListener
} from "@ag-grid-community/core";
import { BaseColumnItem } from "./primaryColsPanel";
import { ColumnFilterResults } from "./primaryColsListPanel";

export class ToolPanelColumnGroupComp extends Component implements BaseColumnItem {

    private static TEMPLATE =
        `<div class="ag-column-select-column-group">
            <span class="ag-column-group-icons" ref="eColumnGroupIcons" >
                <span class="ag-column-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-column-group-opened-icon" ref="eGroupOpenedIcon"></span>
            </span>
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;

    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('cbSelect') private cbSelect: AgCheckbox;
    @RefSelector('eLabel') private eLabel: HTMLElement;

    @RefSelector('eGroupOpenedIcon') private eGroupOpenedIcon: HTMLElement;
    @RefSelector('eGroupClosedIcon') private eGroupClosedIcon: HTMLElement;
    @RefSelector('eColumnGroupIcons') private eColumnGroupIcons: HTMLElement;

    private eDragHandle: HTMLElement;

    private readonly columnGroup: OriginalColumnGroup;
    private readonly columnDept: number;
    private readonly expandedCallback: () => void;
    private readonly allowDragging: boolean;

    private expanded: boolean;
    private displayName: string | null;
    private processingColumnStateChange = false;
    private getFilterResultsCallback: () => ColumnFilterResults;

    constructor(columnGroup: OriginalColumnGroup, columnDept: number, allowDragging: boolean, expandByDefault: boolean,
        expandedCallback: () => void, getFilterResults: () => ColumnFilterResults) {
        super();
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
        this.expanded = expandByDefault;
        this.expandedCallback = expandedCallback;
        this.getFilterResultsCallback = getFilterResults;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);

        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        _.addCssClass(this.eDragHandle, 'ag-drag-handle');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);

        this.displayName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');

        if (_.missing(this.displayName)) {
            this.displayName = '>>';
        }

        this.eLabel.innerHTML = this.displayName ? this.displayName : '';
        this.setupExpandContract();

        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));

        this.addDestroyableEventListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.addDestroyableEventListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));

        this.setOpenClosedIcons();

        this.setupDragging();

        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();

        CssClassApplier.addToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
    }

    private addVisibilityListenersToAllChildren(): void {
        this.columnGroup.getLeafColumns().forEach(column => {
            this.addDestroyableEventListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
            this.addDestroyableEventListener(column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
            this.addDestroyableEventListener(column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
            this.addDestroyableEventListener(column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        });
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
            getDragItem: () => this.createDragItem()
        };

        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }

    private createDragItem() {
        const visibleState: { [key: string]: boolean } = {};
        this.columnGroup.getLeafColumns().forEach(col => {
            visibleState[col.getId()] = col.isVisible();
        });

        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));

        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));

        const touchListener = new TouchListener(this.eColumnGroupIcons, true);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    private onLabelClicked(): void {
        const nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    }

    private onCheckboxChanged(event: any): void {
        this.onChangeCommon(event.selected);
    }

    private onChangeCommon(nextState: boolean): void {
        if (this.processingColumnStateChange) {
            return;
        }

        const childColumns = this.columnGroup.getLeafColumns();

        if (this.columnController.isPivotMode()) {
            if (nextState) {
                this.actionCheckedReduce(childColumns);
            } else {
                this.actionUnCheckedReduce(childColumns);
            }
        } else {
            const isAllowedColumn = (c: Column) => !c.getColDef().lockVisible && !c.getColDef().suppressColumnsToolPanel;
            const allowedColumns = childColumns.filter(isAllowedColumn);

            const filterResults = this.getFilterResultsCallback();
            const passesFilter = (c: Column) => !filterResults || filterResults[c.getColId()];
            const visibleColumns = allowedColumns.filter(passesFilter);

            // only columns that are 'allowed' and pass filter should be visible
            this.columnController.setColumnsVisible(visibleColumns, nextState, "toolPanelUi");
        }
    }

    private actionUnCheckedReduce(columns: Column[]): void {

        const columnsToUnPivot: Column[] = [];
        const columnsToUnValue: Column[] = [];
        const columnsToUnGroup: Column[] = [];

        columns.forEach(column => {
            if (column.isPivotActive()) {
                columnsToUnPivot.push(column);
            }
            if (column.isRowGroupActive()) {
                columnsToUnGroup.push(column);
            }
            if (column.isValueActive()) {
                columnsToUnValue.push(column);
            }
        });

        if (columnsToUnPivot.length > 0) {
            this.columnController.removePivotColumns(columnsToUnPivot, "toolPanelUi");
        }
        if (columnsToUnGroup.length > 0) {
            this.columnController.removeRowGroupColumns(columnsToUnGroup, "toolPanelUi");
        }
        if (columnsToUnValue.length > 0) {
            this.columnController.removeValueColumns(columnsToUnValue, "toolPanelUi");
        }
    }

    private actionCheckedReduce(columns: Column[]): void {

        const columnsToAggregate: Column[] = [];
        const columnsToGroup: Column[] = [];
        const columnsToPivot: Column[] = [];

        columns.forEach(column => {
            // don't change any column that's already got a function active
            if (column.isAnyFunctionActive()) {
                return;
            }

            if (column.isAllowValue()) {
                columnsToAggregate.push(column);
            } else if (column.isAllowRowGroup()) {
                columnsToGroup.push(column);
            } else if (column.isAllowRowGroup()) {
                columnsToPivot.push(column);
            }

        });

        if (columnsToAggregate.length > 0) {
            this.columnController.addValueColumns(columnsToAggregate, "toolPanelUi");
        }
        if (columnsToGroup.length > 0) {
            this.columnController.addRowGroupColumns(columnsToGroup, "toolPanelUi");
        }
        if (columnsToPivot.length > 0) {
            this.columnController.addPivotColumns(columnsToPivot, "toolPanelUi");
        }
    }

    public onColumnStateChanged(): void {
        const selectedValue = this.workOutSelectedValue();
        const readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        this.cbSelect.setReadOnly(readOnlyValue);
        this.processingColumnStateChange = false;
    }

    private workOutSelectedValue(): boolean | undefined {
        const pivotMode = this.columnController.isPivotMode();
        const leafColumns = this.columnGroup.getLeafColumns();
        const filterResults = this.getFilterResultsCallback();

        const len = leafColumns.length;
        const count = { visible: 0, hidden: 0 };
        const ignoredChildCount = { visible: 0, hidden: 0 };

        for (let i = 0; i < len; i++) {
            const column = leafColumns[i];

            // ignore lock visible columns and columns set to 'suppressColumnsToolPanel'
            let ignore = column.getColDef().lockVisible || column.getColDef().suppressColumnsToolPanel;
            const type = this.isColumnVisible(column, pivotMode) ? 'visible' : 'hidden';

            count[type]++;

            // also ignore columns that have been removed by the filter
            if (filterResults) {
                const columnPassesFilter = filterResults[column.getColId()];
                if (!columnPassesFilter) {
                    ignore = true;
                }
            }

            if (!ignore) { continue; }

            ignoredChildCount[type]++;
        }

        // if all columns are ignored we use the regular count, if not
        // we only consider the columns that were not ignored
        if (ignoredChildCount.visible + ignoredChildCount.hidden !== len) {
            count.visible -= ignoredChildCount.visible;
            count.hidden -= ignoredChildCount.hidden;
        }

        let selectedValue: boolean | null;
        if (count.visible > 0 && count.hidden > 0) {
            selectedValue = null;
        } else {
            selectedValue = count.visible > 0;
        }

        return selectedValue == null ? undefined : selectedValue;
    }

    private workOutReadOnlyValue(): boolean {
        const pivotMode = this.columnController.isPivotMode();

        let colsThatCanAction = 0;

        this.columnGroup.getLeafColumns().forEach(col => {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            } else {
                if (!col.getColDef().lockVisible) {
                    colsThatCanAction++;
                }
            }
        });

        return colsThatCanAction === 0;
    }

    private isColumnVisible(column: Column, pivotMode: boolean): boolean {
        if (pivotMode) {
            const pivoted = column.isPivotActive();
            const grouped = column.isRowGroupActive();
            const aggregated = column.isValueActive();
            return pivoted || grouped || aggregated;
        } else {
            return column.isVisible();
        }
    }

    private onExpandOrContractClicked(): void {
        this.expanded = !this.expanded;
        this.setOpenClosedIcons();
        this.expandedCallback();
    }

    private setOpenClosedIcons(): void {
        const folderOpen = this.expanded;
        _.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        _.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public getDisplayName(): string | null {
        return this.displayName;
    }

    public onSelectAllChanged(value: boolean): void {
        if (
            (value && !this.cbSelect.getValue()) ||
            (!value && this.cbSelect.getValue())
        ) {
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
        return true;
    }

    public setExpanded(value: boolean): void {
        if (this.expanded !== value) {
            this.onExpandOrContractClicked();
        }
    }

    public setSelected(selected: boolean) {
        this.cbSelect.setValue(selected, true);
    }
}
