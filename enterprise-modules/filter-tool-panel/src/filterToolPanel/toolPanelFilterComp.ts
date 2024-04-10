import {
    _,
    Autowired,
    Column,
    ColumnModel,
    Component,
    Events,
    FilterManager,
    FilterOpenedEvent,
    IFilterComp,
    KeyCode,
    PostConstruct,
    RefSelector,
    FilterWrapperComp
} from "@ag-grid-community/core";

export class ToolPanelFilterComp extends Component {
    private static TEMPLATE = /* html */`
        <div class="ag-filter-toolpanel-instance">
            <div class="ag-filter-toolpanel-header ag-filter-toolpanel-instance-header" ref="eFilterToolPanelHeader" role="button" aria-expanded="false">
                <div ref="eExpand" class="ag-filter-toolpanel-expand"></div>
                <span ref="eFilterName" class="ag-header-cell-text"></span>
                <span ref="eFilterIcon" class="ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon" aria-hidden="true"></span>
            </div>
            <div class="ag-filter-toolpanel-instance-body ag-filter" ref="agFilterToolPanelBody"></div>
        </div>`;

    @RefSelector('eFilterToolPanelHeader') private eFilterToolPanelHeader: HTMLElement;
    @RefSelector('eFilterName') private eFilterName: HTMLElement;
    @RefSelector('agFilterToolPanelBody') private agFilterToolPanelBody: HTMLElement;
    @RefSelector('eFilterIcon') private eFilterIcon: Element;
    @RefSelector('eExpand') private eExpand: Element;

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private hideHeader: boolean;
    private column: Column;
    private expanded: boolean = false;
    private underlyingFilter: IFilterComp | null;
    private filterWrapperComp?: FilterWrapperComp;

    constructor(hideHeader: boolean, private readonly expandedCallback: () => void) {
        super(ToolPanelFilterComp.TEMPLATE);
        this.hideHeader = hideHeader;
    }

    @PostConstruct
    private postConstruct() {
        this.eExpandChecked = _.createIconNoSpan('columnSelectOpen', this.beans.gos)!;
        this.eExpandUnchecked = _.createIconNoSpan('columnSelectClosed', this.beans.gos)!;
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    }

    public setColumn(column: Column): void {
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', (e: KeyboardEvent) => {
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                e.preventDefault();
                this.toggleExpanded();
            }
        });
        this.addManagedEventListener(Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);

        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        _.setDisplayed(this.eExpandChecked, false);

        if (this.hideHeader) {
            _.setDisplayed(this.eFilterToolPanelHeader, false);
            this.eFilterToolPanelHeader.removeAttribute('tabindex');
        } else {
            this.eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }

        this.addManagedListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }

    public getColumn(): Column {
        return this.column;
    }

    public getColumnFilterName(): string | null {
        return this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    }

    private addInIcon(iconName: string, eParent: Element, column: Column): void {
        if (eParent == null) { return; }

        const eIcon = _.createIconNoSpan(iconName, this.beans.gos, column)!;
        eParent.appendChild(eIcon);
    }

    public isFilterActive(): boolean {
        return this.filterManager.isFilterActive(this.column);
    }

    private onFilterChanged(): void {
        _.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: Column.EVENT_FILTER_CHANGED });
    }

    public toggleExpanded(): void {
        this.expanded ? this.collapse() : this.expand();
    }

    public expand(): void {
        if (this.expanded) { return; }

        this.expanded = true;
        _.setAriaExpanded(this.eFilterToolPanelHeader, true);

        _.setDisplayed(this.eExpandChecked, true);
        _.setDisplayed(this.eExpandUnchecked, false);

        this.addFilterElement();

        this.expandedCallback();
    }

    private addFilterElement(suppressFocus?: boolean): void {
        const filterPanelWrapper = _.loadTemplate(/* html */`<div class="ag-filter-toolpanel-instance-filter"></div>`);
        const comp = this.createManagedBean(new FilterWrapperComp(this.column, 'TOOLBAR'));
        this.filterWrapperComp = comp;

        if (!comp.hasFilter()) { return; }

        comp.getFilter()?.then(filter => {
            this.underlyingFilter = filter;

            if (!filter) { return; }
            filterPanelWrapper.appendChild(comp.getGui());

            this.agFilterToolPanelBody.appendChild(filterPanelWrapper);

            comp.afterGuiAttached({ container: 'toolPanel', suppressFocus });
        });
        
    }

    public collapse(): void {
        if (!this.expanded) { return; }

        this.expanded = false;
        _.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.removeFilterElement();

        _.setDisplayed(this.eExpandChecked, false);
        _.setDisplayed(this.eExpandUnchecked, true);

        this.filterWrapperComp?.afterGuiDetached();
        this.destroyBean(this.filterWrapperComp);

        this.expandedCallback();
    }

    private removeFilterElement(): void {
        _.clearElement(this.agFilterToolPanelBody);
    }


    public isExpanded(): boolean {
        return this.expanded;
    }

    public refreshFilter(isDisplayed: boolean): void {
        if (!this.expanded) { return; }

        const filter = this.underlyingFilter as any;

        if (!filter) { return; }

        if (isDisplayed) {
            // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
            // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
            // scroll position in the filter list panel
            if (typeof filter.refreshVirtualList === 'function') {
                filter.refreshVirtualList();
            }
        } else {
            filter.afterGuiDetached?.();
        }
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        if (event.source !== 'COLUMN_MENU') { return; }
        if (event.column !== this.column) { return; }
        if (!this.expanded) { return; }

        this.collapse();
    }
}
