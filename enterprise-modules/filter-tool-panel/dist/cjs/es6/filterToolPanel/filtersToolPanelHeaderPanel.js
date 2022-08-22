"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
var EXPAND_STATE;
(function (EXPAND_STATE) {
    EXPAND_STATE[EXPAND_STATE["EXPANDED"] = 0] = "EXPANDED";
    EXPAND_STATE[EXPAND_STATE["COLLAPSED"] = 1] = "COLLAPSED";
    EXPAND_STATE[EXPAND_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(EXPAND_STATE = exports.EXPAND_STATE || (exports.EXPAND_STATE = {}));
class FiltersToolPanelHeaderPanel extends core_1.Component {
    preConstruct() {
        this.setTemplate(/* html */ `<div class="ag-filter-toolpanel-search" role="presentation">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`);
    }
    postConstruct() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eFilterTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }
    init(params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }
    createExpandIcons() {
        this.eExpand.appendChild(this.eExpandChecked = core_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandUnchecked = core_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandIndeterminate = core_1._.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsWrapper));
    }
    // we only show expand / collapse if we are showing filters
    showOrHideOptions() {
        const showFilterSearch = !this.params.suppressFilterSearch;
        const showExpand = !this.params.suppressExpandAll;
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        const isFilterGroupPresent = (col) => col.getOriginalParent() && col.isFilterAllowed();
        const filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
        core_1._.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        core_1._.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    }
    onSearchTextChanged() {
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = core_1._.debounce(() => {
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
        core_1._.setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        core_1._.setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        core_1._.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    }
}
__decorate([
    core_1.Autowired('columnModel')
], FiltersToolPanelHeaderPanel.prototype, "columnModel", void 0);
__decorate([
    core_1.RefSelector('eExpand')
], FiltersToolPanelHeaderPanel.prototype, "eExpand", void 0);
__decorate([
    core_1.RefSelector('eFilterTextField')
], FiltersToolPanelHeaderPanel.prototype, "eFilterTextField", void 0);
__decorate([
    core_1.PreConstruct
], FiltersToolPanelHeaderPanel.prototype, "preConstruct", null);
__decorate([
    core_1.PostConstruct
], FiltersToolPanelHeaderPanel.prototype, "postConstruct", null);
exports.FiltersToolPanelHeaderPanel = FiltersToolPanelHeaderPanel;
