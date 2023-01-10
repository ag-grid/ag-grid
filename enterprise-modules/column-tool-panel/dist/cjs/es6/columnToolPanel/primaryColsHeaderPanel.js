"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryColsHeaderPanel = exports.ExpandState = void 0;
const core_1 = require("@ag-grid-community/core");
var ExpandState;
(function (ExpandState) {
    ExpandState[ExpandState["EXPANDED"] = 0] = "EXPANDED";
    ExpandState[ExpandState["COLLAPSED"] = 1] = "COLLAPSED";
    ExpandState[ExpandState["INDETERMINATE"] = 2] = "INDETERMINATE";
})(ExpandState = exports.ExpandState || (exports.ExpandState = {}));
class PrimaryColsHeaderPanel extends core_1.Component {
    constructor() {
        super(PrimaryColsHeaderPanel.TEMPLATE);
    }
    postConstruct() {
        this.createExpandIcons();
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eExpand, 'keydown', (e) => {
            if (e.key === core_1.KeyCode.SPACE) {
                this.onExpandClicked();
            }
        });
        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));
        this.eFilterTextField.onValueChange(() => this.onFilterTextChanged());
        this.addManagedListener(this.eFilterTextField.getInputElement(), 'keypress', this.onMiniFilterKeyPress.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
        const translate = this.localeService.getLocaleTextFunc();
        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle Select All Columns'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
    }
    init(params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }
    createExpandIcons() {
        this.eExpand.appendChild((this.eExpandChecked = core_1._.createIconNoSpan('columnSelectOpen', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandUnchecked = core_1._.createIconNoSpan('columnSelectClosed', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandIndeterminate = core_1._.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService)));
        this.setExpandState(ExpandState.EXPANDED);
    }
    // we only show expand / collapse if we are showing columns
    showOrHideOptions() {
        const showFilter = !this.params.suppressColumnFilter;
        const showSelect = !this.params.suppressColumnSelectAll;
        const showExpand = !this.params.suppressColumnExpandAll;
        const groupsPresent = this.columnModel.isPrimaryColumnGroupsPresent();
        const translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        core_1._.setDisplayed(this.eFilterTextField.getGui(), showFilter);
        core_1._.setDisplayed(this.eSelect.getGui(), showSelect);
        core_1._.setDisplayed(this.eExpand, showExpand && groupsPresent);
    }
    onFilterTextChanged() {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = core_1._.debounce(() => {
                const filterText = this.eFilterTextField.getValue();
                this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
        this.onFilterTextChangedDebounced();
    }
    onMiniFilterKeyPress(e) {
        if (e.key === core_1.KeyCode.ENTER) {
            // we need to add a delay that corresponds to the filter text debounce delay to ensure
            // the text filtering has happened, otherwise all columns will be deselected
            setTimeout(() => this.onSelectClicked(), PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
    }
    onSelectClicked() {
        this.dispatchEvent({ type: this.selectState ? 'unselectAll' : 'selectAll' });
    }
    onExpandClicked() {
        this.dispatchEvent({ type: this.expandState === ExpandState.EXPANDED ? 'collapseAll' : 'expandAll' });
    }
    setExpandState(state) {
        this.expandState = state;
        core_1._.setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        core_1._.setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        core_1._.setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    }
    setSelectionState(state) {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
PrimaryColsHeaderPanel.DEBOUNCE_DELAY = 300;
PrimaryColsHeaderPanel.TEMPLATE = `<div class="ag-column-select-header" role="presentation" tabindex="-1">
            <div ref="eExpand" class="ag-column-select-header-icon" tabindex="0"></div>
            <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
        </div>`;
__decorate([
    core_1.Autowired('columnModel')
], PrimaryColsHeaderPanel.prototype, "columnModel", void 0);
__decorate([
    core_1.RefSelector('eExpand')
], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
__decorate([
    core_1.RefSelector('eSelect')
], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
__decorate([
    core_1.RefSelector('eFilterTextField')
], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
__decorate([
    core_1.PostConstruct
], PrimaryColsHeaderPanel.prototype, "postConstruct", null);
exports.PrimaryColsHeaderPanel = PrimaryColsHeaderPanel;
