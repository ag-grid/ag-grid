import {
    _,
    AgGroupComponent,
    Autowired,
    Column,
    ColumnController,
    Component,
    Events,
    FilterOpenedEvent,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    PreConstruct,
    RefSelector,
    AgGroupComponentParams
} from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";

export type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

export class ToolPanelFilterGroupComp extends Component {
    private static TEMPLATE = /* html */
        `<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
        </div>`;

    @RefSelector('filterGroupComp') private filterGroupComp: AgGroupComponent;

    @Autowired('columnController') private columnController: ColumnController;

    private readonly depth: number;
    private readonly columnGroup: OriginalColumnGroupChild;
    private childFilterComps: ToolPanelFilterItem[];
    private expandedCallback: () => void;
    private filterGroupName: string;

    constructor(columnGroup: OriginalColumnGroupChild, childFilterComps: ToolPanelFilterItem[],
        expandedCallback: () => void, depth: number) {
        super();
        this.columnGroup = columnGroup;
        this.childFilterComps = childFilterComps;
        this.depth = depth;
        this.expandedCallback = expandedCallback;
    }

    @PreConstruct
    private preConstruct(): void {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    }

    @PostConstruct
    public init(): void {
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');

        _.addCssClass(this.filterGroupComp.getGui(), `ag-filter-toolpanel-group-level-${this.depth}`);
        this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);

        this.childFilterComps.forEach(filterComp => {
            this.filterGroupComp.addItem(filterComp as Component);
            filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
        });

        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }

    public refreshFilters() {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters();
            } else {
                filterComp.refreshFilter();
            }
        });
    }

    public isColumnGroup(): boolean {
        return this.columnGroup instanceof OriginalColumnGroup;
    }

    public isExpanded(): boolean {
        return this.filterGroupComp.isExpanded();
    }

    public getChildren(): ToolPanelFilterItem[] {
        return this.childFilterComps;
    }

    public getFilterGroupName(): string {
        return this.filterGroupName ? this.filterGroupName : '';
    }

    public getFilterGroupId(): string {
        return this.columnGroup.getId();
    }

    public hideGroupItem(hide: boolean, index: number) {
        this.filterGroupComp.hideItem(hide, index);
    }

    public hideGroup(hide: boolean) {
        _.addOrRemoveCssClass(this.getGui(), 'ag-hidden', hide);
    }

    private forEachToolPanelFilterChild(action: (filterComp: ToolPanelFilterItem) => void) {
        _.forEach(this.childFilterComps, filterComp => {
            if (filterComp instanceof ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    }

    private addExpandCollapseListeners() {
        const expandListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.expand());

        const collapseListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.collapse());

        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    }

    private addFilterChangedListeners() {
        if (this.columnGroup instanceof OriginalColumnGroup) {
            const group = this.columnGroup as OriginalColumnGroup;
            const anyChildFiltersActive = () => group.getLeafColumns().some(col => col.isFilterActive());

            group.getLeafColumns().forEach(column => {
                this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, () => {
                    _.addOrRemoveCssClass(this.filterGroupComp.getGui(), 'ag-has-filter', anyChildFiltersActive());
                });
            });
        } else {
            const column = this.columnGroup as Column;

            this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));

            this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, () => {
                _.addOrRemoveCssClass(this.filterGroupComp.getGui(), 'ag-has-filter', column.isFilterActive());
            });
        }
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.

        if (event.source !== 'COLUMN_MENU') { return; }
        if (event.column !== this.columnGroup) { return; }
        if (!this.isExpanded()) { return; }

        this.collapse();
    }

    public expand() {
        this.filterGroupComp.toggleGroupExpand(true);
    }

    public collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }

    private setGroupTitle() {
        this.filterGroupName = (this.columnGroup instanceof OriginalColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup as Column);

        this.filterGroupComp.setTitle(this.filterGroupName);
    }

    private getColumnGroupName(columnGroup: OriginalColumnGroup): string {
        return this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, 'toolPanel') as string;
    }

    private getColumnName(column: Column): string {
        return this.columnController.getDisplayNameForColumn(column, 'header', false) as string;
    }

    private destroyFilters() {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        _.clearElement(this.getGui());
    }

    protected destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
