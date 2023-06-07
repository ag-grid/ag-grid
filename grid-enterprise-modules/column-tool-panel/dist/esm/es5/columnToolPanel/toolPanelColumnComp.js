var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
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
        this.addManagedPropertyListener('functionsReadOnly', this.onColumnStateChanged.bind(this));
        this.addManagedListener(this.cbSelect, AgCheckbox.EVENT_CHANGED, this.onCheckboxChanged.bind(this));
        this.addManagedListener(this.eLabel, 'click', this.onLabelClicked.bind(this));
        this.onColumnStateChanged();
        this.refreshAriaLabel();
        this.setupTooltip();
        var classes = CssClassApplier.getToolPanelClassesFromColDef(this.column.getColDef(), this.gridOptionsService, this.column, null);
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
        var _a = this, column = _a.column, gridOptionsService = _a.gridOptionsService;
        if (gridOptionsService.is('functionsReadOnly')) {
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
        if (this.gridOptionsService.is('functionsReadOnly')) {
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
        var translate = this.localeService.getLocaleTextFunc();
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
        var hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
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
            var functionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
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
        var checkboxPassive = isPivotMode && this.gridOptionsService.is('functionsPassive');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29sdW1uQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb2x1bW5Ub29sUGFuZWwvdG9vbFBhbmVsQ29sdW1uQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFVBQVUsRUFDVixTQUFTLEVBQ1QsTUFBTSxFQUlOLFNBQVMsRUFDVCxlQUFlLEVBQ2Ysa0JBQWtCLEVBRWxCLGNBQWMsRUFDZCxNQUFNLEVBRU4sT0FBTyxFQUNQLGFBQWEsRUFDYixXQUFXLEVBRWQsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUU5RDtJQUF5Qyx1Q0FBUztJQW1COUMsNkJBQ3FCLE1BQWMsRUFDZCxVQUFrQixFQUNsQixhQUFzQixFQUN0QixXQUFvQixFQUNwQixZQUF5QjtRQUw5QyxZQU9JLGlCQUFPLFNBQ1Y7UUFQb0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGdCQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLG1CQUFhLEdBQWIsYUFBYSxDQUFTO1FBQ3RCLGlCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLGtCQUFZLEdBQVosWUFBWSxDQUFhO1FBUHRDLGlDQUEyQixHQUFHLEtBQUssQ0FBQzs7SUFVNUMsQ0FBQztJQUdNLGtDQUFJLEdBQVg7UUFEQSxpQkE4Q0M7UUEzQ0csSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUM7UUFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFFeEYs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