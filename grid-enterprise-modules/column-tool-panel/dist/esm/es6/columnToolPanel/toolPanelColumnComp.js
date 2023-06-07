var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgCheckbox, Autowired, Column, Component, CssClassApplier, DragAndDropService, DragSourceType, Events, KeyCode, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ToolPanelContextMenu } from "./toolPanelContextMenu";
export class ToolPanelColumnComp extends Component {
    constructor(column, columnDept, allowDragging, groupsExist, focusWrapper) {
        super();
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
        this.groupsExist = groupsExist;
        this.focusWrapper = focusWrapper;
        this.processingColumnStateChange = false;
    }
    init() {
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-drag-handle');
        const checkboxGui = this.cbSelect.getGui();
        const checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        const displayNameSanitised = _.escapeString(this.displayName);
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
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        this.setupTooltip();
        const classes = CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsService, this.column, null);
        classes.forEach(c => this.addOrRemoveCssClass(c, true));
    }
    getColumn() {
        return this.column;
    }
    setupTooltip() {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'columnToolPanelColumn';
        res.colDef = this.column.getColDef();
        return res;
    }
    onContextMenu(e) {
        const { column, gridOptionsService } = this;
        if (gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        const contextMenu = this.createBean(new ToolPanelContextMenu(column, e, this.focusWrapper));
        this.addDestroyFunc(() => {
            if (contextMenu.isAlive()) {
                this.destroyBean(contextMenu);
            }
        });
    }
    handleKeyDown(e) {
        if (e.key === KeyCode.SPACE) {
            e.preventDefault();
            if (this.isSelectable()) {
                this.onSelectAllChanged(!this.isSelected());
            }
        }
    }
    onLabelClicked() {
        if (this.gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        const nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    }
    onCheckboxChanged(event) {
        this.onChangeCommon(event.selected);
    }
    onChangeCommon(nextState) {
        // ignore lock visible columns
        if (this.cbSelect.isReadOnly()) {
            return;
        }
        this.refreshAriaLabel();
        // only want to action if the user clicked the checkbox, not if we are setting the checkbox because
        // of a change in the model
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.setColumn(this.column, nextState, 'toolPanelUi');
    }
    refreshAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const columnLabel = translate('ariaColumn', 'Column');
        const state = this.cbSelect.getValue() ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden');
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabel(this.focusWrapper, `${this.displayName} ${columnLabel}`);
        this.cbSelect.setInputAriaLabel(`${visibilityLabel} (${state})`);
        _.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    }
    setupDragging() {
        if (!this.allowDragging) {
            _.setDisplayed(this.eDragHandle, false);
            return;
        }
        const hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        const dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            defaultIconName: hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: () => this.createDragItem(),
            onDragStarted: () => {
                const event = {
                    type: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                    column: this.column
                };
                this.eventService.dispatchEvent(event);
            },
            onDragStopped: () => {
                const event = {
                    type: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
                };
                this.eventService.dispatchEvent(event);
            },
            onGridEnter: () => {
                if (hideColumnOnExit) {
                    // when dragged into the grid, mimic what happens when checkbox is enabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    this.onChangeCommon(true);
                }
            },
            onGridExit: () => {
                if (hideColumnOnExit) {
                    // when dragged outside of the grid, mimic what happens when checkbox is disabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    this.onChangeCommon(false);
                }
            }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    createDragItem() {
        const visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }
    onColumnStateChanged() {
        this.processingColumnStateChange = true;
        const isPivotMode = this.columnModel.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            const anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
        }
        let canBeToggled = true;
        let canBeDragged = true;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            const functionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
            //  b) column is not allow any functions on it
            const noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            canBeToggled = !functionsReadOnly && !noFunctionsAllowed;
            canBeDragged = canBeToggled;
        }
        else {
            const { enableRowGroup, enableValue, lockPosition, suppressMovable, lockVisible } = this.column.getColDef();
            const forceDraggable = !!enableRowGroup || !!enableValue;
            const disableDraggable = !!lockPosition || !!suppressMovable;
            canBeToggled = !lockVisible;
            canBeDragged = forceDraggable || !disableDraggable;
        }
        this.cbSelect.setReadOnly(!canBeToggled);
        this.eDragHandle.classList.toggle('ag-column-select-column-readonly', !canBeDragged);
        this.addOrRemoveCssClass('ag-column-select-column-readonly', !canBeDragged && !canBeToggled);
        const checkboxPassive = isPivotMode && this.gridOptionsService.is('functionsPassive');
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    }
    getDisplayName() {
        return this.displayName;
    }
    onSelectAllChanged(value) {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    }
    isSelected() {
        return this.cbSelect.getValue();
    }
    isSelectable() {
        return !this.cbSelect.isReadOnly();
    }
    isExpandable() {
        return false;
    }
    setExpanded(value) {
        console.warn('AG Grid: can not expand a column item that does not represent a column group header');
    }
}
ToolPanelColumnComp.TEMPLATE = `<div class="ag-column-select-column" aria-hidden="true">
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;
__decorate([
    Autowired('columnModel')
], ToolPanelColumnComp.prototype, "columnModel", void 0);
__decorate([
    Autowired('dragAndDropService')
], ToolPanelColumnComp.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('modelItemUtils')
], ToolPanelColumnComp.prototype, "modelItemUtils", void 0);
__decorate([
    RefSelector('eLabel')
], ToolPanelColumnComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('cbSelect')
], ToolPanelColumnComp.prototype, "cbSelect", void 0);
__decorate([
    PostConstruct
], ToolPanelColumnComp.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29sdW1uQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb2x1bW5Ub29sUGFuZWwvdG9vbFBhbmVsQ29sdW1uQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFVBQVUsRUFDVixTQUFTLEVBQ1QsTUFBTSxFQUlOLFNBQVMsRUFDVCxlQUFlLEVBQ2Ysa0JBQWtCLEVBRWxCLGNBQWMsRUFDZCxNQUFNLEVBRU4sT0FBTyxFQUNQLGFBQWEsRUFDYixXQUFXLEVBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUU5RCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsU0FBUztJQW1COUMsWUFDcUIsTUFBYyxFQUNkLFVBQWtCLEVBQ2xCLGFBQXNCLEVBQ3RCLFdBQW9CLEVBQ3BCLFlBQXlCO1FBRTFDLEtBQUssRUFBRSxDQUFDO1FBTlMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDbEIsa0JBQWEsR0FBYixhQUFhLENBQVM7UUFDdEIsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFDcEIsaUJBQVksR0FBWixZQUFZLENBQWE7UUFQdEMsZ0NBQTJCLEdBQUcsS0FBSyxDQUFDO0lBVTVDLENBQUM7SUFHTSxJQUFJO1FBRVAsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUM7UUFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFFeEYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFD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