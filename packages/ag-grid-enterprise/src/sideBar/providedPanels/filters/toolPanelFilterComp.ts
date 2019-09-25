import {
    Autowired,
    Column,
    ColumnController,
    Component,
    Events,
    EventService,
    FilterManager,
    FilterOpenedEvent,
    GridApi,
    GridOptionsWrapper,
    IFilterComp,
    RefSelector,
    PostConstruct,
    _
} from "ag-grid-community";

export class ToolPanelFilterComp extends Component {
    private static TEMPLATE =
        `<div class="ag-filter-toolpanel-instance" >
            <div class="ag-filter-toolpanel-header ag-header-cell-label" ref="eFilterToolPanelHeader">
                <div ref="eExpand"></div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-body ag-filter" ref="agFilterToolPanelBody"/>
        </div>`;

    @RefSelector('eFilterToolPanelHeader') private eFilterToolPanelHeader: HTMLElement;
    @RefSelector('eFilterName') private eFilterName: HTMLElement;
    @RefSelector('agFilterToolPanelBody') private agFilterToolPanelBody: HTMLElement;
    @RefSelector('eFilterIcon') private eFilterIcon: HTMLElement;
    @RefSelector('eExpand') private eExpand: HTMLElement;

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private eExpandChecked: HTMLElement;
    private eExpandUnchecked: HTMLElement;
    private hideHeader: boolean;
    private column: Column;
    private expanded: boolean = false;

    constructor(hideHeader = false) {
        super(ToolPanelFilterComp.TEMPLATE);
        this.hideHeader = hideHeader;
    }

    @PostConstruct
    private postConstruct() {
        this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.gridOptionsWrapper);
        this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.gridOptionsWrapper);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    }

    public setColumn(column: Column): void {
        this.column = column;
        this.eFilterName.innerText = this.columnController.getDisplayNameForColumn(this.column, 'header', false) as string;
        this.addDestroyableEventListener(this.eFilterToolPanelHeader, 'click', this.doExpandOrCollapse.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));

        this.addInIcon('filter', this.eFilterIcon, this.column);
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        _.addCssClass(this.eExpandChecked, 'ag-hidden');

        if (this.hideHeader) {
            _.addOrRemoveCssClass(this.eFilterToolPanelHeader, 'ag-hidden', true);
            this.doExpand();
        }

        this.addDestroyableEventListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    public getColumn(): Column {
        return this.column;
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) { return; }

        const eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eIcon.innerHTML = '&nbsp';
        eParent.appendChild(eIcon);
    }

    public isFilterActive(): boolean {
        return this.filterManager.isFilterActive(this.column);
    }

    private onFilterChanged(): void {
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        this.dispatchEvent({ type: Column.EVENT_FILTER_CHANGED });
    }

    public doExpandOrCollapse(): void {
        this.expanded ? this.doCollapse() : this.doExpand();
    }

    public doExpand(): void {
        if (this.expanded) return;

        this.expanded = true;
        const container: HTMLElement = _.loadTemplate(`<div class="ag-filter-air" />`);
        this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR').filterPromise.then((filter: IFilterComp): void => {
            container.appendChild(filter.getGui());
            this.agFilterToolPanelBody.appendChild(container);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({});
            }
        });

        _.setDisplayed(this.eExpandChecked, true);
        _.setDisplayed(this.eExpandUnchecked, false);
    }

    public doCollapse(): void {
        if (!this.expanded) return;

        this.expanded = false;
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);

        _.setDisplayed(this.eExpandChecked, false);
        _.setDisplayed(this.eExpandUnchecked, true);
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        if (event.source !== 'COLUMN_MENU') { return; }
        if (event.column !== this.column) { return; }
        if (!this.expanded) { return; }

        this.doCollapse();
    }
}
