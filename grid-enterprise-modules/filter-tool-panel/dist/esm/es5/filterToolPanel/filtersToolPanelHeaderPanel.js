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
        var translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    };
    FiltersToolPanelHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    };
    FiltersToolPanelHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild(this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService));
    };
    // we only show expand / collapse if we are showing filters
    FiltersToolPanelHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilterSearch = !this.params.suppressFilterSearch;
        var showExpand = !this.params.suppressExpandAll;
        var translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        var isFilterGroupPresent = function (col) { return col.getOriginalParent() && col.isFilterAllowed(); };
        var filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
        _.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        _.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    };
    FiltersToolPanelHeaderPanel.prototype.onSearchTextChanged = function () {
        var _this = this;
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _.debounce(function () {
                _this.dispatchEvent({ type: 'searchChanged', searchText: _this.eFilterTextField.getValue() });
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
        Autowired('columnModel')
    ], FiltersToolPanelHeaderPanel.prototype, "columnModel", void 0);
    __decorate([
        RefSelector('eExpand')
    ], FiltersToolPanelHeaderPanel.prototype, "eExpand", void 0);
    __decorate([
        RefSelector('eFilterTextField')
    ], FiltersToolPanelHeaderPanel.prototype, "eFilterTextField", void 0);
    __decorate([
        PreConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "preConstruct", null);
    __decorate([
        PostConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "postConstruct", null);
    return FiltersToolPanelHeaderPanel;
}(Component));
export { FiltersToolPanelHeaderPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbEhlYWRlclBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZpbHRlclRvb2xQYW5lbC9maWx0ZXJzVG9vbFBhbmVsSGVhZGVyUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBRVQsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsWUFBWSxFQUNaLFdBQVcsRUFFZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE1BQU0sQ0FBTixJQUFZLFlBQW1EO0FBQS9ELFdBQVksWUFBWTtJQUFHLHVEQUFRLENBQUE7SUFBRSx5REFBUyxDQUFBO0lBQUUsaUVBQWEsQ0FBQTtBQUFDLENBQUMsRUFBbkQsWUFBWSxLQUFaLFlBQVksUUFBdUM7QUFFL0Q7SUFBaUQsK0NBQVM7SUFBMUQ7O0lBMkZBLENBQUM7SUF6RVcsa0RBQVksR0FBcEI7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FDdkIseVNBR08sQ0FDVixDQUFDO0lBQ04sQ0FBQztJQUdNLG1EQUFhLEdBQXBCO1FBQ0ksSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBRXJHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJ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