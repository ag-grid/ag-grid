import {
    _,
    AgCheckbox,
    Autowired,
    Column,
    ColumnModel,
    Component,
    CssClassApplier,
    DragAndDropService,
    DragSource,
    DragSourceType,
    Events,
    ITooltipParams,
    KeyCode,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ModelItemUtils } from "./modelItemUtils";

export class ToolPanelColumnComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-column-select-column" aria-hidden="true">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('modelItemUtils') private modelItemUtils: ModelItemUtils;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('cbSelect') private cbSelect: AgCheckbox;

    private eDragHandle: HTMLElement;
    private displayName: string | null;
    private processingColumnStateChange = false;

    constructor(
        private readonly column: Column,
        private readonly columnDept: number,
        private readonly allowDragging: boolean,
        private readonly groupsExist: boolean,
        private readonly focusWrapper: HTMLElement
    ) {
        super();
    }

    @PostConstruct
    public init(): void {

        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper)!;
        _.addCssClass(this.eDragHandle, 'ag-drag-handle');
        _.addCssClass(this.eDragHandle, 'ag-column-select-column-drag-handle');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);

        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        const displayNameSanitised: any = _.escapeString(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;

        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        const indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-column-select-add-group-indent');
        }
        this.addCssClass(`ag-column-select-indent-${indent}`);

        this.setupDragging();

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));

        this.addManagedListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));

        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));

        this.onColumnStateChanged();
        this.refreshAriaLabel();

        this.setupTooltip();

        CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    }

    private setupTooltip(): void {

        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(_.escapeString(newTooltipText));
        };

        refresh();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }

    public getTooltipParams(): ITooltipParams {
        const res = super.getTooltipParams();
        res.location = 'columnToolPanelColumn';
        res.colDef = this.column.getColDef();
        return res;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        if (e.keyCode === KeyCode.SPACE) {
            e.preventDefault();
            if (this.isSelectable()) {
                this.onSelectAllChanged(!this.isSelected());
            }
        }
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
        if (this.cbSelect.isReadOnly()) { return; }

        this.refreshAriaLabel();

        // only want to action if the user clicked the checkbox, not if we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }

        this.modelItemUtils.setColumn(this.column, nextState, 'toolPanelUi');
    }

    private refreshAriaLabel(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const state = this.cbSelect.getValue() ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden');
        const label = translate('ariaColumnToggleVisibility', 'column toggle visibility');
        _.setAriaLabel(this.focusWrapper, `${this.displayName} ${label} (${state})`);
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
        const visibleState: { [key: string]: boolean; } = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }

    private onColumnStateChanged(): void {
        this.processingColumnStateChange = true;
        const isPivotMode = this.columnModel.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            const anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        } else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
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
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-select-column-readonly', checkboxReadOnly);

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

    public isSelected(): boolean | undefined {
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
