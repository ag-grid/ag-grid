import {
    _,
    Autowired,
    ColumnModel,
    Events,
    RefSelector,
    ToolPanelColumnCompParams,
    AgCheckbox,
    AgInputTextField,
    KeyCode,
    PostConstruct,
    Component
} from "@ag-grid-community/core";

export enum ExpandState { EXPANDED, COLLAPSED, INDETERMINATE }

export class PrimaryColsHeaderPanel extends Component {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    @RefSelector('eExpand') private readonly eExpand: HTMLElement;
    @RefSelector('eSelect') private readonly eSelect: AgCheckbox;
    @RefSelector('eFilterTextField') private eFilterTextField: AgInputTextField;

    private static DEBOUNCE_DELAY = 300;

    private eExpandChecked: HTMLElement;
    private eExpandUnchecked: HTMLElement;
    private eExpandIndeterminate: HTMLElement;

    private expandState: ExpandState;
    private selectState?: boolean;

    private onFilterTextChangedDebounced: () => void;

    private params: ToolPanelColumnCompParams;

    private static TEMPLATE = /* html */
        `<div class="ag-column-select-header" role="presentation">
            <div ref="eExpand" class="ag-column-select-header-icon" tabindex="0"></div>
            <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
        </div>`;

    constructor() {
        super(PrimaryColsHeaderPanel.TEMPLATE);
    }

    @PostConstruct
    protected postConstruct(): void {
        this.createExpandIcons();

        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));

        this.addManagedListener(this.eExpand, 'keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.SPACE) {
                this.onExpandClicked();
            }
        });

        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));

        this.eFilterTextField.onValueChange(() => this.onFilterTextChanged());

        this.addManagedListener(
            this.eFilterTextField.getInputElement(),
            'keypress',
            this.onMiniFilterKeyPress.bind(this)
        );

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));

        const translate = this.localeService.getLocaleTextFunc();

        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle Select All Columns'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
    }

    public init(params: ToolPanelColumnCompParams): void {
        this.params = params;

        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }

    private createExpandIcons() {
        this.eExpand.appendChild((
            this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsService)!
        ));

        this.eExpand.appendChild((
            this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsService)!
        ));

        this.eExpand.appendChild((
            this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService)!
        ));

        this.setExpandState(ExpandState.EXPANDED);
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {
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

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce(() => {
                const filterText = this.eFilterTextField.getValue();
                this.dispatchEvent({ type: "filterChanged", filterText: filterText });
            }, PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }

        this.onFilterTextChangedDebounced();
    }

    private onMiniFilterKeyPress(e: KeyboardEvent): void {
        if (e.key === KeyCode.ENTER) {
            // we need to add a delay that corresponds to the filter text debounce delay to ensure
            // the text filtering has happened, otherwise all columns will be deselected
            setTimeout(() => this.onSelectClicked(), PrimaryColsHeaderPanel.DEBOUNCE_DELAY);
        }
    }

    private onSelectClicked(): void {
        this.dispatchEvent({ type: this.selectState ? 'unselectAll' : 'selectAll' });
    }

    private onExpandClicked(): void {
        this.dispatchEvent({ type: this.expandState === ExpandState.EXPANDED ? 'collapseAll' : 'expandAll' });
    }

    public setExpandState(state: ExpandState): void {
        this.expandState = state;

        _.setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    }

    public setSelectionState(state?: boolean): void {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
