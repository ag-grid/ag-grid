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
import { _, Autowired, Component, Events, PostConstruct, PreConstruct, RefSelector } from "@ag-grid-community/core";
export var EXPAND_STATE;
(function (EXPAND_STATE) {
    EXPAND_STATE[EXPAND_STATE["EXPANDED"] = 0] = "EXPANDED";
    EXPAND_STATE[EXPAND_STATE["COLLAPSED"] = 1] = "COLLAPSED";
    EXPAND_STATE[EXPAND_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(EXPAND_STATE || (EXPAND_STATE = {}));
var FiltersToolPanelHeaderPanel = /** @class */ (function (_super) {
    __extends(FiltersToolPanelHeaderPanel, _super);
    function FiltersToolPanelHeaderPanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FiltersToolPanelHeaderPanel.prototype.preConstruct = function () {
        this.setTemplate(/* html */ "<div class=\"ag-filter-toolpanel-search\" role=\"presentation\">\n                <div ref=\"eExpand\" class=\"ag-filter-toolpanel-expand\"></div>\n                <ag-input-text-field ref=\"eFilterTextField\" class=\"ag-filter-toolpanel-search-input\"></ag-input-text-field>\n            </div>");
    };
    FiltersToolPanelHeaderPanel.prototype.postConstruct = function () {
        this.eSearchTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    };
    FiltersToolPanelHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnController.isReady()) {
            this.showOrHideOptions();
        }
    };
    FiltersToolPanelHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild(this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsWrapper));
    };
    // we only show expand / collapse if we are showing filters
    FiltersToolPanelHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilterSearch = !this.params.suppressFilterSearch;
        var showExpand = !this.params.suppressExpandAll;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eSearchTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        var isFilterGroupPresent = function (col) { return col.getOriginalParent() && col.isFilterAllowed(); };
        var filterGroupsPresent = this.columnController.getAllGridColumns().some(isFilterGroupPresent);
        _.setDisplayed(this.eSearchTextField.getGui(), showFilterSearch);
        _.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    };
    FiltersToolPanelHeaderPanel.prototype.onSearchTextChanged = function () {
        var _this = this;
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _.debounce(function () {
                _this.dispatchEvent({ type: 'searchChanged', searchText: _this.eSearchTextField.getValue() });
            }, 300);
        }
        this.onSearchTextChangedDebounced();
    };
    FiltersToolPanelHeaderPanel.prototype.onExpandClicked = function () {
        var event = this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchEvent(event);
    };
    FiltersToolPanelHeaderPanel.prototype.setExpandState = function (state) {
        this.currentExpandState = state;
        _.setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], FiltersToolPanelHeaderPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], FiltersToolPanelHeaderPanel.prototype, "columnController", void 0);
    __decorate([
        RefSelector('eExpand')
    ], FiltersToolPanelHeaderPanel.prototype, "eExpand", void 0);
    __decorate([
        RefSelector('eFilterTextField')
    ], FiltersToolPanelHeaderPanel.prototype, "eSearchTextField", void 0);
    __decorate([
        PreConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "preConstruct", null);
    __decorate([
        PostConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "postConstruct", null);
    return FiltersToolPanelHeaderPanel;
}(Component));
export { FiltersToolPanelHeaderPanel };
