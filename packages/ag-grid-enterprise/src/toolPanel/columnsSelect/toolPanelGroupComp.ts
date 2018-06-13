import {
    AgCheckbox,
    Autowired,
    Column,
    ColumnController,
    Component,
    Context,
    CssClassApplier,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    EventService,
    GridOptionsWrapper,
    GridPanel,
    OriginalColumnGroup,
    PostConstruct,
    QuerySelector,
    TouchListener,
    Utils,
    RefSelector,
    _
} from "ag-grid/main";
import {BaseColumnItem} from "./columnSelectComp";

export class ToolPanelGroupComp extends Component implements BaseColumnItem{

    private static TEMPLATE =
        `<div class="ag-column-select-column-group">
            <span id="eColumnGroupIcons" class="ag-column-group-icons">
                <span id="eGroupOpenedIcon" class="ag-column-group-closed-icon"></span>
                <span id="eGroupClosedIcon" class="ag-column-group-opened-icon"></span>
            </span>
            <ag-checkbox ref="cbSelect" (change)="onCheckboxChanged" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-drag" ref="eDragHandle"></span>
            <span id="eText" class="ag-column-select-column-group-label" (click)="onLabelClicked"></span>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('cbSelect') private cbSelect: AgCheckbox;
    @RefSelector('eDragHandle') private eDragHandle: HTMLElement;

    private columnGroup: OriginalColumnGroup;
    private expanded: boolean;
    private columnDept: number;

    private eGroupClosedIcon: HTMLElement;
    private eGroupOpenedIcon: HTMLElement;

    private expandedCallback: ()=>void;

    private allowDragging: boolean;

    private displayName: string;

    private processingColumnStateChange = false;
    private selectionCallback: (selected:boolean)=>void;

    constructor(columnGroup: OriginalColumnGroup, columnDept: number, expandedCallback: ()=>void, allowDragging: boolean, expandByDefault: boolean) {
        super();
        this.columnGroup = columnGroup;
        this.columnDept = columnDept;
        this.expandedCallback = expandedCallback;
        this.allowDragging = allowDragging;
        this.expanded = expandByDefault;
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(ToolPanelGroupComp.TEMPLATE);

        this.instantiate(this.context);

        let eText = this.queryForHtmlElement('#eText');

        // this.displayName = this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : null;
        this.displayName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');

        if (Utils.missing(this.displayName)) {
            this.displayName = '>>'
        }

        eText.innerHTML = this.displayName;
        this.setupExpandContract();

        this.addCssClass('ag-toolpanel-indent-' + this.columnDept);

        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this) );

        this.setOpenClosedIcons();

        this.setupDragging();

        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();

        CssClassApplier.addToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
    }

    private addVisibilityListenersToAllChildren(): void {
        this.columnGroup.getLeafColumns().forEach( column => {
            this.addDestroyableEventListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
            this.addDestroyableEventListener(column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this) );
            this.addDestroyableEventListener(column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this) );
            this.addDestroyableEventListener(column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this) );
        });
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
        this.columnGroup.getLeafColumns().forEach(col => {
            visibleState[col.getId()] = col.isVisible();
        });

        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    }

    private setupExpandContract(): void {
        this.eGroupClosedIcon = this.queryForHtmlElement('#eGroupClosedIcon');
        this.eGroupOpenedIcon = this.queryForHtmlElement('#eGroupOpenedIcon');

        this.eGroupClosedIcon.appendChild(Utils.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(Utils.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));

        this.addDestroyableEventListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addDestroyableEventListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));

        let eColumnGroupIcons = this.queryForHtmlElement('#eColumnGroupIcons');
        let touchListener = new TouchListener(eColumnGroupIcons, true);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc( touchListener.destroy.bind(touchListener) );
    }

    private onLabelClicked(): void {
        let nextState = !this.cbSelect.isSelected();
        this.onChangeCommon(nextState);
    }

    private onCheckboxChanged(event: any): void {
        this.onChangeCommon(event.selected);
    }

    private onChangeCommon(nextState: boolean): void {
        if (this.processingColumnStateChange) { return; }

        let childColumns = this.columnGroup.getLeafColumns();

        if (this.columnController.isPivotMode()) {
            if (nextState) {
                this.actionCheckedReduce(childColumns);
            } else {
                this.actionUnCheckedReduce(childColumns)
            }
        } else {
            let allowedColumns = childColumns.filter( c => !c.isLockVisible() );
            this.columnController.setColumnsVisible(allowedColumns, nextState, "toolPanelUi");
        }

        if (this.selectionCallback){
            this.selectionCallback(this.isSelected());
        }
    }

    private actionUnCheckedReduce(columns: Column[]): void {

        let columnsToUnPivot: Column[] = [];
        let columnsToUnValue: Column[] = [];
        let columnsToUnGroup: Column[] = [];

        columns.forEach( column => {
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

        if (columnsToUnPivot.length>0) {
            this.columnController.removePivotColumns(columnsToUnPivot, "toolPanelUi");
        }
        if (columnsToUnGroup.length>0) {
            this.columnController.removeRowGroupColumns(columnsToUnGroup, "toolPanelUi");
        }
        if (columnsToUnValue.length>0) {
            this.columnController.removeValueColumns(columnsToUnValue, "toolPanelUi");
        }
    }

    private actionCheckedReduce(columns: Column[]): void {

        let columnsToAggregate: Column[] = [];
        let columnsToGroup: Column[] = [];
        let columnsToPivot: Column[] = [];

        columns.forEach( column => {
            // don't change any column that's already got a function active
            if (column.isAnyFunctionActive()) { return; }

            if (column.isAllowValue()) {
                columnsToAggregate.push(column);
            } else if (column.isAllowRowGroup()) {
                columnsToGroup.push(column);
            } else if (column.isAllowRowGroup()) {
                columnsToPivot.push(column);
            }

        });

        if (columnsToAggregate.length>0) {
            this.columnController.addValueColumns(columnsToAggregate, "toolPanelUi");
        }
        if (columnsToGroup.length>0) {
            this.columnController.addRowGroupColumns(columnsToGroup, "toolPanelUi");
        }
        if (columnsToPivot.length>0) {
            this.columnController.addPivotColumns(columnsToPivot, "toolPanelUi");
        }

    }

    private onColumnStateChanged(): void {
        let selectedValue = this.workOutSelectedValue();
        let readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setSelected(selectedValue);
        if (this.selectionCallback){
            this.selectionCallback(this.isSelected());
        }
        this.cbSelect.setReadOnly(readOnlyValue);
        this.processingColumnStateChange = false;
    }

    private workOutReadOnlyValue(): boolean {
        let pivotMode = this.columnController.isPivotMode();

        let colsThatCanAction = 0;

        this.columnGroup.getLeafColumns().forEach( col => {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            } else {
                if (!col.isLockVisible()) {
                    colsThatCanAction++;
                }
            }
        });

        return colsThatCanAction === 0;
    }

    private workOutSelectedValue(): boolean {
        let pivotMode = this.columnController.isPivotMode();

        let visibleChildCount = 0;
        let hiddenChildCount = 0;

        this.columnGroup.getLeafColumns().forEach( (column: Column) => {
            if (this.isColumnVisible(column, pivotMode)) {
                visibleChildCount++;
            } else {
                hiddenChildCount++;
            }
        });

        let selectedValue: boolean;
        if (visibleChildCount>0 && hiddenChildCount>0) {
            selectedValue = null;
        } else if (visibleChildCount > 0) {
            selectedValue = true;
        } else {
            selectedValue = false;
        }

        return selectedValue;
    }

    private isColumnVisible(column: Column, pivotMode: boolean): boolean {
        if (pivotMode) {
            let pivoted = column.isPivotActive();
            let grouped = column.isRowGroupActive();
            let aggregated = column.isValueActive();
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
        let folderOpen = this.expanded;
        Utils.setVisible(this.eGroupClosedIcon, !folderOpen);
        Utils.setVisible(this.eGroupOpenedIcon, folderOpen);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public getDisplayName(): string {
        return this.displayName;
    }

    public onSelectAllChanged(value: boolean): void {
        if (
            (value && !this.cbSelect.isSelected()) ||
            (! value && this.cbSelect.isSelected())
        ){
            if(!this.cbSelect.isReadOnly()){
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
        return true;
    }

    public setExpanded(value: boolean): void {
        if (this.expanded !== value) {
            this.onExpandOrContractClicked();
        }
    }
}
