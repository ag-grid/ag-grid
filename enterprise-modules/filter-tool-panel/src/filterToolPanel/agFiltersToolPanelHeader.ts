import type { AgComponentSelector, Column, ColumnModel } from '@ag-grid-community/core';
import {
    AgInputTextField,
    Autowired,
    Component,
    Events,
    _createIconNoSpan,
    _debounce,
    _setDisplayed,
} from '@ag-grid-community/core';

import type { ToolPanelFiltersCompParams } from './filtersToolPanel';

export enum EXPAND_STATE {
    EXPANDED,
    COLLAPSED,
    INDETERMINATE,
}

export class AgFiltersToolPanelHeader extends Component {
    static readonly selector: AgComponentSelector = 'AG-FILTERS-TOOL-PANEL-HEADER';

    @Autowired('columnModel') private columnModel: ColumnModel;

    private readonly eExpand: Element = RefPlaceholder;
    private readonly eFilterTextField: AgInputTextField = RefPlaceholder;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private eExpandIndeterminate: Element;

    private onSearchTextChangedDebounced: () => void;

    private currentExpandState: EXPAND_STATE;

    private params: ToolPanelFiltersCompParams;

    public postConstruct(): void {
        this.setTemplate(
            /* html */
            `<div class="ag-filter-toolpanel-search" role="presentation">
                <div data-ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <ag-input-text-field data-ref="eFilterTextField" class="ag-filter-toolpanel-search-input"></ag-input-text-field>
            </div>`,
            [AgInputTextField]
        );

        const translate = this.localeService.getLocaleTextFunc();

        this.eFilterTextField
            .setAutoComplete(false)
            .setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'))
            .onValueChange(this.onSearchTextChanged.bind(this));

        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.params = params;

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
    }

    // we only show expand / collapse if we are showing filters
    private showOrHideOptions(): void {
        const showFilterSearch = !this.params.suppressFilterSearch;
        const showExpand = !this.params.suppressExpandAll;
        const translate = this.localeService.getLocaleTextFunc();

        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));

        const isFilterGroupPresent = (col: Column) => col.getOriginalParent() && col.isFilterAllowed();
        const filterGroupsPresent = this.columnModel.getCols().some(isFilterGroupPresent);

        _setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        _setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    }

    private onSearchTextChanged(): void {
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _debounce(() => {
                this.dispatchEvent({ type: 'searchChanged', searchText: this.eFilterTextField.getValue() });
            }, 300);
        }

        this.onSearchTextChangedDebounced();
    }

    private onExpandClicked(): void {
        const event =
            this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchEvent(event);
    }

    public setExpandState(state: EXPAND_STATE): void {
        this.currentExpandState = state;

        _setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        _setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        _setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    }
}
