var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgCheckbox, Autowired, Column, Component, CssClassApplier, DragAndDropService, DragSourceType, Events, KeyCode, PostConstruct, RefSelector, TouchListener } from "@ag-grid-community/core";
import { ColumnModelItem } from "./columnModelItem";
import { ToolPanelContextMenu } from "./toolPanelContextMenu";
export class ToolPanelColumnGroupComp extends Component {
    constructor(modelItem, allowDragging, eventType, focusWrapper) {
        super();
        this.modelItem = modelItem;
        this.allowDragging = allowDragging;
        this.eventType = eventType;
        this.focusWrapper = focusWrapper;
        this.processingColumnStateChange = false;
        this.modelItem = modelItem;
        this.columnGroup = modelItem.getColumnGroup();
        this.columnDept = modelItem.getDept();
        this.allowDragging = allowDragging;
    }
    init() {
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-group-drag-handle');
        const checkboxGui = this.cbSelect.getGui();
        const checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.columnGroup, this.eventType);
        if (_.missing(this.displayName)) {
            this.displayName = '>>';
        }
        this.eLabel.innerHTML = this.displayName ? this.displayName : '';
        this.setupExpandContract();
        this.addCssClass('ag-column-select-indent-' + this.columnDept);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.modelItem, ColumnModelItem.EVENT_EXPANDED_CHANGED, this.onExpandChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.setOpenClosedIcons();
        this.setupDragging();
        this.onColumnStateChanged();
        this.addVisibilityListenersToAllChildren();
        this.refreshAriaExpanded();
        this.refreshAriaLabel();
        this.setupTooltip();
        const classes = CssClassApplier.getToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.gridOptionsService, null, this.columnGroup);
        classes.forEach(c => this.addOrRemoveCssClass(c, true));
    }
    getColumns() {
        return this.columnGroup.getLeafColumns();
    }
    setupTooltip() {
        const colGroupDef = this.columnGroup.getColGroupDef();
        if (!colGroupDef) {
            return;
        }
        const refresh = () => {
            const newTooltipText = colGroupDef.headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'columnToolPanelColumnGroup';
        return res;
    }
    handleKeyDown(e) {
        switch (e.key) {
            case KeyCode.LEFT:
                e.preventDefault();
                this.modelItem.setExpanded(false);
                break;
            case KeyCode.RIGHT:
                e.preventDefault();
                this.modelItem.setExpanded(true);
                break;
            case KeyCode.SPACE:
                e.preventDefault();
                if (this.isSelectable()) {
                    this.onSelectAllChanged(!this.isSelected());
                }
                break;
        }
    }
    onContextMenu(e) {
        const { columnGroup, gridOptionsService } = this;
        if (gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        const contextMenu = this.createBean(new ToolPanelContextMenu(columnGroup, e, this.focusWrapper));
        this.addDestroyFunc(() => {
            if (contextMenu.isAlive()) {
                this.destroyBean(contextMenu);
            }
        });
    }
    addVisibilityListenersToAllChildren() {
        this.columnGroup.getLeafColumns().forEach(column => {
            this.addManagedListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
            this.addManagedListener(column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
            this.addManagedListener(column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
            this.addManagedListener(column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        });
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
                    column: this.columnGroup
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
        this.columnGroup.getLeafColumns().forEach(col => {
            visibleState[col.getId()] = col.isVisible();
        });
        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    }
    setupExpandContract() {
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        const touchListener = new TouchListener(this.eColumnGroupIcons, true);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }
    onLabelClicked() {
        const nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    }
    onCheckboxChanged(event) {
        this.onChangeCommon(event.selected);
    }
    getVisibleLeafColumns() {
        const childColumns = [];
        const extractCols = (children) => {
            children.forEach(child => {
                if (!child.isPassesFilter()) {
                    return;
                }
                if (child.isGroup()) {
                    extractCols(child.getChildren());
                }
                else {
                    childColumns.push(child.getColumn());
                }
            });
        };
        extractCols(this.modelItem.getChildren());
        return childColumns;
    }
    onChangeCommon(nextState) {
        this.refreshAriaLabel();
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.selectAllChildren(this.modelItem.getChildren(), nextState, this.eventType);
    }
    refreshAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const columnLabel = translate('ariaColumnGroup', 'Column Group');
        const checkboxValue = this.cbSelect.getValue();
        const state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        const visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabel(this.focusWrapper, `${this.displayName} ${columnLabel}`);
        this.cbSelect.setInputAriaLabel(`${visibilityLabel} (${state})`);
        _.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    }
    onColumnStateChanged() {
        const selectedValue = this.workOutSelectedValue();
        const readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        this.cbSelect.setReadOnly(readOnlyValue);
        this.addOrRemoveCssClass('ag-column-select-column-group-readonly', readOnlyValue);
        this.processingColumnStateChange = false;
    }
    workOutSelectedValue() {
        const pivotMode = this.columnModel.isPivotMode();
        const visibleLeafColumns = this.getVisibleLeafColumns();
        let checkedCount = 0;
        let uncheckedCount = 0;
        visibleLeafColumns.forEach(column => {
            if (!pivotMode && column.getColDef().lockVisible) {
                return;
            }
            if (this.isColumnChecked(column, pivotMode)) {
                checkedCount++;
            }
            else {
                uncheckedCount++;
            }
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        return checkedCount > 0;
    }
    workOutReadOnlyValue() {
        const pivotMode = this.columnModel.isPivotMode();
        let colsThatCanAction = 0;
        this.columnGroup.getLeafColumns().forEach(col => {
            if (pivotMode) {
                if (col.isAnyFunctionAllowed()) {
                    colsThatCanAction++;
                }
            }
            else {
                if (!col.getColDef().lockVisible) {
                    colsThatCanAction++;
                }
            }
        });
        return colsThatCanAction === 0;
    }
    isColumnChecked(column, pivotMode) {
        if (pivotMode) {
            const pivoted = column.isPivotActive();
            const grouped = column.isRowGroupActive();
            const aggregated = column.isValueActive();
            return pivoted || grouped || aggregated;
        }
        return column.isVisible();
    }
    onExpandOrContractClicked() {
        const oldState = this.modelItem.isExpanded();
        this.modelItem.setExpanded(!oldState);
    }
    onExpandChanged() {
        this.setOpenClosedIcons();
        this.refreshAriaExpanded();
    }
    setOpenClosedIcons() {
        const folderOpen = this.modelItem.isExpanded();
        _.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        _.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    }
    refreshAriaExpanded() {
        _.setAriaExpanded(this.focusWrapper, this.modelItem.isExpanded());
    }
    getDisplayName() {
        return this.displayName;
    }
    onSelectAllChanged(value) {
        const cbValue = this.cbSelect.getValue();
        const readOnly = this.cbSelect.isReadOnly();
        if (!readOnly && ((value && !cbValue) || (!value && cbValue))) {
            this.cbSelect.toggle();
        }
    }
    isSelected() {
        return this.cbSelect.getValue();
    }
    isSelectable() {
        return !this.cbSelect.isReadOnly();
    }
    setSelected(selected) {
        this.cbSelect.setValue(selected, true);
    }
}
ToolPanelColumnGroupComp.TEMPLATE = `<div class="ag-column-select-column-group" aria-hidden="true">
            <span class="ag-column-group-icons" ref="eColumnGroupIcons" >
                <span class="ag-column-group-closed-icon" ref="eGroupClosedIcon"></span>
                <span class="ag-column-group-opened-icon" ref="eGroupOpenedIcon"></span>
            </span>
            <ag-checkbox ref="cbSelect" class="ag-column-select-checkbox"></ag-checkbox>
            <span class="ag-column-select-column-label" ref="eLabel"></span>
        </div>`;
__decorate([
    Autowired('columnModel')
], ToolPanelColumnGroupComp.prototype, "columnModel", void 0);
__decorate([
    Autowired('dragAndDropService')
], ToolPanelColumnGroupComp.prototype, "dragAndDropService", void 0);
__decorate([
    Autowired('modelItemUtils')
], ToolPanelColumnGroupComp.prototype, "modelItemUtils", void 0);
__decorate([
    RefSelector('cbSelect')
], ToolPanelColumnGroupComp.prototype, "cbSelect", void 0);
__decorate([
    RefSelector('eLabel')
], ToolPanelColumnGroupComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eGroupOpenedIcon')
], ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", void 0);
__decorate([
    RefSelector('eGroupClosedIcon')
], ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", void 0);
__decorate([
    RefSelector('eColumnGroupIcons')
], ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", void 0);
__decorate([
    PostConstruct
], ToolPanelColumnGroupComp.prototype, "init", null);
