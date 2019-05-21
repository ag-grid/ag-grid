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
    _
} from "ag-grid-community";

export class ToolPanelFilterComp extends Component {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;

    private column: Column;
    private expanded: boolean = false;
    // private filter: IFilterComp;

    @RefSelector('eFilterToolPanelHeader')
    private eFilterToolPanelHeader: HTMLElement;

    @RefSelector('eFilterName')
    private eFilterName: HTMLElement;

    @RefSelector('agFilterToolPanelBody')
    private agFilterToolPanelBody: HTMLElement;

    @RefSelector('eFilterIcon')
    private eFilterIcon: HTMLElement;

    @RefSelector('eExpandChecked')
    private eExpandChecked: HTMLElement;

    @RefSelector('eExpandUnchecked')
    private eExpandUnchecked: HTMLElement;

    private static TEMPLATE =
        `<div class="ag-filter-toolpanel-instance" >
            <div class="ag-filter-toolpanel-header ag-header-cell-label" ref="eFilterToolPanelHeader">
                <div ref="eExpand">
                    <span class="ag-icon ag-icon-tree-open" ref="eExpandChecked"></span>
                    <span class="ag-icon ag-icon-tree-closed" ref="eExpandUnchecked"></span>
                </div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-body ag-filter" ref="agFilterToolPanelBody"/>
        </div>`;

    constructor() {
        super(ToolPanelFilterComp.TEMPLATE);
    }

    public setColumn(column: Column): void {
        this.column = column;
        const displayName: any = this.columnController.getDisplayNameForColumn(this.column, 'header', false);
        this.eFilterName.innerText = displayName;
        this.addDestroyableEventListener(this.eFilterToolPanelHeader, 'click', this.doExpandOrCollapse.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));

        this.addInIcon('filter', this.eFilterIcon, this.column);
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
        _.addCssClass(this.eExpandChecked, 'ag-hidden');
        this.addDestroyableEventListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) { return; }

        const eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eIcon.innerHTML = '&nbsp';
        eParent.appendChild(eIcon);
    }

    private isFilterActive(): boolean {
        return this.filterManager.isFilterActive(this.column);
    }

    private onFilterChanged(): void {
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !this.isFilterActive());
    }

    private doExpandOrCollapse(): void {
        this.expanded ? this.doCollapse() : this.doExpand();
    }

    private doExpand(): void {
        this.expanded = true;
        const container: HTMLElement = _.loadTemplate(`<div class="ag-filter-air" />`);
        this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR').filterPromise.then((filter: IFilterComp): void => {
            container.appendChild(filter.getGui());
            this.agFilterToolPanelBody.appendChild(container);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({});
            }
        });

        _.setVisible(this.eExpandChecked, true);
        _.setVisible(this.eExpandUnchecked, false);
    }

    private doCollapse(): void {
        this.expanded = false;
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);

        _.setVisible(this.eExpandChecked, false);
        _.setVisible(this.eExpandUnchecked, true);
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        if (event.source !== 'COLUMN_MENU') { return; }
        if (event.column !== this.column) { return; }
        if (!this.expanded) { return; }

        this.doCollapse();
    }
}