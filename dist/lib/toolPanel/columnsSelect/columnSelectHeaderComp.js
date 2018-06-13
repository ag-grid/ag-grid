// ag-grid-enterprise v18.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var SELECTED_STATE;
(function (SELECTED_STATE) {
    SELECTED_STATE[SELECTED_STATE["CHECKED"] = 0] = "CHECKED";
    SELECTED_STATE[SELECTED_STATE["UNCHECKED"] = 1] = "UNCHECKED";
    SELECTED_STATE[SELECTED_STATE["INDETERMINIATE"] = 2] = "INDETERMINIATE";
})(SELECTED_STATE = exports.SELECTED_STATE || (exports.SELECTED_STATE = {}));
;
var ColumnSelectHeaderComp = (function (_super) {
    __extends(ColumnSelectHeaderComp, _super);
    function ColumnSelectHeaderComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.expandState = SELECTED_STATE.CHECKED;
        _this.selectState = SELECTED_STATE.CHECKED;
        return _this;
    }
    ColumnSelectHeaderComp.prototype.preConstruct = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.setTemplate("<div class=\"ag-column-select-header\">\n            <div class=\"ag-column-tool-panel\">\n                <a href=\"javascript:void(0)\" (click)=\"onExpandClicked\" ref=\"eExpand\">\n                    <span class=\"ag-icon ag-icon-tree-open\" ref=\"eExpandChecked\"></span>\n                    <span class=\"ag-icon ag-icon-tree-closed\" ref=\"eExpandUnchecked\"></span>\n                    <span class=\"ag-icon ag-icon ag-icon-tree-indeterminate\" ref=\"eExpandIndeterminate\"></span>\n                </a>\n                <a href=\"javascript:void(0)\" class=\"ag-column-tool-panel-item\" (click)=\"onSelectClicked\" ref=\"eSelect\">\n                    <span class=\"ag-icon ag-icon-checkbox-checked\" ref=\"eSelectChecked\"></span>\n                    <span class=\"ag-icon ag-icon-checkbox-unchecked\" ref=\"eSelectUnchecked\"></span>\n                    <span class=\"ag-icon ag-icon-checkbox-indeterminate\" ref=\"eSelectIndeterminate\"></span>\n                </a>\n            </div>\n            <div class=\"ag-filter-body\" ref=\"eFilter\">\n                <input class=\"ag-column-name-filter\" ref=\"eFilterTextField\" type=\"text\" placeholder=\"" + translate('filterOoo', 'Filter...') + "\" (input)=\"onFilterTextChanged\">\n            </div>\n        </div>");
    };
    ColumnSelectHeaderComp.prototype.init = function () {
        this.instantiate(this.context);
        this.addEventListeners();
        if (this.columnController.isReady()) {
            this.setColumnsCheckedState();
            this.showOrHideOptions();
        }
        this.setExpandState(SELECTED_STATE.CHECKED);
    };
    // we only show expand / collapse if we are showing columns
    ColumnSelectHeaderComp.prototype.showOrHideOptions = function () {
        var showFilter = !this.gridOptionsWrapper.isToolPanelSuppressColumnFilter();
        var showSelect = !this.gridOptionsWrapper.isToolPanelSuppressColumnSelectAll();
        var showExpand = !this.gridOptionsWrapper.isToolPanelSuppressColumnExpandAll();
        var groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();
        main_1._.setVisible(this.eFilter, showFilter);
        main_1._.setVisible(this.eSelect, showSelect);
        main_1._.setVisible(this.eExpand, showExpand && groupsPresent);
    };
    ColumnSelectHeaderComp.prototype.addEventListeners = function () {
        var _this = this;
        var eventsImpactingCheckedState = [
            main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            main_1.Events.EVENT_COLUMN_PIVOT_CHANGED,
            main_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            main_1.Events.EVENT_COLUMN_VALUE_CHANGED,
            main_1.Events.EVENT_COLUMN_VISIBLE,
            main_1.Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(function (event) {
            _this.addDestroyableEventListener(_this.eventService, event, _this.setColumnsCheckedState.bind(_this));
        });
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    };
    ColumnSelectHeaderComp.prototype.onFilterTextChanged = function () {
        var _this = this;
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = main_1._.debounce(function () {
                var filterText = _this.eFilterTextField.value;
                _this.dispatchEvent({ type: 'filterChanged', filterText: filterText });
            }, 400);
        }
        this.onFilterTextChangedDebounced();
    };
    ColumnSelectHeaderComp.prototype.onSelectClicked = function () {
        // here we just fire the event. the following happens is the flow of events:
        // 1. event here fired.
        // 2. toolpanel updates the columns.
        // 3. column controller fires events of column updated
        // 4. update in this panel is updated based on events fired by column controller
        if (this.selectState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({ type: 'unselectAll' });
        }
        else {
            this.dispatchEvent({ type: 'selectAll' });
        }
    };
    ColumnSelectHeaderComp.prototype.onExpandClicked = function () {
        if (this.expandState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({ type: 'collapseAll' });
        }
        else {
            this.dispatchEvent({ type: 'expandAll' });
        }
    };
    ColumnSelectHeaderComp.prototype.setExpandState = function (state) {
        this.expandState = state;
        main_1._.setVisible(this.eExpandChecked, this.expandState === SELECTED_STATE.CHECKED);
        main_1._.setVisible(this.eExpandUnchecked, this.expandState === SELECTED_STATE.UNCHECKED);
        main_1._.setVisible(this.eExpandIndeterminate, this.expandState === SELECTED_STATE.INDETERMINIATE);
    };
    ColumnSelectHeaderComp.prototype.setColumnsCheckedState = function () {
        var columns = this.columnController.getAllPrimaryColumns();
        var pivotMode = this.columnController.isPivotMode();
        var checkedCount = 0;
        var uncheckedCount = 0;
        columns.forEach(function (col) {
            // not not count columns not in tool panel
            var colDef = col.getColDef();
            if (colDef && colDef.suppressToolPanel) {
                return;
            }
            var checked;
            if (pivotMode) {
                var noPivotModeOptionsAllowed = !col.isAllowPivot() && !col.isAllowRowGroup() && !col.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = col.isValueActive() || col.isPivotActive() || col.isRowGroupActive();
            }
            else {
                checked = col.isVisible();
            }
            if (checked) {
                checkedCount++;
            }
            else {
                uncheckedCount++;
            }
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            this.selectState = SELECTED_STATE.INDETERMINIATE;
        }
        else if (uncheckedCount > 0) {
            this.selectState = SELECTED_STATE.UNCHECKED;
        }
        else {
            this.selectState = SELECTED_STATE.CHECKED;
        }
        main_1._.setVisible(this.eSelectChecked, this.selectState === SELECTED_STATE.CHECKED);
        main_1._.setVisible(this.eSelectUnchecked, this.selectState === SELECTED_STATE.UNCHECKED);
        main_1._.setVisible(this.eSelectIndeterminate, this.selectState === SELECTED_STATE.INDETERMINIATE);
    };
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], ColumnSelectHeaderComp.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ColumnSelectHeaderComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ColumnSelectHeaderComp.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], ColumnSelectHeaderComp.prototype, "eventService", void 0);
    __decorate([
        main_1.RefSelector('eFilterTextField'),
        __metadata("design:type", HTMLInputElement)
    ], ColumnSelectHeaderComp.prototype, "eFilterTextField", void 0);
    __decorate([
        main_1.RefSelector('eSelectChecked'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eSelectChecked", void 0);
    __decorate([
        main_1.RefSelector('eSelectUnchecked'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eSelectUnchecked", void 0);
    __decorate([
        main_1.RefSelector('eSelectIndeterminate'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eSelectIndeterminate", void 0);
    __decorate([
        main_1.RefSelector('eExpandChecked'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eExpandChecked", void 0);
    __decorate([
        main_1.RefSelector('eExpandUnchecked'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eExpandUnchecked", void 0);
    __decorate([
        main_1.RefSelector('eExpandIndeterminate'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eExpandIndeterminate", void 0);
    __decorate([
        main_1.RefSelector('eExpand'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eExpand", void 0);
    __decorate([
        main_1.RefSelector('eSelect'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eSelect", void 0);
    __decorate([
        main_1.RefSelector('eFilter'),
        __metadata("design:type", HTMLElement)
    ], ColumnSelectHeaderComp.prototype, "eFilter", void 0);
    __decorate([
        main_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ColumnSelectHeaderComp.prototype, "preConstruct", null);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ColumnSelectHeaderComp.prototype, "init", null);
    return ColumnSelectHeaderComp;
}(main_1.Component));
exports.ColumnSelectHeaderComp = ColumnSelectHeaderComp;
