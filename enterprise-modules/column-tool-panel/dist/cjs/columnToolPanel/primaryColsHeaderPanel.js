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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var EXPAND_STATE;
(function (EXPAND_STATE) {
    EXPAND_STATE[EXPAND_STATE["EXPANDED"] = 0] = "EXPANDED";
    EXPAND_STATE[EXPAND_STATE["COLLAPSED"] = 1] = "COLLAPSED";
    EXPAND_STATE[EXPAND_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(EXPAND_STATE = exports.EXPAND_STATE || (exports.EXPAND_STATE = {}));
var SELECTED_STATE;
(function (SELECTED_STATE) {
    SELECTED_STATE[SELECTED_STATE["CHECKED"] = 0] = "CHECKED";
    SELECTED_STATE[SELECTED_STATE["UNCHECKED"] = 1] = "UNCHECKED";
    SELECTED_STATE[SELECTED_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(SELECTED_STATE = exports.SELECTED_STATE || (exports.SELECTED_STATE = {}));
var PrimaryColsHeaderPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsHeaderPanel, _super);
    function PrimaryColsHeaderPanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrimaryColsHeaderPanel.prototype.preConstruct = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.setTemplate("<div class=\"ag-primary-cols-header-panel\" role=\"presentation\">\n                <div ref=\"eExpand\"></div>\n                <div ref=\"eSelect\"></div>\n                <div class=\"ag-input-wrapper ag-primary-cols-filter-wrapper\" ref=\"eFilterWrapper\" role=\"presentation\">\n                    <input class=\"ag-primary-cols-filter\" ref=\"eFilterTextField\" type=\"text\" placeholder=\"" + translate("SearchOoo", "Search...") + "\">\n                </div>\n            </div>");
    };
    PrimaryColsHeaderPanel.prototype.postConstruct = function () {
        this.createExpandIcons();
        if (this.gridOptionsWrapper.useNativeCheckboxes()) {
            this.eSelectCheckbox = document.createElement("input");
            this.eSelectCheckbox.type = "checkbox";
            this.eSelectCheckbox.className = "ag-checkbox";
            this.eSelect.appendChild(this.eSelectCheckbox);
        }
        else {
            this.createCheckIcons();
        }
        this.addDestroyableEventListener(this.eExpand, "click", this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eSelect, "click", this.onSelectClicked.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, "input", this.onFilterTextChanged.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, "keypress", this.onMiniFilterKeyPress.bind(this));
        this.addDestroyableEventListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    };
    PrimaryColsHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnController.isReady()) {
            this.showOrHideOptions();
        }
    };
    PrimaryColsHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild((this.eExpandChecked = core_1._.createIconNoSpan("columnSelectOpen", this.gridOptionsWrapper)));
        this.eExpand.appendChild((this.eExpandUnchecked = core_1._.createIconNoSpan("columnSelectClosed", this.gridOptionsWrapper)));
        this.eExpand.appendChild((this.eExpandIndeterminate = core_1._.createIconNoSpan("columnSelectIndeterminate", this.gridOptionsWrapper)));
    };
    PrimaryColsHeaderPanel.prototype.createCheckIcons = function () {
        this.eSelect.appendChild((this.eSelectChecked = core_1._.createIconNoSpan("checkboxChecked", this.gridOptionsWrapper)));
        this.eSelect.appendChild((this.eSelectUnchecked = core_1._.createIconNoSpan("checkboxUnchecked", this.gridOptionsWrapper)));
        this.eSelect.appendChild((this.eSelectIndeterminate = core_1._.createIconNoSpan("checkboxIndeterminate", this.gridOptionsWrapper)));
    };
    // we only show expand / collapse if we are showing columns
    PrimaryColsHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilter = !this.params.suppressColumnFilter;
        var showSelect = !this.params.suppressColumnSelectAll;
        var showExpand = !this.params.suppressColumnExpandAll;
        var groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();
        core_1._.setDisplayed(this.eFilterWrapper, showFilter);
        core_1._.setDisplayed(this.eSelect, showSelect);
        core_1._.setDisplayed(this.eExpand, showExpand && groupsPresent);
    };
    PrimaryColsHeaderPanel.prototype.onFilterTextChanged = function () {
        var _this = this;
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = core_1._.debounce(function () {
                var filterText = _this.eFilterTextField.value;
                _this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, 300);
        }
        this.onFilterTextChangedDebounced();
    };
    PrimaryColsHeaderPanel.prototype.onMiniFilterKeyPress = function (e) {
        if (core_1._.isKeyPressed(e, core_1.Constants.KEY_ENTER)) {
            this.dispatchEvent({ type: "selectAll" });
        }
    };
    PrimaryColsHeaderPanel.prototype.onSelectClicked = function () {
        var eventType = this.selectState === SELECTED_STATE.CHECKED ? "unselectAll" : "selectAll";
        this.dispatchEvent({ type: eventType });
    };
    PrimaryColsHeaderPanel.prototype.onExpandClicked = function () {
        var eventType = this.expandState === EXPAND_STATE.EXPANDED ? "collapseAll" : "expandAll";
        this.dispatchEvent({ type: eventType });
    };
    PrimaryColsHeaderPanel.prototype.setExpandState = function (state) {
        this.expandState = state;
        core_1._.setDisplayed(this.eExpandChecked, this.expandState === EXPAND_STATE.EXPANDED);
        core_1._.setDisplayed(this.eExpandUnchecked, this.expandState === EXPAND_STATE.COLLAPSED);
        core_1._.setDisplayed(this.eExpandIndeterminate, this.expandState === EXPAND_STATE.INDETERMINATE);
    };
    PrimaryColsHeaderPanel.prototype.setSelectionState = function (state) {
        this.selectState = state;
        if (this.gridOptionsWrapper.useNativeCheckboxes()) {
            this.eSelectCheckbox.checked = this.selectState === SELECTED_STATE.CHECKED;
            this.eSelectCheckbox.indeterminate = this.selectState === SELECTED_STATE.INDETERMINATE;
        }
        else {
            core_1._.setDisplayed(this.eSelectChecked, this.selectState === SELECTED_STATE.CHECKED);
            core_1._.setDisplayed(this.eSelectUnchecked, this.selectState === SELECTED_STATE.UNCHECKED);
            core_1._.setDisplayed(this.eSelectIndeterminate, this.selectState === SELECTED_STATE.INDETERMINATE);
        }
    };
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], PrimaryColsHeaderPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], PrimaryColsHeaderPanel.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('eventService')
    ], PrimaryColsHeaderPanel.prototype, "eventService", void 0);
    __decorate([
        core_1.RefSelector('eExpand')
    ], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
    __decorate([
        core_1.RefSelector('eSelect')
    ], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
    __decorate([
        core_1.RefSelector('eFilterWrapper')
    ], PrimaryColsHeaderPanel.prototype, "eFilterWrapper", void 0);
    __decorate([
        core_1.RefSelector('eFilterTextField')
    ], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
    __decorate([
        core_1.PreConstruct
    ], PrimaryColsHeaderPanel.prototype, "preConstruct", null);
    __decorate([
        core_1.PostConstruct
    ], PrimaryColsHeaderPanel.prototype, "postConstruct", null);
    return PrimaryColsHeaderPanel;
}(core_1.Component));
exports.PrimaryColsHeaderPanel = PrimaryColsHeaderPanel;
//# sourceMappingURL=primaryColsHeaderPanel.js.map