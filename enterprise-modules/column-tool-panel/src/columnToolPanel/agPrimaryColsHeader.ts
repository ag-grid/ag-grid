import {
    AgCheckbox,
    AgComponentSelector,
    AgInputTextField,
    Autowired,
    ColumnModel,
    Component,
    Events,
    KeyCode,
    PostConstruct,
    RefPlaceholder,
    _createIconNoSpan,
    _debounce,
    _setDisplayed,
} from '@ag-grid-community/core';

import { ToolPanelColumnCompParams } from './columnToolPanel';

export enum ExpandState {
    EXPANDED,
    COLLAPSED,
    INDETERMINATE,
}

export class AgPrimaryColsHeader extends Component {
    static readonly selector: AgComponentSelector = 'AG-PRIMARY-COLS-HEADER';

    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private readonly eExpand: Element = RefPlaceholder;
    private readonly eSelect: AgCheckbox = RefPlaceholder;
    private readonly eFilterTextField: AgInputTextField = RefPlaceholder;

    private static DEBOUNCE_DELAY = 300;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private eExpandIndeterminate: Element;

    private expandState: ExpandState;
    private selectState?: boolean;

    private onFilterTextChangedDebounced: () => void;

    private params: ToolPanelColumnCompParams;

    private static TEMPLATE /* html */ = `<div class="ag-column-select-header" role="presentation">
            <div data-ref="eExpand" class="ag-column-select-header-icon"></div>
            <ag-checkbox data-ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
            <ag-input-text-field class="ag-column-select-header-filter-wrapper" data-ref="eFilterTextField"></ag-input-text-field>
        </div>`;

    constructor() {
        super(AgPrimaryColsHeader.TEMPLATE, [AgCheckbox, AgInputTextField]);
    }

    @PostConstruct
    protected postConstruct(): void {
        this.createExpandIcons();

        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eExpand, 'keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.SPACE) {
                e.preventDefault();
                this.onExpandClicked();
            }
        });

        this.addManagedListener(this.eSelect.getInputElement(), 'click', this.onSelectClicked.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', () => this.onFunctionsReadOnlyPropChanged());

        this.eFilterTextField.setAutoComplete(false).onValueChange(() => this.onFilterTextChanged());

        this.addManagedListener(
            this.eFilterTextField.getInputElement(),
            'keydown',
            this.onMiniFilterKeyDown.bind(this)
        );

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));

        const translate = this.localeService.getLocaleTextFunc();

        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle Select All Columns'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));

        this.activateTabIndex([this.eExpand]);
    }

    private onFunctionsReadOnlyPropChanged(): void {
        const readOnly = this.gos.get('functionsReadOnly');
        this.eSelect.setReadOnly(readOnly);
        this.eSelect.addOrRemoveCssClass('ag-column-select-column-readonly', readOnly);
    }

    public init(params: ToolPanelColumnCompParams): void {
        this.params = params;

        const readOnly = this.gos.get('functionsReadOnly');
        this.eSelect.setReadOnly(readOnly);
        this.eSelect.addOrRemoveCssClass('ag-column-select-column-readonly', readOnly);

        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    }

    private createExpandIcons() {
        this.eExpand.appendChild((this.eExpandChecked = _createIconNoSpan('columnSelectOpen', this.gos)!));

        this.eExpand.appendChild((this.eExpandUnchecked = _createIconNoSpan('columnSelectClosed', this.gos)!));

        this.eExpand.appendChild(
            (this.eExpandIndeterminate = _createIconNoSpan('columnSelectIndeterminate', this.gos)!)
        );

        this.setExpandState(ExpandState.EXPANDED);
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {
        const showFilter = !this.params.suppressColumnFilter;
        const showSelect = !this.params.suppressColumnSelectAll;
        const showExpand = !this.params.suppressColumnExpandAll;
        const groupsPresent = this.columnModel.isProvidedColGroupsPresent();
        const translate = this.localeService.getLocaleTextFunc();

        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));

        _setDisplayed(this.eFilterTextField.getGui(), showFilter);
        _setDisplayed(this.eSelect.getGui(), showSelect);
        _setDisplayed(this.eExpand, showExpand && groupsPresent);
    }

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _debounce(() => {
                const filterText = this.eFilterTextField.getValue();
                this.dispatchEvent({ type: 'filterChanged', filterText: filterText });
            }, AgPrimaryColsHeader.DEBOUNCE_DELAY);
        }

        this.onFilterTextChangedDebounced();
    }

    private onMiniFilterKeyDown(e: KeyboardEvent): void {
        if (e.key === KeyCode.ENTER) {
            // we need to add a delay that corresponds to the filter text debounce delay to ensure
            // the text filtering has happened, otherwise all columns will be deselected
            setTimeout(() => this.onSelectClicked(), AgPrimaryColsHeader.DEBOUNCE_DELAY);
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

        _setDisplayed(this.eExpandChecked, this.expandState === ExpandState.EXPANDED);
        _setDisplayed(this.eExpandUnchecked, this.expandState === ExpandState.COLLAPSED);
        _setDisplayed(this.eExpandIndeterminate, this.expandState === ExpandState.INDETERMINATE);
    }

    public setSelectionState(state?: boolean): void {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
