var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Events, RefSelector, KeyCode, PostConstruct, Component } from "@ag-grid-community/core";
export var ExpandState;
(function (ExpandState) {
    ExpandState[ExpandState["EXPANDED"] = 0] = "EXPANDED";
    ExpandState[ExpandState["COLLAPSED"] = 1] = "COLLAPSED";
    ExpandState[ExpandState["INDETERMINATE"] = 2] = "INDETERMINATE";
})(ExpandState || (ExpandState = {}));
export class PrimaryColsHeaderPanel extends Component {
    constructor() {
        super(PrimaryColsHeaderPanel.TEMPLATE);
    }
    postConstruct() {
        this.createExpandIcons();
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eExpand, 'keydown', (e) => {
            if (e.key === KeyCode.SPACE) {
                e.preventDefault();
                this.onExpandClicked();
            }
        });
        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));
        this.eFilterTextField.onValueChange(() => this.onFilterTextChanged());
        this.addManagedListener(this.eFilterTextField.getInputElement(), 'keydown', this.onMiniFilterKeyDown.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
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
        this.eExpand.appendChild((this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService)));
        this.eExpand.appendChild((this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService)));
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
        _.setDisplayed(this.eFilterTextField.getGui(), showFilter);
        _.setDisplayed(this.eSelect.getGui(), showSelect);
        _.setDisplayed(this.eExpand, showExpand && groupsPresent);
    }
    onFilterTextChanged() {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce(() => {
                const filterText = this.eFilterTextField.getValue();
                this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
        this.onFilterTextChangedDebounced();
    }
    onMiniFilterKeyDown(e) {
        if (e.key === KeyCode.ENTER) {
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
        _.setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    }
    setSelectionState(state) {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
PrimaryColsHeaderPanel.DEBOUNCE_DELAY = 300;
PrimaryColsHeaderPanel.TEMPLATE = `<div class="ag-column-select-header" role="presentation">
            <div ref="eExpand" class="ag-column-select-header-icon" tabindex="0"></div>
            <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
        </div>`;
__decorate([
    Autowired('columnModel')
], PrimaryColsHeaderPanel.prototype, "columnModel", void 0);
__decorate([
    RefSelector('eExpand')
], PrimaryColsHeaderPanel.prototype, "eExpand", void 0);
__decorate([
    RefSelector('eSelect')
], PrimaryColsHeaderPanel.prototype, "eSelect", void 0);
__decorate([
    RefSelector('eFilterTextField')
], PrimaryColsHeaderPanel.prototype, "eFilterTextField", void 0);
__decorate([
    PostConstruct
], PrimaryColsHeaderPanel.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWFyeUNvbHNIZWFkZXJQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb2x1bW5Ub29sUGFuZWwvcHJpbWFyeUNvbHNIZWFkZXJQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFFVCxNQUFNLEVBQ04sV0FBVyxFQUlYLE9BQU8sRUFDUCxhQUFhLEVBQ2IsU0FBUyxFQUNaLE1BQU0seUJBQXlCLENBQUM7QUFFakMsTUFBTSxDQUFOLElBQVksV0FBa0Q7QUFBOUQsV0FBWSxXQUFXO0lBQUcscURBQVEsQ0FBQTtJQUFFLHVEQUFTLENBQUE7SUFBRSwrREFBYSxDQUFBO0FBQUMsQ0FBQyxFQUFsRCxXQUFXLEtBQVgsV0FBVyxRQUF1QztBQUU5RCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsU0FBUztJQTJCakQ7UUFDSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUdTLGFBQWE7UUFDbkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO1lBQ2xFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO2dCQUN6QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUMxQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFP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