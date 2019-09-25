import {
    _,
    Autowired,
    ColumnController,
    Component,
    Events,
    EventService,
    GridOptionsWrapper,
    PostConstruct,
    PreConstruct,
    RefSelector
} from "ag-grid-community";

export enum SELECTED_STATE { CHECKED, UNCHECKED, INDETERMINATE }

export class FiltersToolPanelHeaderPanel extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('eFilterTextField')

    private eFilterTextField: HTMLInputElement;

    private eExpandChecked: HTMLElement;
    private eExpandUnchecked: HTMLElement;
    private eExpandIndeterminate: HTMLElement;

    @RefSelector('eExpand') private eExpand: HTMLElement;
    @RefSelector('eFilterWrapper') private eFilterWrapper: HTMLElement;

    private onFilterTextChangedDebounced: () => void;

    private expandState: SELECTED_STATE = SELECTED_STATE.CHECKED;

    @PreConstruct
    private preConstruct(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.setTemplate(
        `<div class="ag-filters-tool-panel-header-panel" role="presentation">
            <div class="ag-input-wrapper" ref="eExpand"></div>            
            <div class="ag-input-wrapper ag-filters-tool-panel-filter-wrapper" ref="eFilterWrapper" role="presentation">
                <input ref="eFilterTextField" type="text" placeholder="${translate('filterOoo', 'Filter...')}">        
            </div>
        </div>`);
    }

    @PostConstruct
    public postConstruct(): void {
        this.addEventListeners();
        this.createExpandIcons();
        this.setExpandState(SELECTED_STATE.CHECKED);

        this.addDestroyableEventListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', this.onFilterTextChanged.bind(this));
    }

    public init(): void {
        console.log('init');
        if (this.columnController.isReady()) {
            this.showOrHideOptions();
        }
    }

    private createExpandIcons() {
        this.eExpand.appendChild(this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper));
        this.eExpand.appendChild(this.eExpandIndeterminate = _.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsWrapper));
    }

    // we only show expand / collapse if we are showing columns
    private showOrHideOptions(): void {

        // const showFilter = !this.params.suppressColumnFilter;
        // const showExpand = !this.params.suppressColumnExpandAll;

        const showFilter = true;
        const showExpand = true;

        _.setDisplayed(this.eFilterWrapper, showFilter);
        _.setDisplayed(this.eExpand, showExpand);
    }

    private addEventListeners(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    }

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce(() => {
                const filterText = this.eFilterTextField.value;
                this.dispatchEvent({type: 'filterChanged', filterText: filterText});
            }, 400);
        }

        this.onFilterTextChangedDebounced();
    }

    private onExpandClicked(): void {
        if (this.expandState === SELECTED_STATE.CHECKED) {
            this.dispatchEvent({type: 'collapseAll'});
        } else {
            this.dispatchEvent({type: 'expandAll'});
        }
    }

    public setExpandState(state: SELECTED_STATE): void {
        this.expandState = state;

        _.setDisplayed(this.eExpandChecked, this.expandState === SELECTED_STATE.CHECKED);
        _.setDisplayed(this.eExpandUnchecked, this.expandState === SELECTED_STATE.UNCHECKED);
        _.setDisplayed(this.eExpandIndeterminate, this.expandState === SELECTED_STATE.INDETERMINATE);
    }
}
