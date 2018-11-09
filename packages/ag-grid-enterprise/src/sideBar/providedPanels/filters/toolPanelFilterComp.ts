import {
    _,
    Autowired,
    Column,
    Component,
    FilterManager,
    IFilterComp,
    RefSelector,
    EventService,
    Events,
    FilterOpenedEvent,
    GridApi,
    GridOptionsWrapper,
    ColumnController
} from "ag-grid-community";

export interface ToolPanelFilterCompParams {
    column: Column
}

export class ToolPanelFilterComp extends Component {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private params: ToolPanelFilterCompParams;
    private expanded: boolean = false;
    private filter: IFilterComp;


    @RefSelector('eFilterToolpanelHeader')
    private eFilterToolpanelHeader: HTMLElement;

    @RefSelector('eFilterName')
    private eFilterName: HTMLElement;

    @RefSelector('agFilterToolpanelBody')
    private eAgFilterToolpanelBody: HTMLElement;

    @RefSelector('eFilterIcon')
    private eFilterIcon: HTMLElement;

    @RefSelector('eExpandChecked')
    private eExpandChecked: HTMLElement;

    @RefSelector('eExpandUnchecked')
    private eExpandUnchecked: HTMLElement;

    private static TEMPLATE =
        `<div class="ag-filter-toolpanel-instance" >
            <div class="ag-filter-toolpanel-header ag-header-cell-label" ref="eFilterToolpanelHeader">
                <a href="javascript:void(0)" (click)="onExpandClicked" ref="eExpand">
                    <span class="ag-icon ag-icon-tree-open" ref="eExpandChecked"></span>
                    <span class="ag-icon ag-icon-tree-closed" ref="eExpandUnchecked"></span>
                </a>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-body ag-filter" ref="agFilterToolpanelBody"/>
        </div>`;

    constructor() {
        super(ToolPanelFilterComp.TEMPLATE);
    }

    init(params: ToolPanelFilterCompParams) {
        this.params = params;
        let displayName = this.columnController.getDisplayNameForColumn(this.params.column, 'header', false);
        let displayNameSanitised = _.escape(displayName);
        this.eFilterName.innerText = displayNameSanitised;
        this.addGuiEventListenerInto(this.eFilterToolpanelHeader, 'click', this.doExpandOrCollapse.bind(this));
        this.eventService.addEventListener(Events.EVENT_FILTER_OPENED, (event: FilterOpenedEvent) => this.onFilterOpened(event))

        this.addInIcon('filter', this.eFilterIcon, this.params.column);
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        _.addCssClass(this.eExpandChecked, 'ag-hidden');
        this.addDestroyableEventListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));

    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) return;

        let eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eIcon.innerHTML = '&nbsp';
        eParent.appendChild(eIcon);
    }

    private isFilterActive(): boolean {
        return this.filterManager.isFilterActive(this.params.column);
    }

    private onFilterChanged(): void {
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
    }

    public addGuiEventListenerInto(into: HTMLElement, event: string, listener: (event: any) => void): void {
        into.addEventListener(event, listener);
        this.addDestroyFunc(() => into.removeEventListener(event, listener));
    }

    private doExpandOrCollapse(): void {
        this.expanded ? this.doCollapse() : this.doExpand();
    }

    private doExpand(): void {
        this.expanded = true;
        let container: HTMLElement = _.loadTemplate(`<div class="ag-filter-air" />`)
        this.filterManager.getOrCreateFilterWrapper(this.params.column, 'TOOLBAR').filterPromise.then((filter: IFilterComp): void => {
            this.filter = filter;
            container.appendChild(filter.getGui());
            this.eAgFilterToolpanelBody.appendChild(container);
            if (filter.afterGuiAttached){
                filter.afterGuiAttached();
            }
        });


        _.setVisible(this.eExpandChecked, true);
        _.setVisible(this.eExpandUnchecked, false);
    }

    private doCollapse(): void {
        this.expanded = false;
        this.eAgFilterToolpanelBody.removeChild(this.eAgFilterToolpanelBody.children[0]);

        _.setVisible(this.eExpandChecked, false);
        _.setVisible(this.eExpandUnchecked, true);
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        if (event.source !== 'COLUMN_MENU') return;
        if (event.column !== this.params.column) return;
        if (!this.expanded) return;

        this.doCollapse();
    }
}