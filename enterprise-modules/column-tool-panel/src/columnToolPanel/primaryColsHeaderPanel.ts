import {
    _,
    Autowired,
    ColumnController,
    Events,
    GridOptionsWrapper,
    PreConstruct,
    RefSelector,
    ToolPanelColumnCompParams,
    Constants,
    AgCheckbox,
    AgInputTextField,
    ManagedFocusComponent
} from "@ag-grid-community/core";

export enum EXPAND_STATE { EXPANDED, COLLAPSED, INDETERMINATE }

export class PrimaryColsHeaderPanel extends ManagedFocusComponent {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('eExpand') private eExpand: HTMLElement;
    @RefSelector('eSelect') private eSelect: AgCheckbox;
    @RefSelector('eFilterTextField') private eFilterTextField: AgInputTextField;

    private eExpandChecked: HTMLElement;
    private eExpandUnchecked: HTMLElement;
    private eExpandIndeterminate: HTMLElement;

    private expandState: EXPAND_STATE;
    private selectState: boolean | undefined;

    private onFilterTextChangedDebounced: () => void;

    private params: ToolPanelColumnCompParams;

    @PreConstruct
    private preConstruct(): void {
        this.setTemplate(/* html */
            `<div class="ag-column-select-header" role="presentation" tabindex="-1">
                <div ref="eExpand" class="ag-column-select-header-icon" tabindex="0"></div>
                <ag-checkbox ref="eSelect" class="ag-column-select-header-checkbox"></ag-checkbox>
                <ag-input-text-field class="ag-column-select-header-filter-wrapper" ref="eFilterTextField"></ag-input-text-field>
            </div>`
        );
    }

    protected postConstruct(): void {
        this.createExpandIcons();

        this.addManagedListener(
            this.eExpand,
            "click",
            this.onExpandClicked.bind(this)
        );

        this.addManagedListener(this.eExpand, 'keydown', (e: KeyboardEvent) => {
            if (e.keyCode === Constants.KEY_SPACE) {
                this.onExpandClicked();
            }
        });

        this.addManagedListener(this.eSelect.getInputElement(),
            'click',
            this.onSelectClicked.bind(this)
        );

        this.eFilterTextField.onValueChange(() => this.onFilterTextChanged());
        
        this.addManagedListener(
            this.eFilterTextField.getInputElement(),
            "keypress",
            this.onMiniFilterKeyPress.bind(this)
        );

        this.addManagedListener(
            this.eventService,
            Events.EVENT_NEW_COLUMNS_LOADED,
            this.showOrHideOptions.bind(this)
        );

        super.postConstruct();
    }

    public init(params: ToolPanelColumnCompParams): void {
        this.params = params;

        if (this.columnController.isReady()) {
            this.showOrHideOptions();
        }
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const nextEl = this.focusController.findNextFocusableElement(this.getFocusableElement(), false, e.shiftKey);

        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
        }
    }

    private createExpandIcons() {
        this.eExpand.appendChild((
            this.eExpandChecked = _.createIconNoSpan(
                "columnSelectOpen",
                this.gridOptionsWrapper
            )
        ));

        this.eExpand.appendChild((
            this.eExpandUnchecked = _.createIconNoSpan(
            "columnSelectClosed",
            this.gridOptionsWrapper
            )
        ));

        this.eExpand.appendChild((
            this.eExpandIndeterminate = _.createIconNoSpan(
            "columnSelectIndeterminate",
            this.gridOptionsWrapper
            )
        ));
        this.setExpandState(EXPAND_STATE.EXPANDED);
    }
 
    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {
        const showFilter = !this.params.suppressColumnFilter;
        const showSelect = !this.params.suppressColumnSelectAll;
        const showExpand = !this.params.suppressColumnExpandAll;
        const groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

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
            }, 300);
        }

        this.onFilterTextChangedDebounced();
    }

    private onMiniFilterKeyPress(e: KeyboardEvent): void {
        if (_.isKeyPressed(e, Constants.KEY_ENTER)) {
            this.onSelectClicked();
        }
    }

    private onSelectClicked(): void {
        const eventType = this.selectState === true ? "unselectAll" : "selectAll";
        this.dispatchEvent({ type: eventType });
    }

    private onExpandClicked(): void {
        const eventType = this.expandState === EXPAND_STATE.EXPANDED ? "collapseAll" : "expandAll";
        this.dispatchEvent({ type: eventType });
    }

    public setExpandState(state: EXPAND_STATE): void {
        this.expandState = state;

        _.setDisplayed(
            this.eExpandChecked,
            this.expandState === EXPAND_STATE.EXPANDED
        );
        _.setDisplayed(
            this.eExpandUnchecked,
            this.expandState === EXPAND_STATE.COLLAPSED
        );
        _.setDisplayed(
            this.eExpandIndeterminate,
            this.expandState === EXPAND_STATE.INDETERMINATE
        );
    }

    public setSelectionState(state?: boolean): void {
        this.selectState = state;
        this.eSelect.setValue(this.selectState);
    }
}
