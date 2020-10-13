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
import { _, AgCheckbox, Autowired, Column, CssClassApplier, DragSourceType, Events, KeyCode, PostConstruct, RefSelector, Component } from "@ag-grid-community/core";
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
        this.setTemplate(ToolPanelColumnComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsWrapper);
        _.addCssClass(this.eDragHandle, 'ag-drag-handle');
        _.addCssClass(this.eDragHandle, 'ag-column-select-column-drag-handle');
        this.cbSelect.getGui().insertAdjacentElement('afterend', this.eDragHandle);
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'toolPanel');
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
        this.addManagedListener(this.gridOptionsWrapper, 'functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        CssClassApplier.addToolPanelClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    ToolPanelColumnComp.prototype.handleKeyDown = function (e) {
        if (e.keyCode === KeyCode.SPACE) {
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
        var state = this.cbSelect.getValue() ? 'visible' : 'hidden';
        _.setAriaLabel(this.focusWrapper, this.displayName + " column toggle visibility (" + state + ")");
    };
    ToolPanelColumnComp.prototype.setupDragging = function () {
        var _this = this;
        if (!this.allowDragging) {
            _.setDisplayed(this.eDragHandle, false);
            return;
        }
        var dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemName: this.displayName,
            getDragItem: function () { return _this.createDragItem(); }
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
        var isPivotMode = this.columnController.isPivotMode();
        if (isPivotMode) {
            // if reducing, checkbox means column is one of pivot, value or group
            var anyFunctionActive = this.column.isAnyFunctionActive();
            this.cbSelect.setValue(anyFunctionActive);
        }
        else {
            // if not reducing, the checkbox tells us if column is visible or not
            this.cbSelect.setValue(this.column.isVisible());
        }
        var checkboxReadOnly;
        if (isPivotMode) {
            // when in pivot mode, the item should be read only if:
            //  a) gui is not allowed make any changes
            var functionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
            //  b) column is not allow any functions on it
            var noFunctionsAllowed = !this.column.isAnyFunctionAllowed();
            checkboxReadOnly = functionsReadOnly || noFunctionsAllowed;
        }
        else {
            // when in normal mode, the checkbox is read only if visibility is locked
            checkboxReadOnly = !!this.column.getColDef().lockVisible;
        }
        this.cbSelect.setReadOnly(checkboxReadOnly);
        _.addOrRemoveCssClass(this.getGui(), 'ag-column-select-column-readonly', checkboxReadOnly);
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
        console.warn('ag-grid: can not expand a column item that does not represent a column group header');
    };
    ToolPanelColumnComp.TEMPLATE = "<div class=\"ag-column-select-column\" aria-hidden=\"true\">\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ToolPanelColumnComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], ToolPanelColumnComp.prototype, "columnController", void 0);
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
