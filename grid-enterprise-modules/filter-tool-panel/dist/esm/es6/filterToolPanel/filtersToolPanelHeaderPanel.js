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
export class FiltersToolPanelHeaderPanel extends Component {
    preConstruct() {
        this.setTemplate(/* html */ `<div class="ag-filter-toolpanel-search" role="presentation">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`);
    }
    postConstruct() {
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }
    init(params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }
    createExpandIcons() {
        this.eExpand.appendChild(this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService));
    }
    // we only show expand / collapse if we are showing filters
    showOrHideOptions() {
        const showFilterSearch = !this.params.suppressFilterSearch;
        const showExpand = !this.params.suppressExpandAll;
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        const isFilterGroupPresent = (col) => col.getOriginalParent() && col.isFilterAllowed();
        const filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
        _.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        _.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    }
    onSearchTextChanged() {
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _.debounce(() => {
                this.dispatchEvent({ type: 'searchChanged', searchText: this.eFilterTextField.getValue() });
            }, 300);
        }
        this.onSearchTextChangedDebounced();
    }
    onExpandClicked() {
        const event = this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchEvent(event);
    }
    setExpandState(state) {
        this.currentExpandState = state;
        _.setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbEhlYWRlclBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZpbHRlclRvb2xQYW5lbC9maWx0ZXJzVG9vbFBhbmVsSGVhZGVyUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBRVQsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsWUFBWSxFQUNaLFdBQVcsRUFFZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE1BQU0sQ0FBTixJQUFZLFlBQW1EO0FBQS9ELFdBQVksWUFBWTtJQUFHLHVEQUFRLENBQUE7SUFBRSx5REFBUyxDQUFBO0lBQUUsaUVBQWEsQ0FBQTtBQUFDLENBQUMsRUFBbkQsWUFBWSxLQUFaLFlBQVksUUFBdUM7QUFFL0QsTUFBTSxPQUFPLDJCQUE0QixTQUFRLFNBQVM7SUFrQjlDLFlBQVk7UUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQ3ZCOzs7bUJBR08sQ0FDVixDQUFDO0lBQ04sQ0FBQztJQUdNLGFBQWE7UUFDaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBRXJHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJ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