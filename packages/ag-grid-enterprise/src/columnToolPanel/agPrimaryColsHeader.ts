import type { ITooltipFeature } from 'ag-stack';
import {
    FAST_TEST_TIMINGS,
    RefPlaceholder,
    _addManagedElementListeners,
    _debounce,
    _setAriaExpanded,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-stack';

import type { ComponentSelector, ElementParams, GridCheckbox, GridInputTextField } from 'ag-grid-community';
import { AgCheckboxSelector, AgInputTextFieldSelector, Component, KeyCode, _createIconNoSpan } from 'ag-grid-community';

import type { ToolPanelColumnCompParams } from './columnToolPanel';
import { isDeferredMode } from './toolPanelDeferredUiUtils';

export enum ExpandState {
    EXPANDED,
    COLLAPSED,
    INDETERMINATE,
}

const DEBOUNCE_DELAY = FAST_TEST_TIMINGS ? 0 : 300;
type AgPrimaryColsHeaderEvent = 'unselectAll' | 'selectAll' | 'collapseAll' | 'expandAll' | 'filterChanged';

const AgPrimaryColsHeaderElement: ElementParams = {
    tag: 'div',
    cls: 'ag-column-select-header',
    role: 'presentation',
    children: [
        { tag: 'div', ref: 'eExpand', cls: 'ag-column-select-header-icon', role: 'button' },
        { tag: 'ag-checkbox', ref: 'eSelect', cls: 'ag-column-select-header-checkbox' },
        { tag: 'ag-input-text-field', ref: 'eFilterTextField', cls: 'ag-column-select-header-filter-wrapper' },
    ],
};
export class AgPrimaryColsHeader extends Component<AgPrimaryColsHeaderEvent> {
    private readonly eExpand: HTMLElement = RefPlaceholder;
    private readonly eSelect: GridCheckbox = RefPlaceholder;
    private readonly eFilterTextField: GridInputTextField = RefPlaceholder;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private eExpandIndeterminate: Element;

    private expandState: ExpandState;
    private selectState?: boolean;
    private expandTooltip?: ITooltipFeature;
    private selectTooltip?: ITooltipFeature;

    private onFilterTextChangedDebounced: () => ReturnType<typeof setTimeout>;
    private filterTextChangedTimeout: ReturnType<typeof setTimeout> | undefined;

    private params: ToolPanelColumnCompParams;

    constructor() {
        super(AgPrimaryColsHeaderElement, [AgCheckboxSelector, AgInputTextFieldSelector]);
    }

    public postConstruct(): void {
        this.createExpandIcons();

        this.addManagedListeners(this.eExpand, {
            click: this.onExpandClicked.bind(this),
            keydown: (e: KeyboardEvent) => {
                if (e.key === KeyCode.SPACE || e.key === KeyCode.ENTER) {
                    e.preventDefault();
                    this.onExpandClicked();
                }
            },
        });

        _addManagedElementListeners(this, this.eSelect.getInputElement(), { click: this.onSelectClicked.bind(this) });
        this.addManagedPropertyListener('functionsReadOnly', () => this.onFunctionsReadOnlyPropChanged());

        this.eFilterTextField
            .setClearButtonEnabled(true)
            .setSearchIcon(true)
            .onValueChange(() => this.onFilterTextChanged())
            .onValueClear(() => this.onFilterTextCleared());

        this.addManagedEventListeners({ newColumnsLoaded: this.showOrHideOptions.bind(this) });

        const translate = this.getLocaleTextFunc();

        this.eSelect.setInputAriaLabel(translate('ariaColumnSelectAll', 'Toggle All Columns Visibility'));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));

        this.activateTabIndex([this.eExpand]);
        this.expandTooltip = this.addTooltip({
            control: 'expandAll',
            getGui: () => this.eExpand,
            getLocation: () => 'columnToolPanelColumnGroup',
            getTooltip: () => ({
                value:
                    this.expandState === ExpandState.EXPANDED
                        ? translate('tooltipCollapseAll', 'Collapse all')
                        : translate('tooltipExpandAll', 'Expand all'),
            }),
        });
        this.selectTooltip = this.eSelect.addTooltip({
            control: 'columnSelectAll',
            getLocation: () => 'columnToolPanelColumnGroup',
            getAriaElement: () => this.eSelect.getInputElement(),
            getTooltip: () => {
                const pivotMode = this.beans.columnStateUpdateStrategy.getPivotMode(isDeferredMode(this.params));
                if (pivotMode) {
                    return {
                        value: this.selectState
                            ? translate('tooltipDisableAllColumns', 'Disable all columns')
                            : translate('tooltipEnableAllColumns', 'Enable all columns'),
                    };
                }
                return {
                    value: this.selectState
                        ? translate('tooltipHideAllColumns', 'Hide all columns')
                        : translate('tooltipShowAllColumns', 'Show all columns'),
                };
            },
        });
    }

    private onFunctionsReadOnlyPropChanged(): void {
        const readOnly = this.gos.get('functionsReadOnly');
        this.eSelect.setReadOnly(readOnly);
        this.eSelect.toggleCss('ag-column-select-column-readonly', readOnly);
    }

    public init(params: ToolPanelColumnCompParams): void {
        this.params = params;
        this.eFilterTextField.setAutoComplete(params.browserAutoComplete);

        const readOnly = this.gos.get('functionsReadOnly');
        this.eSelect.setReadOnly(readOnly);
        this.eSelect.toggleCss('ag-column-select-column-readonly', readOnly);

        if (this.beans.colModel.ready) {
            this.showOrHideOptions();
        }
    }

    private createExpandIcons() {
        const beans = this.beans;
        this.eExpand.appendChild((this.eExpandChecked = _createIconNoSpan('columnSelectOpen', beans)!));

        this.eExpand.appendChild((this.eExpandUnchecked = _createIconNoSpan('columnSelectClosed', beans)!));

        this.eExpand.appendChild((this.eExpandIndeterminate = _createIconNoSpan('columnSelectIndeterminate', beans)!));

        this.setExpandState(ExpandState.EXPANDED);
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {
        const params = this.params;
        const showFilter = !params.suppressColumnFilter;
        const showSelect = !params.suppressColumnSelectAll;
        const showExpand = !params.suppressColumnExpandAll;
        const groupsPresent = !!this.beans.colModel.colDefTreeDepth;
        const translate = this.getLocaleTextFunc();

        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));

        _setDisplayed(this.eFilterTextField.getGui(), showFilter);
        _setDisplayed(this.eSelect.getGui(), showSelect);
        _setDisplayed(this.eExpand, showExpand && groupsPresent);
    }

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _debounce(
                this,
                () => {
                    const filterText = this.eFilterTextField.getValue();
                    this.dispatchLocalEvent({ type: 'filterChanged', filterText: filterText });
                },
                DEBOUNCE_DELAY
            );
        }

        this.filterTextChangedTimeout = this.onFilterTextChangedDebounced();
    }

    private onFilterTextCleared(): void {
        clearTimeout(this.filterTextChangedTimeout);
        this.dispatchLocalEvent({ type: 'filterChanged', filterText: this.eFilterTextField.getValue() });
    }

    private onSelectClicked(): void {
        this.dispatchLocalEvent({ type: this.selectState ? 'unselectAll' : 'selectAll' });
    }

    private onExpandClicked(): void {
        this.dispatchLocalEvent({ type: this.expandState === ExpandState.EXPANDED ? 'collapseAll' : 'expandAll' });
    }

    public focusFilter(): void {
        this.eFilterTextField.getFocusableElement().focus();
    }

    public setExpandState(state: ExpandState): void {
        this.expandState = state;
        this.expandTooltip?.refreshTooltip();
        const expanded = state === ExpandState.EXPANDED;
        const translate = this.getLocaleTextFunc();

        // The name says what activating does, so it names the collapse only once every group is expanded.
        _setAriaLabel(
            this.eExpand,
            expanded
                ? translate('ariaColumnSelectCollapseAll', 'Collapse All Column Groups')
                : translate('ariaColumnSelectExpandAll', 'Expand All Column Groups')
        );
        _setAriaExpanded(this.eExpand, expanded);
        _setDisplayed(this.eExpandChecked, expanded);
        _setDisplayed(this.eExpandUnchecked, state === ExpandState.COLLAPSED);
        _setDisplayed(this.eExpandIndeterminate, state === ExpandState.INDETERMINATE);
    }

    public setSelectionState(state?: boolean): void {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
        this.selectTooltip?.refreshTooltip();
    }
}

export const AgPrimaryColsHeaderSelector: ComponentSelector = {
    selector: 'AG-PRIMARY-COLS-HEADER',
    component: AgPrimaryColsHeader,
};
