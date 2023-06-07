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
import { _, AgCheckbox, Autowired, Column, Component, CssClassApplier, DragAndDropService, DragSourceType, Events, KeyCode, PostConstruct, RefSelector, TouchListener } from "@ag-grid-community/core";
import { ColumnModelItem } from "./columnModelItem";
import { ToolPanelContextMenu } from "./toolPanelContextMenu";
var ToolPanelColumnGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelColumnGroupComp, _super);
    function ToolPanelColumnGroupComp(modelItem, allowDragging, eventType, focusWrapper) {
        var _this = _super.call(this) || this;
        _this.modelItem = modelItem;
        _this.allowDragging = allowDragging;
        _this.eventType = eventType;
        _this.focusWrapper = focusWrapper;
        _this.processingColumnStateChange = false;
        _this.modelItem = modelItem;
        _this.columnGroup = modelItem.getColumnGroup();
        _this.columnDept = modelItem.getDept();
        _this.allowDragging = allowDragging;
        return _this;
    }
    ToolPanelColumnGroupComp.prototype.init = function () {
        var _this = this;
        this.setTemplate(ToolPanelColumnGroupComp.TEMPLATE);
        this.eDragHandle = _.createIconNoSpan('columnDrag', this.gridOptionsService);
        this.eDragHandle.classList.add('ag-drag-handle', 'ag-column-select-column-group-drag-handle');
        var checkboxGui = this.cbSelect.getGui();
        var checkboxInput = this.cbSelect.getInputElement();
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
        var classes = CssClassApplier.getToolPanelClassesFromColDef(this.columnGroup.getColGroupDef(), this.gridOptionsService, null, this.columnGroup);
        classes.forEach(function (c) { return _this.addOrRemoveCssClass(c, true); });
    };
    ToolPanelColumnGroupComp.prototype.getColumns = function () {
        return this.columnGroup.getLeafColumns();
    };
    ToolPanelColumnGroupComp.prototype.setupTooltip = function () {
        var _this = this;
        var colGroupDef = this.columnGroup.getColGroupDef();
        if (!colGroupDef) {
            return;
        }
        var refresh = function () {
            var newTooltipText = colGroupDef.headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelColumnGroupComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'columnToolPanelColumnGroup';
        return res;
    };
    ToolPanelColumnGroupComp.prototype.handleKeyDown = function (e) {
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
    };
    ToolPanelColumnGroupComp.prototype.onContextMenu = function (e) {
        var _this = this;
        var _a = this, columnGroup = _a.columnGroup, gridOptionsService = _a.gridOptionsService;
        if (gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        var contextMenu = this.createBean(new ToolPanelContextMenu(columnGroup, e, this.focusWrapper));
        this.addDestroyFunc(function () {
            if (contextMenu.isAlive()) {
                _this.destroyBean(contextMenu);
            }
        });
    };
    ToolPanelColumnGroupComp.prototype.addVisibilityListenersToAllChildren = function () {
        var _this = this;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            _this.addManagedListener(column, Column.EVENT_VISIBLE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, Column.EVENT_VALUE_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, Column.EVENT_PIVOT_CHANGED, _this.onColumnStateChanged.bind(_this));
            _this.addManagedListener(column, Column.EVENT_ROW_GROUP_CHANGED, _this.onColumnStateChanged.bind(_this));
        });
    };
    ToolPanelColumnGroupComp.prototype.setupDragging = function () {
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
                    column: _this.columnGroup
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
    ToolPanelColumnGroupComp.prototype.createDragItem = function () {
        var visibleState = {};
        this.columnGroup.getLeafColumns().forEach(function (col) {
            visibleState[col.getId()] = col.isVisible();
        });
        return {
            columns: this.columnGroup.getLeafColumns(),
            visibleState: visibleState
        };
    };
    ToolPanelColumnGroupComp.prototype.setupExpandContract = function () {
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsService, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsService, null));
        this.addManagedListener(this.eGroupClosedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        this.addManagedListener(this.eGroupOpenedIcon, 'click', this.onExpandOrContractClicked.bind(this));
        var touchListener = new TouchListener(this.eColumnGroupIcons, true);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, this.onExpandOrContractClicked.bind(this));
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ToolPanelColumnGroupComp.prototype.onLabelClicked = function () {
        var nextState = !this.cbSelect.getValue();
        this.onChangeCommon(nextState);
    };
    ToolPanelColumnGroupComp.prototype.onCheckboxChanged = function (event) {
        this.onChangeCommon(event.selected);
    };
    ToolPanelColumnGroupComp.prototype.getVisibleLeafColumns = function () {
        var childColumns = [];
        var extractCols = function (children) {
            children.forEach(function (child) {
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
    };
    ToolPanelColumnGroupComp.prototype.onChangeCommon = function (nextState) {
        this.refreshAriaLabel();
        if (this.processingColumnStateChange) {
            return;
        }
        this.modelItemUtils.selectAllChildren(this.modelItem.getChildren(), nextState, this.eventType);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var columnLabel = translate('ariaColumnGroup', 'Column Group');
        var checkboxValue = this.cbSelect.getValue();
        var state = checkboxValue === undefined ?
            translate('ariaIndeterminate', 'indeterminate') :
            (checkboxValue ? translate('ariaVisible', 'visible') : translate('ariaHidden', 'hidden'));
        var visibilityLabel = translate('ariaToggleVisibility', 'Press SPACE to toggle visibility');
        _.setAriaLabel(this.focusWrapper, this.displayName + " " + columnLabel);
        this.cbSelect.setInputAriaLabel(visibilityLabel + " (" + state + ")");
        _.setAriaDescribedBy(this.focusWrapper, this.cbSelect.getInputElement().id);
    };
    ToolPanelColumnGroupComp.prototype.onColumnStateChanged = function () {
        var selectedValue = this.workOutSelectedValue();
        var readOnlyValue = this.workOutReadOnlyValue();
        this.processingColumnStateChange = true;
        this.cbSelect.setValue(selectedValue);
        this.cbSelect.setReadOnly(readOnlyValue);
        this.addOrRemoveCssClass('ag-column-select-column-group-readonly', readOnlyValue);
        this.processingColumnStateChange = false;
    };
    ToolPanelColumnGroupComp.prototype.workOutSelectedValue = function () {
        var _this = this;
        var pivotMode = this.columnModel.isPivotMode();
        var visibleLeafColumns = this.getVisibleLeafColumns();
        var checkedCount = 0;
        var uncheckedCount = 0;
        visibleLeafColumns.forEach(function (column) {
            if (!pivotMode && column.getColDef().lockVisible) {
                return;
            }
            if (_this.isColumnChecked(column, pivotMode)) {
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
    };
    ToolPanelColumnGroupComp.prototype.workOutReadOnlyValue = function () {
        var pivotMode = this.columnModel.isPivotMode();
        var colsThatCanAction = 0;
        this.columnGroup.getLeafColumns().forEach(function (col) {
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
    };
    ToolPanelColumnGroupComp.prototype.isColumnChecked = function (column, pivotMode) {
        if (pivotMode) {
            var pivoted = column.isPivotActive();
            var grouped = column.isRowGroupActive();
            var aggregated = column.isValueActive();
            return pivoted || grouped || aggregated;
        }
        return column.isVisible();
    };
    ToolPanelColumnGroupComp.prototype.onExpandOrContractClicked = function () {
        var oldState = this.modelItem.isExpanded();
        this.modelItem.setExpanded(!oldState);
    };
    ToolPanelColumnGroupComp.prototype.onExpandChanged = function () {
        this.setOpenClosedIcons();
        this.refreshAriaExpanded();
    };
    ToolPanelColumnGroupComp.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.modelItem.isExpanded();
        _.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        _.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    };
    ToolPanelColumnGroupComp.prototype.refreshAriaExpanded = function () {
        _.setAriaExpanded(this.focusWrapper, this.modelItem.isExpanded());
    };
    ToolPanelColumnGroupComp.prototype.getDisplayName = function () {
        return this.displayName;
    };
    ToolPanelColumnGroupComp.prototype.onSelectAllChanged = function (value) {
        var cbValue = this.cbSelect.getValue();
        var readOnly = this.cbSelect.isReadOnly();
        if (!readOnly && ((value && !cbValue) || (!value && cbValue))) {
            this.cbSelect.toggle();
        }
    };
    ToolPanelColumnGroupComp.prototype.isSelected = function () {
        return this.cbSelect.getValue();
    };
    ToolPanelColumnGroupComp.prototype.isSelectable = function () {
        return !this.cbSelect.isReadOnly();
    };
    ToolPanelColumnGroupComp.prototype.setSelected = function (selected) {
        this.cbSelect.setValue(selected, true);
    };
    ToolPanelColumnGroupComp.TEMPLATE = "<div class=\"ag-column-select-column-group\" aria-hidden=\"true\">\n            <span class=\"ag-column-group-icons\" ref=\"eColumnGroupIcons\" >\n                <span class=\"ag-column-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span class=\"ag-column-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n            </span>\n            <ag-checkbox ref=\"cbSelect\" class=\"ag-column-select-checkbox\"></ag-checkbox>\n            <span class=\"ag-column-select-column-label\" ref=\"eLabel\"></span>\n        </div>";
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
    return ToolPanelColumnGroupComp;
}(Component));
export { ToolPanelColumnGroupComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsQ29sdW1uR3JvdXBDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbHVtblRvb2xQYW5lbC90b29sUGFuZWxDb2x1bW5Hcm91cENvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFLTixTQUFTLEVBQ1QsZUFBZSxFQUNmLGtCQUFrQixFQUVsQixjQUFjLEVBQ2QsTUFBTSxFQUVOLE9BQU8sRUFFUCxhQUFhLEVBQ2IsV0FBVyxFQUNYLGFBQWEsRUFFaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFOUQ7SUFBOEMsNENBQVM7SUErQm5ELGtDQUNxQixTQUEwQixFQUMxQixhQUFzQixFQUN0QixTQUEwQixFQUMxQixZQUF5QjtRQUo5QyxZQU1JLGlCQUFPLFNBS1Y7UUFWb0IsZUFBUyxHQUFULFNBQVMsQ0FBaUI7UUFDMUIsbUJBQWEsR0FBYixhQUFhLENBQVM7UUFDdEIsZUFBUyxHQUFULFNBQVMsQ0FBaUI7UUFDMUIsa0JBQVksR0FBWixZQUFZLENBQWE7UUFOdEMsaUNBQTJCLEdBQUcsS0FBSyxDQUFDO1FBU3hDLEtBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLEtBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzlDLEtBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLEtBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOztJQUN2QyxDQUFDO0lBR00sdUNBQUksR0FBWDtRQURBLGlCQTBDQztRQXhDRyxJQUFJLENBQUMs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