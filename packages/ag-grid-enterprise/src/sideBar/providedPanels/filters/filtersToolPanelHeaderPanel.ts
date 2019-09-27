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
import {ToolPanelFiltersCompParams} from "./filtersToolPanel";

export enum EXPAND_STATE { EXPANDED, COLLAPSED, INDETERMINATE }

export class FiltersToolPanelHeaderPanel extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('eExpand') private eExpand: HTMLElement;
    @RefSelector('eFilterWrapper') private eFilterWrapper: HTMLElement;
    @RefSelector('eFilterTextField') private eFilterTextField: HTMLInputElement;

    private eExpandChecked: HTMLElement;
    private eExpandUnchecked: HTMLElement;
    private eExpandIndeterminate: HTMLElement;

    private onFilterTextChangedDebounced: () => void;

    private expandState: EXPAND_STATE;

    private params: ToolPanelFiltersCompParams;

    @PreConstruct
    private preConstruct(): void {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        //TODO add 'searchOoo' to internationalisation docs
        this.setTemplate(
        `<div class="ag-filter-toolpanel-header ag-filter-header" role="presentation">
            <div ref="eExpand"></div>
            <div class="ag-input-wrapper ag-filters-tool-panel-filter-wrapper" ref="eFilterWrapper" role="presentation">
                <input ref="eFilterTextField" type="text" placeholder="${translate('searchOoo', 'Search...')}">        
            </div>
        </div>`);
    }

    @PostConstruct
    public postConstruct(): void {
        this.addEventListeners();
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);

        this.addDestroyableEventListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', this.onFilterTextChanged.bind(this));
    }

    public init(params: ToolPanelFiltersCompParams): void {
        this.params = params;

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

        const showFilter = !this.params.suppressFilter;
        const showExpand = !this.params.suppressExpandAll;

        const groupsPresent = this.columnController.isPrimaryColumnGroupsPresent();

        _.setDisplayed(this.eFilterWrapper, showFilter);
        _.setDisplayed(this.eExpand, showExpand && groupsPresent);
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
        if (this.expandState === EXPAND_STATE.EXPANDED) {
            this.dispatchEvent({type: 'collapseAll'});
        } else {
            this.dispatchEvent({type: 'expandAll'});
        }
    }

    public setExpandState(state: EXPAND_STATE): void {
        this.expandState = state;

        _.setDisplayed(this.eExpandChecked, this.expandState === EXPAND_STATE.EXPANDED);
        _.setDisplayed(this.eExpandUnchecked, this.expandState === EXPAND_STATE.COLLAPSED);
        _.setDisplayed(this.eExpandIndeterminate, this.expandState === EXPAND_STATE.INDETERMINATE);
    }
}
