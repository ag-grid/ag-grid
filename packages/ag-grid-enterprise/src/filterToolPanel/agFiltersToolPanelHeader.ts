import {
    RefPlaceholder,
    _addManagedElementListeners,
    _debounce,
    _setAriaExpanded,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-stack';

import type { AgEvent, ComponentSelector, ElementParams, GridInputTextField } from 'ag-grid-community';
import { AgInputTextFieldSelector, Component, _createIconNoSpan } from 'ag-grid-community';

import type { ToolPanelFiltersCompParams } from './filtersToolPanel';

export enum EXPAND_STATE {
    EXPANDED,
    COLLAPSED,
    INDETERMINATE,
    NO_GROUPS,
}
type AgFiltersToolPanelHeaderEvent = 'collapseAll' | 'expandAll' | 'searchChanged';

const AgFiltersToolPanelHeaderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-toolpanel-search',
    role: 'presentation',
    children: [
        {
            tag: 'button',
            ref: 'eExpand',
            cls: 'ag-button ag-filter-toolpanel-expand',
            attrs: { type: 'button' },
        },
        {
            tag: 'ag-input-text-field',
            ref: 'eFilterTextField',
            cls: 'ag-filter-toolpanel-search-input',
        },
    ],
};
export class AgFiltersToolPanelHeader extends Component<AgFiltersToolPanelHeaderEvent> {
    private readonly eExpand: Element = RefPlaceholder;
    private readonly eFilterTextField: GridInputTextField = RefPlaceholder;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private eExpandIndeterminate: Element;

    private onSearchTextChangedDebounced: () => ReturnType<typeof setTimeout>;
    private searchTextChangedTimeout: ReturnType<typeof setTimeout> | undefined;

    private currentExpandState: EXPAND_STATE;

    private params: ToolPanelFiltersCompParams;

    public postConstruct(): void {
        this.setTemplate(AgFiltersToolPanelHeaderElement, [AgInputTextFieldSelector]);

        const translate = this.getLocaleTextFunc();

        this.eFilterTextField
            .setClearButtonEnabled(true)
            .setSearchIcon(true)
            .setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'))
            .onValueChange(this.onSearchTextChanged.bind(this))
            .onValueClear(() => this.onSearchTextCleared());

        _setAriaLabel(this.eExpand, translate('ariaFilterPanelExpandAll', 'Expand All Filter Groups'));
        this.activateTabIndex([this.eExpand]);
        this.createExpandIcons();
        _setDisplayed(this.eExpand, false);
        _addManagedElementListeners(this, this.eExpand, { click: this.onExpandClicked.bind(this) });
        this.addManagedEventListeners({ newColumnsLoaded: this.showOrHideOptions.bind(this) });
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.params = params;
        this.eFilterTextField.setAutoComplete(params.browserAutoComplete);

        if (this.beans.colModel.ready) {
            this.showOrHideOptions();
        }
    }

    private createExpandIcons() {
        const { eExpand, beans } = this;
        eExpand.appendChild((this.eExpandChecked = _createIconNoSpan('accordionOpen', beans)!));
        eExpand.appendChild((this.eExpandUnchecked = _createIconNoSpan('accordionClosed', beans)!));
        eExpand.appendChild((this.eExpandIndeterminate = _createIconNoSpan('accordionIndeterminate', beans)!));
    }

    private showOrHideOptions(): void {
        const { params, eFilterTextField } = this;
        const translate = this.getLocaleTextFunc();

        eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));

        _setDisplayed(eFilterTextField.getGui(), !params.suppressFilterSearch);
    }

    private onSearchTextChanged(): void {
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = _debounce(
                this,
                () => this.dispatchLocalEvent({ type: 'searchChanged', searchText: this.eFilterTextField.getValue() }),
                300
            );
        }

        this.searchTextChangedTimeout = this.onSearchTextChangedDebounced();
    }

    private onSearchTextCleared(): void {
        clearTimeout(this.searchTextChangedTimeout);
        this.dispatchLocalEvent({ type: 'searchChanged', searchText: this.eFilterTextField.getValue() });
    }

    private onExpandClicked(): void {
        const event: AgEvent<AgFiltersToolPanelHeaderEvent> =
            this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchLocalEvent(event);
    }

    public setExpandState(state: EXPAND_STATE): void {
        this.currentExpandState = state;

        _setDisplayed(this.eExpand, !this.params.suppressExpandAll && state !== EXPAND_STATE.NO_GROUPS);
        _setAriaExpanded(this.eExpand, state === EXPAND_STATE.EXPANDED);
        _setDisplayed(this.eExpandChecked, state === EXPAND_STATE.EXPANDED);
        _setDisplayed(this.eExpandUnchecked, state === EXPAND_STATE.COLLAPSED);
        _setDisplayed(this.eExpandIndeterminate, state === EXPAND_STATE.INDETERMINATE);
    }
}

export const AgFiltersToolPanelHeaderSelector: ComponentSelector = {
    selector: 'AG-FILTERS-TOOL-PANEL-HEADER',
    component: AgFiltersToolPanelHeader,
};
