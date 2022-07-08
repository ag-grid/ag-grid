var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgCheckbox, Autowired, Column, Component, CssClassApplier, DragAndDropService, DragSourceType, Events, KeyCode, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ToolPanelContextMenu } from "./toolPanelContextMenu";
var ToolPanelColumnComp = /** @class */ (function (_super) {
    __extends(ToolPanelColumnComp, _super);
    function ToolPanelColumnComp(column, columnDept, allowDragging, groupsExist, focusWrapper) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.columnDept = columnDept;
        _this.allowDragging = allowDragging;
        _this.groupsExist = groupsExist;
        _this.focusWrapper = focusWrapper;
        _this.processingColumnStateChange = false;
        return _this;
    }
    ToolPanelColumnComp.prototype.init = function () {
        var _this = this;
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-drag-handle');
        var checkboxGui = this.cbSelect.getGui();
        var checkboxInput = this.cbSelect.getInputElement();
        checkboxGui.insertAdjacentElement('afterend', this.eDragHandle);
        checkboxInput.setAttribute('tabindex', '-1');
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnToolPanel');
        var displayNameSanitised = _.escapeString(this.displayName);
        this.eLabel.innerHTML = displayNameSanitised;
        // if grouping, we add an extra level of indent, to cater for expand/contract icons we need to indent for
        var indent = this.columnDept;
        if (this.groupsExist) {
            this.addCssClass('ag-column-select-add-group-indent');
        }
        this.addCssClass("ag-column-select-indent-" + indent);
        this.setupDragging();
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_VALUE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_PIVOT_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_ROW_GROUP_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.column, Column.EVENT_VISIBLE_CHANGED, this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.focusWrapper, 'keydown', this.handleKeyDown.bind(this));
        this.addManagedListener(this.focusWrapper, 'contextmenu', this.onContextMenu.bind(this));
        this.addManagedListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        this.setupTooltip();
        var classes = CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsWrapper, this.column, null);
        classes.forEach(function (c) { return _this.addOrRemoveCssClass(c, true); });
    };
    ToolPanelColumnComp.prototype.getColumn = function () {
        return this.column;
    };
    ToolPanelColumnComp.prototype.setupTooltip = function () {
        var _this = this;
        var refresh = function () {
            var newTooltipText = _this.column.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelColumnComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'columnToolPanelColumn';
        res.colDef = this.column.getColDef();
        return res;
    };
    ToolPanelColumnComp.prototype.onContextMenu = function (e) {
        var _this = this;
        var _a = this, column = _a.column, gridOptionsWrapper = _a.gridOptionsWrapper;
        if (gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        var contextMenu = this.createBean(new ToolPanelContextMenu(column, e, this.focusWrapper));
        this.addDestroyFunc(function () {
            if (contextMenu.isAlive()) {
                _this.destroyBean(contextMenu);
            }
        });
    };
    ToolPanelColumnComp.prototype.handleKeyDown = function (e) {
        if (e.key === KeyCode.SPACE) {
            e.preventDefault();
            if (this.isSelectable()) {
                this.onSelectAllChanged(!this.isSelected());
            }
        }
    };
    ToolPanelColumnComp.prototype.onLabelClicked = function () {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnComp.prototype.onChangeCommon = function (nextState) {
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
    };
    ToolPanelColumnComp.prototype.refreshAriaLabel = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnLabel = translate('ariaColumn', 'Column');
        var state = this.cbSelect.getValue() ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden');
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabel(this.focusWrapper, this.displayName + " " + columnLabel);
        this.cbSelect.setInputAriaLabel(visibilityLabel + " (" + state + ")");
        _.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    };
    ToolPanelColumnComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            _.setDisplayed(this.eDragHandle, false);
            return;
        }
        var hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns();
        var dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            defaultIconName: hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: function () { return _this.createDragItem(); },
            onDragStarted: function () {
                var event = {
                    type: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_START,
                    column: _this.column
                };
                _this.eventService.dispatchEvent(event);
            },
            onDragStopped: function () {
                var event = {
                    type: Events.EVENT_COLUMN_PANEL_ITEM_DRAG_END
                };
                _this.eventService.dispatchEvent(event);
            },
            onGridEnter: function () {
                if (hideColumnOnExit) {
                    // when dragged into the grid, mimic what happens when checkbox is enabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(true);
                }
            },
            onGridExit: function () {
                if (hideColumnOnExit) {
                    // when dragged outside of the grid, mimic what happens when checkbox is disabled
                    // this handles the behaviour for pivot which is different to just hiding a column.
                    _this.onChangeCommon(false);
                }
            }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ToolPanelColumnComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    ToolPanelColumnComp.prototype.onColumnStateChanged = function () {
        this.processingColumnStateChange = true;
        var isPivotMode = this.columnModel.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            var anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
        }
        var canBeToggled = true;
        var canBeDragged = true;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            var functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            var noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            canBeToggled = !functionsReadOnly && !noFunctionsAllowed;
            canBeDragged = canBeToggled;
        }
        else {
            var _a = this.column.getColDef(), enableRowGroup = _a.enableRowGroup, enableValue = _a.enableValue, lockPosition = _a.lockPosition, suppressMovable = _a.suppressMovable, lockVisible = _a.lockVisible;
            var forceDraggable = !!enableRowGroup || !!enableValue;
            var disableDraggable = !!lockPosition || !!suppressMovable;
            canBeToggled = !lockVisible;
            canBeDragged = forceDraggable || !disableDraggable;
        }
        this.cbSelect.setReadOnly(!canBeToggled);
        this.eDragHandle.classList.toggle('ag-column-select-column-readonly', !canBeDragged);
        this.addOrRemoveCssClass('ag-column-select-column-readonly', !canBeDragged && !canBeToggled);
        var checkboxPassive = isPivotMode && this.gridOptionsWrapper.isFunctionsPassive();
        this.cbSelect.setPassive(checkboxPassive);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnComp.prototype.onSelectAllChanged = function (value) {
        if (value !== this.cbSelect.getValue()) {
            if (!this.cbSelect.isReadOnly()) {
                this.cbSelect.toggle();
            }
        }
    };
    ToolPanelColumnComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnComp.prototype.isExpandable = function () {
        return false;
    };
    ToolPanelColumnComp.prototype.setExpanded = function (value) {
        console.warn('AG Grid: can not expand a column item that does not represent a column group header');
    };
    ToolPanelColumnComp.TEMPLATE = "<div class=\"ag-column-select-column\" aria-hidden=\"true\">\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
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
    return ToolPanelColumnComp;
}(Component));
export { ToolPanelColumnComp };
