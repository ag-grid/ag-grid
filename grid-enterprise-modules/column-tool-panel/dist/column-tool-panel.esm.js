/**
          * @ag-grid-enterprise/column-tool-panel - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, RefSelector, PostConstruct, Component, KeyCode, Events, _, EventService, Column, ProvidedColumnGroup, AgMenuList, AgMenuItemComponent, AgCheckbox, CssClassApplier, DragSourceType, DragAndDropService, TouchListener, BeanStub, AutoScrollService, PreDestroy, VirtualList, PreConstruct, PositionableFeature, ModuleRegistry, ModuleNames, Bean } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RowGroupDropZonePanel, ValuesDropZonePanel, PivotDropZonePanel, RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExpandState;
(function (ExpandState) {
    ExpandState[ExpandState["EXPANDED"] = 0] = "EXPANDED";
    ExpandState[ExpandState["COLLAPSED"] = 1] = "COLLAPSED";
    ExpandState[ExpandState["INDETERMINATE"] = 2] = "INDETERMINATE";
})(ExpandState || (ExpandState = {}));
class PrimaryColsHeaderPanel extends Component {
    constructor() {
        super(PrimaryColsHeaderPanel.TEMPLATE);
    }
    postConstruct() {
        this.createExpandIcons();
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eExpand, 'keydown', (e) => {
            if (e.key === KeyCode.SPACE) {
                e.preventDefault();
                this.onExpandClicked();
            }
        });
        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));
        this.eFilterTextField.onValueChange(() => this.onFilterTextChanged());
        this.addManagedListener(this.eFilterTextField.getInputElement(), 'keydown', this.onMiniFilterKeyDown.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
        const translate = this.localeService.getLocaleTextFunc();
        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle Select All Columns'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
    }
    init(params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }
    createExpandIcons() {
        this.eExpand.appendChild((this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService)));
        this.setExpandState(ExpandState.EXPANDED);
    }
    // we only show expand / collapse if we are showing columns
    showOrHideOptions() {
        const showFilter = !this.params.suppressColumnFilter;
        const showSelect = !this.params.suppressColumnSelectAll;
        const showExpand = !this.params.suppressColumnExpandAll;
        const groupsPresent = this.columnModel.isPrimaryColumnGroupsPresent();
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        _.setDisplayed(this.eFilterTextField.getGui(), showFilter);
        _.setDisplayed(this.eSelect.getGui(), showSelect);
        _.setDisplayed(this.eExpand, showExpand && groupsPresent);
    }
    onFilterTextChanged() {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce(() => {
                const filterText = this.eFilterTextField.getValue();
                this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
        this.onFilterTextChangedDebounced();
    }
    onMiniFilterKeyDown(e) {
        if (e.key === KeyCode.ENTER) {
            // we need to add a delay that corresponds to the filter text debounce delay to ensure
            // the text filtering has happened, otherwise all columns will be deselected
            setTimeout(() => this.onSelectClicked(), PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
    }
    onSelectClicked() {
        this.dispatchEvent({ type: this.selectState ? 'unselectAll' : 'selectAll' });
    }
    onExpandClicked() {
        this.dispatchEvent({ type: this.expandState === ExpandState.EXPANDED ? 'collapseAll' : 'expandAll' });
    }
    setExpandState(state) {
        this.expandState = state;
        _.setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    }
    setSelectionState(state) {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
PrimaryColsHeaderPanel.DEBOUNCE_DELAY = 300;
PrimaryColsHeaderPanel.TEMPLATE = `<div class="ag-column-select-header" role="presentation">
            <div ref="eExpand" class="ag-column-select-header-icon" tabindex="0"></div>
            <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
        </div>`;
__decorate$9([
    Autowired('columnModel')
], PrimaryColsHeaderPanel.prototype, "columnModel", void 0);
__decorate$9([
    RefSelector('eExpand')
], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
__decorate$9([
    RefSelector('eSelect')
], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
__decorate$9([
    RefSelector('eFilterTextField')
], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
__decorate$9([
    PostConstruct
], PrimaryColsHeaderPanel.prototype, "postConstruct", null);

class ColumnModelItem {
    constructor(displayName, columnOrGroup, dept, group = false, expanded) {
        this.eventService = new EventService();
        this.displayName = displayName;
        this.dept = dept;
        this.group = group;
        if (group) {
            this.columnGroup = columnOrGroup;
            this.expanded = expanded;
            this.children = [];
        }
        else {
            this.column = columnOrGroup;
        }
    }
    isGroup() { return this.group; }
    getDisplayName() { return this.displayName; }
    getColumnGroup() { return this.columnGroup; }
    getColumn() { return this.column; }
    getDept() { return this.dept; }
    isExpanded() { return !!this.expanded; }
    getChildren() { return this.children; }
    isPassesFilter() { return this.passesFilter; }
    setExpanded(expanded) {
        if (expanded === this.expanded) {
            return;
        }
        this.expanded = expanded;
        this.eventService.dispatchEvent({ type: ColumnModelItem.EVENT_EXPANDED_CHANGED });
    }
    setPassesFilter(passesFilter) {
        this.passesFilter = passesFilter;
    }
    addEventListener(eventType, listener) {
        this.eventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    }
}
ColumnModelItem.EVENT_EXPANDED_CHANGED = 'expandedChanged';

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelContextMenu extends Component {
    constructor(column, mouseEvent, parentEl) {
        super(/* html */ `<div class="ag-menu"></div>`);
        this.column = column;
        this.mouseEvent = mouseEvent;
        this.parentEl = parentEl;
        this.displayName = null;
    }
    postConstruct() {
        this.initializeProperties(this.column);
        this.buildMenuItemMap();
        if (this.column instanceof Column) {
            this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        }
        else {
            this.displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, this.column, 'columnToolPanel');
        }
        if (this.isActive()) {
            this.mouseEvent.preventDefault();
            this.displayContextMenu();
        }
    }
    initializeProperties(column) {
        if (column instanceof ProvidedColumnGroup) {
            this.columns = column.getLeafColumns();
        }
        else {
            this.columns = [column];
        }
        this.allowGrouping = this.columns.some(col => col.isPrimary() && col.isAllowRowGroup());
        this.allowValues = this.columns.some(col => col.isPrimary() && col.isAllowValue());
        this.allowPivoting = this.columnModel.isPivotMode() && this.columns.some(col => col.isPrimary() && col.isAllowPivot());
    }
    buildMenuItemMap() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.menuItemMap = new Map();
        this.menuItemMap.set('rowGroup', {
            allowedFunction: (col) => col.isPrimary() && col.isAllowRowGroup(),
            activeFunction: (col) => col.isRowGroupActive(),
            activateLabel: () => `${localeTextFunc('groupBy', 'Group by')} ${this.displayName}`,
            deactivateLabel: () => `${localeTextFunc('ungroupBy', 'Un-Group by')} ${this.displayName}`,
            activateFunction: () => {
                const groupedColumns = this.columnModel.getRowGroupColumns();
                this.columnModel.setRowGroupColumns(this.addColumnsToList(groupedColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const groupedColumns = this.columnModel.getRowGroupColumns();
                this.columnModel.setRowGroupColumns(this.removeColumnsFromList(groupedColumns), "toolPanelUi");
            },
            addIcon: 'menuAddRowGroup',
            removeIcon: 'menuRemoveRowGroup'
        });
        this.menuItemMap.set('value', {
            allowedFunction: (col) => col.isPrimary() && col.isAllowValue(),
            activeFunction: (col) => col.isValueActive(),
            activateLabel: () => localeTextFunc('addToValues', `Add ${this.displayName} to values`, [this.displayName]),
            deactivateLabel: () => localeTextFunc('removeFromValues', `Remove ${this.displayName} from values`, [this.displayName]),
            activateFunction: () => {
                const valueColumns = this.columnModel.getValueColumns();
                this.columnModel.setValueColumns(this.addColumnsToList(valueColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const valueColumns = this.columnModel.getValueColumns();
                this.columnModel.setValueColumns(this.removeColumnsFromList(valueColumns), "toolPanelUi");
            },
            addIcon: 'valuePanel',
            removeIcon: 'valuePanel'
        });
        this.menuItemMap.set('pivot', {
            allowedFunction: (col) => this.columnModel.isPivotMode() && col.isPrimary() && col.isAllowPivot(),
            activeFunction: (col) => col.isPivotActive(),
            activateLabel: () => localeTextFunc('addToLabels', `Add ${this.displayName} to labels`, [this.displayName]),
            deactivateLabel: () => localeTextFunc('removeFromLabels', `Remove ${this.displayName} from labels`, [this.displayName]),
            activateFunction: () => {
                const pivotColumns = this.columnModel.getPivotColumns();
                this.columnModel.setPivotColumns(this.addColumnsToList(pivotColumns), "toolPanelUi");
            },
            deActivateFunction: () => {
                const pivotColumns = this.columnModel.getPivotColumns();
                this.columnModel.setPivotColumns(this.removeColumnsFromList(pivotColumns), "toolPanelUi");
            },
            addIcon: 'pivotPanel',
            removeIcon: 'pivotPanel'
        });
    }
    addColumnsToList(columnList) {
        return [...columnList].concat(this.columns.filter(col => columnList.indexOf(col) === -1));
    }
    removeColumnsFromList(columnList) {
        return columnList.filter(col => this.columns.indexOf(col) === -1);
    }
    displayContextMenu() {
        const eGui = this.getGui();
        const menuList = this.createBean(new AgMenuList());
        const menuItemsMapped = this.getMappedMenuItems();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        let hideFunc = () => { };
        eGui.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItemsMapped);
        menuList.addManagedListener(menuList, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, () => {
            this.parentEl.focus();
            hideFunc();
        });
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            afterGuiAttached: () => this.focusService.focusInto(menuList.getGui()),
            ariaLabel: localeTextFunc('ariaLabelContextMenu', 'Context Menu'),
            closedCallback: (e) => {
                if (e instanceof KeyboardEvent) {
                    this.parentEl.focus();
                }
                this.destroyBean(menuList);
            }
        });
        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }
        this.popupService.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: this.mouseEvent,
            ePopup: eGui
        });
    }
    isActive() {
        return this.allowGrouping || this.allowValues || this.allowPivoting;
    }
    getMappedMenuItems() {
        const ret = [];
        for (const val of this.menuItemMap.values()) {
            const isInactive = this.columns.some(col => val.allowedFunction(col) && !val.activeFunction(col));
            const isActive = this.columns.some(col => val.allowedFunction(col) && val.activeFunction(col));
            if (isInactive) {
                ret.push({
                    name: val.activateLabel(this.displayName),
                    icon: _.createIconNoSpan(val.addIcon, this.gridOptionsService, null),
                    action: () => val.activateFunction()
                });
            }
            if (isActive) {
                ret.push({
                    name: val.deactivateLabel(this.displayName),
                    icon: _.createIconNoSpan(val.removeIcon, this.gridOptionsService, null),
                    action: () => val.deActivateFunction()
                });
            }
        }
        return ret;
    }
}
__decorate$8([
    Autowired('columnModel')
], ToolPanelContextMenu.prototype, "columnModel", void 0);
__decorate$8([
    Autowired('popupService')
], ToolPanelContextMenu.prototype, "popupService", void 0);
__decorate$8([
    Autowired('focusService')
], ToolPanelContextMenu.prototype, "focusService", void 0);
__decorate$8([
    PostConstruct
], ToolPanelContextMenu.prototype, "postConstruct", null);

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelColumnGroupComp extends Component {
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
__decorate$7([
    Autowired('columnModel')
], ToolPanelColumnGroupComp.prototype, "columnModel", void 0);
__decorate$7([
    Autowired('dragAndDropService')
], ToolPanelColumnGroupComp.prototype, "dragAndDropService", void 0);
__decorate$7([
    Autowired('modelItemUtils')
], ToolPanelColumnGroupComp.prototype, "modelItemUtils", void 0);
__decorate$7([
    RefSelector('cbSelect')
], ToolPanelColumnGroupComp.prototype, "cbSelect", void 0);
__decorate$7([
    RefSelector('eLabel')
], ToolPanelColumnGroupComp.prototype, "eLabel", void 0);
__decorate$7([
    RefSelector('eGroupOpenedIcon')
], ToolPanelColumnGroupComp.prototype, "eGroupOpenedIcon", void 0);
__decorate$7([
    RefSelector('eGroupClosedIcon')
], ToolPanelColumnGroupComp.prototype, "eGroupClosedIcon", void 0);
__decorate$7([
    RefSelector('eColumnGroupIcons')
], ToolPanelColumnGroupComp.prototype, "eColumnGroupIcons", void 0);
__decorate$7([
    PostConstruct
], ToolPanelColumnGroupComp.prototype, "init", null);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const PRIMARY_COLS_LIST_ITEM_HOVERED = 'ag-list-item-hovered';
class PrimaryColsListPanelItemDragFeature extends BeanStub {
    constructor(comp, virtualList) {
        super();
        this.comp = comp;
        this.virtualList = virtualList;
        this.currentDragColumn = null;
        this.lastHoveredColumnItem = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START, this.columnPanelItemDragStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END, this.columnPanelItemDragEnd.bind(this));
        this.createDropTarget();
        this.createAutoScrollService();
    }
    columnPanelItemDragStart({ column }) {
        this.currentDragColumn = column;
        const currentColumns = this.getCurrentColumns();
        const hasNotMovable = currentColumns.find(col => {
            const colDef = col.getColDef();
            return !!colDef.suppressMovable || !!colDef.lockPosition;
        });
        if (hasNotMovable) {
            this.moveBlocked = true;
        }
    }
    columnPanelItemDragEnd() {
        window.setTimeout(() => {
            this.currentDragColumn = null;
            this.moveBlocked = false;
        }, 10);
    }
    createDropTarget() {
        const dropTarget = {
            isInterestedIn: (type) => type === DragSourceType.ToolPanel,
            getIconName: () => DragAndDropService[this.moveBlocked ? 'ICON_NOT_ALLOWED' : 'ICON_MOVE'],
            getContainer: () => this.comp.getGui(),
            onDragging: (e) => this.onDragging(e),
            onDragStop: () => this.onDragStop(),
            onDragLeave: () => this.onDragLeave()
        };
        this.dragAndDropService.addDropTarget(dropTarget);
    }
    createAutoScrollService() {
        const virtualListGui = this.virtualList.getGui();
        this.autoScrollService = new AutoScrollService({
            scrollContainer: virtualListGui,
            scrollAxis: 'y',
            getVerticalPosition: () => virtualListGui.scrollTop,
            setVerticalPosition: (position) => virtualListGui.scrollTop = position
        });
    }
    onDragging(e) {
        if (!this.currentDragColumn || this.moveBlocked) {
            return;
        }
        const hoveredColumnItem = this.getDragColumnItem(e);
        const comp = this.virtualList.getComponentAt(hoveredColumnItem.rowIndex);
        if (!comp) {
            return;
        }
        const el = comp.getGui().parentElement;
        if (this.lastHoveredColumnItem &&
            this.lastHoveredColumnItem.rowIndex === hoveredColumnItem.rowIndex &&
            this.lastHoveredColumnItem.position === hoveredColumnItem.position) {
            return;
        }
        this.autoScrollService.check(e.event);
        this.clearHoveredItems();
        this.lastHoveredColumnItem = hoveredColumnItem;
        _.radioCssClass(el, `${PRIMARY_COLS_LIST_ITEM_HOVERED}`);
        _.radioCssClass(el, `ag-item-highlight-${hoveredColumnItem.position}`);
    }
    getDragColumnItem(e) {
        const virtualListGui = this.virtualList.getGui();
        const paddingTop = parseFloat(window.getComputedStyle(virtualListGui).paddingTop);
        const rowHeight = this.virtualList.getRowHeight();
        const scrollTop = this.virtualList.getScrollTop();
        const rowIndex = Math.max(0, (e.y - paddingTop + scrollTop) / rowHeight);
        const maxLen = this.comp.getDisplayedColsList().length - 1;
        const normalizedRowIndex = Math.min(maxLen, rowIndex) | 0;
        return {
            rowIndex: normalizedRowIndex,
            position: (Math.round(rowIndex) > rowIndex || rowIndex > maxLen) ? 'bottom' : 'top',
            component: this.virtualList.getComponentAt(normalizedRowIndex)
        };
    }
    onDragStop() {
        if (this.moveBlocked) {
            return;
        }
        const targetIndex = this.getTargetIndex();
        const columnsToMove = this.getCurrentColumns();
        if (targetIndex != null) {
            this.columnModel.moveColumns(columnsToMove, targetIndex, 'toolPanelUi');
        }
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    getMoveDiff(end) {
        const allColumns = this.columnModel.getAllGridColumns();
        const currentColumns = this.getCurrentColumns();
        const currentColumn = currentColumns[0];
        const span = currentColumns.length;
        const currentIndex = allColumns.indexOf(currentColumn);
        if (currentIndex < end) {
            return span;
        }
        return 0;
    }
    getCurrentColumns() {
        if (this.currentDragColumn instanceof ProvidedColumnGroup) {
            return this.currentDragColumn.getLeafColumns();
        }
        return [this.currentDragColumn];
    }
    getTargetIndex() {
        if (!this.lastHoveredColumnItem) {
            return null;
        }
        const columnItemComponent = this.lastHoveredColumnItem.component;
        let isBefore = this.lastHoveredColumnItem.position === 'top';
        let targetColumn;
        if (columnItemComponent instanceof ToolPanelColumnGroupComp) {
            const columns = columnItemComponent.getColumns();
            targetColumn = columns[0];
            isBefore = true;
        }
        else {
            targetColumn = columnItemComponent.getColumn();
        }
        const targetColumnIndex = this.columnModel.getAllGridColumns().indexOf(targetColumn);
        const adjustedTarget = isBefore ? targetColumnIndex : targetColumnIndex + 1;
        const diff = this.getMoveDiff(adjustedTarget);
        return adjustedTarget - diff;
    }
    onDragLeave() {
        this.clearHoveredItems();
        this.autoScrollService.ensureCleared();
    }
    clearHoveredItems() {
        const virtualListGui = this.virtualList.getGui();
        virtualListGui.querySelectorAll(`.${PRIMARY_COLS_LIST_ITEM_HOVERED}`).forEach(el => {
            [
                PRIMARY_COLS_LIST_ITEM_HOVERED,
                'ag-item-highlight-top',
                'ag-item-highlight-bottom'
            ].forEach(cls => {
                el.classList.remove(cls);
            });
        });
        this.lastHoveredColumnItem = null;
    }
}
__decorate$6([
    Autowired('columnModel')
], PrimaryColsListPanelItemDragFeature.prototype, "columnModel", void 0);
__decorate$6([
    Autowired('dragAndDropService')
], PrimaryColsListPanelItemDragFeature.prototype, "dragAndDropService", void 0);
__decorate$6([
    PostConstruct
], PrimaryColsListPanelItemDragFeature.prototype, "postConstruct", null);

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ToolPanelColumnComp extends Component {
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
__decorate$5([
    Autowired('columnModel')
], ToolPanelColumnComp.prototype, "columnModel", void 0);
__decorate$5([
    Autowired('dragAndDropService')
], ToolPanelColumnComp.prototype, "dragAndDropService", void 0);
__decorate$5([
    Autowired('modelItemUtils')
], ToolPanelColumnComp.prototype, "modelItemUtils", void 0);
__decorate$5([
    RefSelector('eLabel')
], ToolPanelColumnComp.prototype, "eLabel", void 0);
__decorate$5([
    RefSelector('cbSelect')
], ToolPanelColumnComp.prototype, "cbSelect", void 0);
__decorate$5([
    PostConstruct
], ToolPanelColumnComp.prototype, "init", null);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class UIColumnModel {
    constructor(items) {
        this.items = items;
    }
    getRowCount() {
        return this.items.length;
    }
    getRow(index) {
        return this.items[index];
    }
}
const PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';
class PrimaryColsListPanel extends Component {
    constructor() {
        super(PrimaryColsListPanel.TEMPLATE);
        this.destroyColumnItemFuncs = [];
    }
    destroyColumnTree() {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach(f => f());
        this.destroyColumnItemFuncs = [];
    }
    init(params, allowDragging, eventType) {
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
        const eventsImpactingCheckedState = [
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(event => {
            // update header select all checkbox with current selection state
            this.addManagedListener(this.eventService, event, this.fireSelectionChangedEvent.bind(this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        const translate = this.localeService.getLocaleTextFunc();
        const columnListName = translate('ariaColumnList', 'Column List');
        this.virtualList = this.createManagedBean(new VirtualList('column-select', 'tree', columnListName));
        this.appendChild(this.virtualList.getGui());
        this.virtualList.setComponentCreator((item, listItemElement) => {
            _.setAriaLevel(listItemElement, (item.getDept() + 1));
            return this.createComponentFromItem(item, listItemElement);
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
        if (!params.suppressColumnMove && !this.gridOptionsService.is('suppressMovableColumns')) {
            this.createManagedBean(new PrimaryColsListPanelItemDragFeature(this, this.virtualList));
        }
    }
    createComponentFromItem(item, listItemElement) {
        if (item.isGroup()) {
            const renderedGroup = new ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);
            return renderedGroup;
        }
        const columnComp = new ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);
        return columnComp;
    }
    onColumnsChanged() {
        const expandedStates = this.getExpandedStates();
        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        }
        else {
            this.buildTreeFromProvidedColumnDefs();
        }
        this.setExpandedStates(expandedStates);
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    getDisplayedColsList() {
        return this.displayedColsList;
    }
    getExpandedStates() {
        if (!this.allColsTree) {
            return {};
        }
        const res = {};
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });
        return res;
    }
    setExpandedStates(states) {
        if (!this.allColsTree) {
            return;
        }
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                const expanded = states[colGroup.getId()];
                const groupExistedLastTime = expanded != null;
                if (groupExistedLastTime) {
                    item.setExpanded(expanded);
                }
            }
        });
    }
    buildTreeFromWhatGridIsDisplaying() {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    }
    setColumnLayout(colDefs) {
        const columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);
        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some(colDef => {
            return colDef && typeof colDef.children !== 'undefined';
        });
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    buildTreeFromProvidedColumnDefs() {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getPrimaryColumnTree());
        this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
    }
    buildListModel(columnTree) {
        const columnExpandedListener = this.onColumnExpanded.bind(this);
        const addListeners = (item) => {
            item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            const removeFunc = item.removeEventListener.bind(item, ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            this.destroyColumnItemFuncs.push(removeFunc);
        };
        const recursivelyBuild = (tree, dept, parentList) => {
            tree.forEach(child => {
                if (child instanceof ProvidedColumnGroup) {
                    createGroupItem(child, dept, parentList);
                }
                else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };
        const createGroupItem = (columnGroup, dept, parentList) => {
            const columnGroupDef = columnGroup.getColGroupDef();
            const skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }
            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }
            const displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, this.eventType);
            const item = new ColumnModelItem(displayName, columnGroup, dept, true, this.expandGroupsByDefault);
            parentList.push(item);
            addListeners(item);
            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };
        const createColumnItem = (column, dept, parentList) => {
            const skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
            if (skipThisColumn) {
                return;
            }
            const displayName = this.columnModel.getDisplayNameForColumn(column, 'columnToolPanel');
            parentList.push(new ColumnModelItem(displayName, column, dept));
        };
        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    }
    onColumnExpanded() {
        this.flattenAndFilterModel();
    }
    flattenAndFilterModel() {
        this.displayedColsList = [];
        const recursiveFunc = (item) => {
            if (!item.isPassesFilter()) {
                return;
            }
            this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };
        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();
        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }
        this.notifyListeners();
    }
    focusRowIfAlive(rowIndex) {
        window.setTimeout(() => {
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }
    forEachItem(callback) {
        const recursiveFunc = (items) => {
            items.forEach(item => {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };
        recursiveFunc(this.allColsTree);
    }
    doSetExpandedAll(value) {
        this.forEachItem(item => {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    }
    setGroupsExpanded(expand, groupIds) {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }
        const expandedGroupIds = [];
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });
        const unrecognisedGroupIds = groupIds.filter(groupId => !_.includes(expandedGroupIds, groupId));
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    }
    getExpandState() {
        let expandedCount = 0;
        let notExpandedCount = 0;
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            if (item.isExpanded()) {
                expandedCount++;
            }
            else {
                notExpandedCount++;
            }
        });
        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }
        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }
        return ExpandState.EXPANDED;
    }
    doSetSelectedAll(selectAllChecked) {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    }
    getSelectionState() {
        let checkedCount = 0;
        let uncheckedCount = 0;
        const pivotMode = this.columnModel.isPivotMode();
        this.forEachItem(item => {
            if (item.isGroup()) {
                return;
            }
            if (!item.isPassesFilter()) {
                return;
            }
            const column = item.getColumn();
            const colDef = column.getColDef();
            let checked;
            if (pivotMode) {
                const noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
            }
            else {
                if (colDef.lockVisible) {
                    return;
                }
                checked = column.isVisible();
            }
            checked ? checkedCount++ : uncheckedCount++;
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        return !(checkedCount === 0 || uncheckedCount > 0);
    }
    setFilterText(filterText) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    markFilteredColumns() {
        const passesFilter = (item) => {
            if (!_.exists(this.filterText)) {
                return true;
            }
            const displayName = item.getDisplayName();
            return displayName == null || displayName.toLowerCase().indexOf(this.filterText) !== -1;
        };
        const recursivelyCheckFilter = (item, parentPasses) => {
            let atLeastOneChildPassed = false;
            if (item.isGroup()) {
                const groupPasses = passesFilter(item);
                item.getChildren().forEach(child => {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }
            const filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };
        this.allColsTree.forEach(item => recursivelyCheckFilter(item, false));
    }
    notifyListeners() {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    }
    fireGroupExpandedEvent() {
        const expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    }
    fireSelectionChangedEvent() {
        const selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    }
}
PrimaryColsListPanel.TEMPLATE = `<div class="${PRIMARY_COLS_LIST_PANEL_CLASS}" role="presentation"></div>`;
__decorate$4([
    Autowired('columnModel')
], PrimaryColsListPanel.prototype, "columnModel", void 0);
__decorate$4([
    Autowired('toolPanelColDefService')
], PrimaryColsListPanel.prototype, "colDefService", void 0);
__decorate$4([
    Autowired('modelItemUtils')
], PrimaryColsListPanel.prototype, "modelItemUtils", void 0);
__decorate$4([
    PreDestroy
], PrimaryColsListPanel.prototype, "destroyColumnTree", null);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PivotModePanel extends Component {
    createTemplate() {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }
    init() {
        this.setTemplate(this.createTemplate());
        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));
        this.addManagedListener(this.cbPivotMode, AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }
    onBtPivotMode() {
        const newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(newValue, "toolPanelUi");
            const api = this.gridOptionsService.api;
            if (api) {
                api.refreshHeader();
            }
        }
    }
    onPivotModeChanged() {
        const pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    }
}
__decorate$3([
    Autowired('columnModel')
], PivotModePanel.prototype, "columnModel", void 0);
__decorate$3([
    RefSelector('cbPivotMode')
], PivotModePanel.prototype, "cbPivotMode", void 0);
__decorate$3([
    PreConstruct
], PivotModePanel.prototype, "init", null);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PrimaryColsPanel extends Component {
    constructor() {
        super(PrimaryColsPanel.TEMPLATE);
    }
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    init(allowDragging, params, eventType) {
        this.allowDragging = allowDragging;
        this.params = params;
        this.eventType = eventType;
        this.primaryColsHeaderPanel.init(this.params);
        const hideFilter = this.params.suppressColumnFilter;
        const hideSelect = this.params.suppressColumnSelectAll;
        const hideExpand = this.params.suppressColumnExpandAll;
        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }
        this.addManagedListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
        this.addManagedListener(this.primaryColsListPanel, 'selectionChanged', this.onSelectionChange.bind(this));
        this.primaryColsListPanel.init(this.params, this.allowDragging, this.eventType);
        this.addManagedListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));
        this.positionableFeature = new PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
    }
    toggleResizable(resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
    }
    onExpandAll() {
        this.primaryColsListPanel.doSetExpandedAll(true);
    }
    onCollapseAll() {
        this.primaryColsListPanel.doSetExpandedAll(false);
    }
    expandGroups(groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
    }
    collapseGroups(groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
    }
    setColumnLayout(colDefs) {
        this.primaryColsListPanel.setColumnLayout(colDefs);
    }
    onFilterChanged(event) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    }
    syncLayoutWithGrid() {
        this.primaryColsListPanel.onColumnsChanged();
    }
    onSelectAll() {
        this.primaryColsListPanel.doSetSelectedAll(true);
    }
    onUnselectAll() {
        this.primaryColsListPanel.doSetSelectedAll(false);
    }
    onGroupExpanded(event) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    }
    onSelectionChange(event) {
        this.primaryColsHeaderPanel.setSelectionState(event.state);
    }
}
PrimaryColsPanel.TEMPLATE = `<div class="ag-column-select">
            <ag-primary-cols-header ref="primaryColsHeaderPanel"></ag-primary-cols-header>
            <ag-primary-cols-list ref="primaryColsListPanel"></ag-primary-cols-list>
        </div>`;
__decorate$2([
    RefSelector('primaryColsHeaderPanel')
], PrimaryColsPanel.prototype, "primaryColsHeaderPanel", void 0);
__decorate$2([
    RefSelector('primaryColsListPanel')
], PrimaryColsPanel.prototype, "primaryColsListPanel", void 0);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ColumnToolPanel extends Component {
    constructor() {
        super(ColumnToolPanel.TEMPLATE);
        this.initialised = false;
        this.childDestroyFuncs = [];
    }
    // lazy initialise the panel
    setVisible(visible) {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }
    init(params) {
        const defaultParams = {
            suppressColumnMove: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = Object.assign(Object.assign(Object.assign({}, defaultParams), params), { context: this.gridOptionsService.context });
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new PivotModePanel());
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
            this.appendChild(this.pivotModePanel);
        }
        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new PrimaryColsPanel());
        this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));
        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);
        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                // DO NOT CHANGE TO createManagedBean
                this.rowGroupDropZonePanel = this.createBean(new RowGroupDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.rowGroupDropZonePanel));
                this.appendChild(this.rowGroupDropZonePanel);
            }
            if (!this.params.suppressValues) {
                // DO NOT CHANGE TO createManagedBean
                this.valuesDropZonePanel = this.createBean(new ValuesDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.valuesDropZonePanel));
                this.appendChild(this.valuesDropZonePanel);
            }
            if (!this.params.suppressPivots) {
                // DO NOT CHANGE TO createManagedBean
                this.pivotDropZonePanel = this.createBean(new PivotDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.pivotDropZonePanel));
                this.appendChild(this.pivotDropZonePanel);
            }
            this.setLastVisible();
            const pivotModeListener = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => {
                this.resetChildrenHeight();
                this.setLastVisible();
            });
            this.childDestroyFuncs.push(() => pivotModeListener());
        }
        this.initialised = true;
    }
    setPivotModeSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotModePanel = this.createBean(new PivotModePanel());
            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
        }
        this.setLastVisible();
    }
    setRowGroupsSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.rowGroupDropZonePanel = this.createManagedBean(new RowGroupDropZonePanel(false));
            this.appendChild(this.rowGroupDropZonePanel);
        }
        this.setLastVisible();
    }
    setValuesSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.valuesDropZonePanel = this.createManagedBean(new ValuesDropZonePanel(false));
            this.appendChild(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    }
    setPivotSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotDropZonePanel = this.createManagedBean(new PivotDropZonePanel(false));
            this.appendChild(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    }
    setResizers() {
        [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel
        ].forEach(panel => {
            if (!panel) {
                return;
            }
            const eGui = panel.getGui();
            panel.toggleResizable(!eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden'));
        });
    }
    setLastVisible() {
        const eGui = this.getGui();
        const columnDrops = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));
        columnDrops.forEach(columnDrop => columnDrop.classList.remove('ag-last-column-drop'));
        const columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        const lastVisible = _.last(columnDropEls);
        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }
        this.setResizers();
    }
    resetChildrenHeight() {
        const eGui = this.getGui();
        const children = eGui.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    }
    isRowGroupingModuleLoaded() {
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping', this.context.getGridId());
    }
    expandColumnGroups(groupIds) {
        this.primaryColsPanel.expandGroups(groupIds);
    }
    collapseColumnGroups(groupIds) {
        this.primaryColsPanel.collapseGroups(groupIds);
    }
    setColumnLayout(colDefs) {
        this.primaryColsPanel.setColumnLayout(colDefs);
    }
    syncLayoutWithGrid() {
        this.primaryColsPanel.syncLayoutWithGrid();
    }
    destroyChildren() {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    }
    refresh() {
        this.destroyChildren();
        this.init(this.params);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    destroy() {
        this.destroyChildren();
        super.destroy();
    }
}
ColumnToolPanel.TEMPLATE = `<div class="ag-column-panel"></div>`;
__decorate$1([
    Autowired("gridApi")
], ColumnToolPanel.prototype, "gridApi", void 0);
__decorate$1([
    Autowired("columnApi")
], ColumnToolPanel.prototype, "columnApi", void 0);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ModelItemUtils = class ModelItemUtils {
    selectAllChildren(colTree, selectAllChecked, eventType) {
        const cols = this.extractAllLeafColumns(colTree);
        this.setAllColumns(cols, selectAllChecked, eventType);
    }
    setColumn(col, selectAllChecked, eventType) {
        this.setAllColumns([col], selectAllChecked, eventType);
    }
    setAllColumns(cols, selectAllChecked, eventType) {
        if (this.columnModel.isPivotMode()) {
            this.setAllPivot(cols, selectAllChecked, eventType);
        }
        else {
            this.setAllVisible(cols, selectAllChecked, eventType);
        }
    }
    extractAllLeafColumns(allItems) {
        const res = [];
        const recursiveFunc = (items) => {
            items.forEach(item => {
                if (!item.isPassesFilter()) {
                    return;
                }
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
                else {
                    res.push(item.getColumn());
                }
            });
        };
        recursiveFunc(allItems);
        return res;
    }
    setAllVisible(columns, visible, eventType) {
        const colStateItems = [];
        columns.forEach(col => {
            if (col.getColDef().lockVisible) {
                return;
            }
            if (col.isVisible() != visible) {
                colStateItems.push({
                    colId: col.getId(),
                    hide: !visible
                });
            }
        });
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    }
    setAllPivot(columns, value, eventType) {
        if (this.gridOptionsService.is('functionsPassive')) {
            this.setAllPivotPassive(columns, value);
        }
        else {
            this.setAllPivotActive(columns, value, eventType);
        }
    }
    setAllPivotPassive(columns, value) {
        const copyOfPivotColumns = this.columnModel.getPivotColumns().slice();
        const copyOfValueColumns = this.columnModel.getValueColumns().slice();
        const copyOfRowGroupColumns = this.columnModel.getRowGroupColumns().slice();
        let pivotChanged = false;
        let valueChanged = false;
        let rowGroupChanged = false;
        const turnOnAction = (col) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                copyOfValueColumns.push(col);
                valueChanged = true;
            }
            else if (col.isAllowRowGroup()) {
                copyOfRowGroupColumns.push(col);
                pivotChanged = true;
            }
            else if (col.isAllowPivot()) {
                copyOfPivotColumns.push(col);
                rowGroupChanged = true;
            }
        };
        const turnOffAction = (col) => {
            if (!col.isAnyFunctionActive()) {
                return;
            }
            if (copyOfPivotColumns.indexOf(col) >= 0) {
                _.removeFromArray(copyOfPivotColumns, col);
                pivotChanged = true;
            }
            if (copyOfValueColumns.indexOf(col) >= 0) {
                _.removeFromArray(copyOfValueColumns, col);
                valueChanged = true;
            }
            if (copyOfRowGroupColumns.indexOf(col) >= 0) {
                _.removeFromArray(copyOfRowGroupColumns, col);
                rowGroupChanged = true;
            }
        };
        const action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (pivotChanged) {
            const event = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: copyOfPivotColumns
            };
            this.eventService.dispatchEvent(event);
        }
        if (rowGroupChanged) {
            const event = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }
        if (valueChanged) {
            const event = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: copyOfRowGroupColumns
            };
            this.eventService.dispatchEvent(event);
        }
    }
    setAllPivotActive(columns, value, eventType) {
        const colStateItems = [];
        const turnOnAction = (col) => {
            // don't change any column that's already got a function active
            if (col.isAnyFunctionActive()) {
                return;
            }
            if (col.isAllowValue()) {
                const aggFunc = typeof col.getAggFunc() === 'string'
                    ? col.getAggFunc()
                    : this.aggFuncService.getDefaultAggFunc(col);
                colStateItems.push({
                    colId: col.getId(),
                    aggFunc: aggFunc
                });
            }
            else if (col.isAllowRowGroup()) {
                colStateItems.push({
                    colId: col.getId(),
                    rowGroup: true
                });
            }
            else if (col.isAllowPivot()) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: true
                });
            }
        };
        const turnOffAction = (col) => {
            const isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
            if (isActive) {
                colStateItems.push({
                    colId: col.getId(),
                    pivot: false,
                    rowGroup: false,
                    aggFunc: null
                });
            }
        };
        const action = value ? turnOnAction : turnOffAction;
        columns.forEach(action);
        if (colStateItems.length > 0) {
            this.columnModel.applyColumnState({ state: colStateItems }, eventType);
        }
    }
};
__decorate([
    Autowired('aggFuncService')
], ModelItemUtils.prototype, "aggFuncService", void 0);
__decorate([
    Autowired('columnModel')
], ModelItemUtils.prototype, "columnModel", void 0);
__decorate([
    Autowired('gridOptionsService')
], ModelItemUtils.prototype, "gridOptionsService", void 0);
__decorate([
    Autowired('eventService')
], ModelItemUtils.prototype, "eventService", void 0);
ModelItemUtils = __decorate([
    Bean('modelItemUtils')
], ModelItemUtils);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const ColumnsToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule
    ]
};

export { ColumnsToolPanelModule, PrimaryColsPanel };
