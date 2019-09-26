// ag-grid-enterprise v21.2.2
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid-community/main");
var SELECTED_STATE;
(function (SELECTED_STATE) {
    SELECTED_STATE[SELECTED_STATE["CHECKED"] = 0] = "CHECKED";
    SELECTED_STATE[SELECTED_STATE["UNCHECKED"] = 1] = "UNCHECKED";
    SELECTED_STATE[SELECTED_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(SELECTED_STATE = exports.SELECTED_STATE || (exports.SELECTED_STATE = {}));
var PrimaryColsHeaderPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsHeaderPanel, _super);
    function PrimaryColsHeaderPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.expandState = SELECTED_STATE.CHECKED;
        _this.selectState = SELECTED_STATE.CHECKED;
        return _this;
    }
    PrimaryColsHeaderPanel.prototype.preConstruct = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.setTemplate("<div class=\"ag-primary-cols-header-panel\" role=\"presentation\">\n            <div ref=\"eExpand\"></div>\n            <div ref=\"eSelect\"></div>\n            <div class=\"ag-input-wrapper ag-primary-cols-filter-wrapper\" ref=\"eFilterWrapper\" role=\"presentation\">\n                <input class=\"ag-primary-cols-filter\" ref=\"eFilterTextField\" type=\"text\" placeholder=\"" + translate('filterOoo', 'Filter...') + "\">        \n            </div>\n        </div>");
    };
    PrimaryColsHeaderPanel.prototype.postConstruct = function () {
        this.addEventListeners();
        this.createExpandIcons();
        this.createCheckIcons();
        this.setExpandState(SELECTED_STATE.CHECKED);
        this.addDestroyableEventListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eSelect, 'click', this.onSelectClicked.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', this.onFilterTextChanged.bind(this));
    };
    PrimaryColsHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnController.isReady()) {
            this.setColumnsCheckedState();
            this.showOrHideOptions();
        }
    };
    PrimaryColsHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild(this.eExpandChecked = main_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandUnchecked = main_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandIndeterminate = main_1._.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsWrapper));
    };
    PrimaryColsHeaderPanel.prototype.createCheckIcons = function () {
        this.eSelect.appendChild(this.eSelectChecked = main_1._.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper));
        this.eSelect.appendChild(this.eSelectUnchecked = main_1._.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper));
        this.eSelect.appendChild(this.eSelectIndeterminate = main_1._.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper));
    };
    // we only show expand / collapse if we are showing columns
    PrimaryColsHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilter = !this.params.suppressColumnFilter;
        var showSelect = !this.params.suppressColumnSelectAll;
        var showExpand = !this.params.suppressColumnExpandAll;
        var groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();
        main_1._.setDisplayed(this.eFilterWrapper, showFilter);
        main_1._.setDisplayed(this.eSelect, showSelect);
        main_1._.setDisplayed(this.eExpand, showExpand && groupsPresent);
    };
    PrimaryColsHeaderPanel.prototype.addEventListeners = function () {
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
    PrimaryColsHeaderPanel.prototype.onFilterTextChanged = function () {
        var _this = this;
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = main_1._.debounce(function () {
                var filterText = _this.eFilterTextField.value;
                _this.dispatchEvent({ type: 'filterChanged', filterText: filterText });
            }, 400);
        }
        this.onFilterTextChangedDebounced();
    };
    PrimaryColsHeaderPanel.prototype.onSelectClicked = function () {
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
    PrimaryColsHeaderPanel.prototype.onExpandClicked = function () {
        if (this.expandState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({ type: 'collapseAll' });
        }
        else {
            this.dispatchEvent({ type: 'expandAll' });
        }
    };
    PrimaryColsHeaderPanel.prototype.setExpandState = function (state) {
        this.expandState = state;
        main_1._.setDisplayed(this.eExpandChecked, this.expandState === SELECTED_STATE.CHECKED);
        main_1._.setDisplayed(this.eExpandUnchecked, this.expandState === SELECTED_STATE.UNCHECKED);
        main_1._.setDisplayed(this.eExpandIndeterminate, this.expandState === SELECTED_STATE.INDETERMINATE);
    };
    PrimaryColsHeaderPanel.prototype.setColumnsCheckedState = function () {
        var allPrimaryColumns = this.columnController.getAllPrimaryColumns();
        var columns = [];
        if (allPrimaryColumns !== null) {
            columns = allPrimaryColumns.filter(function (col) { return !col.getColDef().lockVisible; });
        }
        var pivotMode = this.columnController.isPivotMode();
        var checkedCount = 0;
        var uncheckedCount = 0;
        columns.forEach(function (col) {
            // ignore lock visible columns
            if (col.getColDef().lockVisible) {
                return;
            }
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
            this.selectState = SELECTED_STATE.INDETERMINATE;
        }
        else if (uncheckedCount > 0) {
            this.selectState = SELECTED_STATE.UNCHECKED;
        }
        else {
            this.selectState = SELECTED_STATE.CHECKED;
        }
        main_1._.setDisplayed(this.eSelectChecked, this.selectState === SELECTED_STATE.CHECKED);
        main_1._.setDisplayed(this.eSelectUnchecked, this.selectState === SELECTED_STATE.UNCHECKED);
        main_1._.setDisplayed(this.eSelectIndeterminate, this.selectState === SELECTED_STATE.INDETERMINATE);
    };
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], PrimaryColsHeaderPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], PrimaryColsHeaderPanel.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], PrimaryColsHeaderPanel.prototype, "eventService", void 0);
    __decorate([
        main_1.RefSelector('eFilterTextField'),
        __metadata("design:type", HTMLInputElement)
    ], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
    __decorate([
        main_1.RefSelector('eExpand'),
        __metadata("design:type", HTMLElement)
    ], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
    __decorate([
        main_1.RefSelector('eSelect'),
        __metadata("design:type", HTMLElement)
    ], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
    __decorate([
        main_1.RefSelector('eFilterWrapper'),
        __metadata("design:type", HTMLElement)
    ], PrimaryColsHeaderPanel.prototype, "eFilterWrapper", void 0);
    __decorate([
        main_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PrimaryColsHeaderPanel.prototype, "preConstruct", null);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PrimaryColsHeaderPanel.prototype, "postConstruct", null);
    return PrimaryColsHeaderPanel;
}(main_1.Component));
exports.PrimaryColsHeaderPanel = PrimaryColsHeaderPanel;
