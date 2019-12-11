import {
    _,
    AgGroupComponent,
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
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    PreConstruct,
    RefSelector
} from "@ag-grid-community/core";
import {ToolPanelFilterComp} from "./toolPanelFilterComp";

export type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

export class ToolPanelFilterGroupComp extends Component {
    private static TEMPLATE =
        `<div class="ag-filter-toolpanel-group">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
         </div>`;

    @RefSelector('filterGroupComp') private filterGroupComp: AgGroupComponent;

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
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
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');

        _.addCssClass(this.filterGroupComp.getGui(), `ag-filter-panel-group-level-${this.depth}`);

        this.childFilterComps.forEach(filterComp => this.filterGroupComp.addItem(filterComp as Component));

        if (!this.isColumnGroup()) {
            this.addTopLevelColumnGroupExpandListener();
        }
        else {
            this.addDestroyableEventListener(this.filterGroupComp, 'expanded', () => {
                this.expandedCallback();
            });

            this.addDestroyableEventListener(this.filterGroupComp, 'collapsed', () => {
                this.expandedCallback();
            });
        }

        this.addFilterChangedListeners();
    }

    public refreshFilters() {
        this.childFilterComps.forEach((filterComp: ToolPanelFilterComp | ToolPanelFilterGroupComp) => {
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

    private addTopLevelColumnGroupExpandListener() {
        this.addDestroyableEventListener(this.filterGroupComp, 'expanded', () => {
            this.childFilterComps.forEach(filterComp => {
                // also need to refresh the virtual list on set filters as the filter may have been updated elsewhere
                if (filterComp instanceof ToolPanelFilterComp) {
                   filterComp.expand();
                   filterComp.refreshFilter();
                } else {
                    filterComp.refreshFilters();
                }
            });
        });
    }

    private addFilterChangedListeners() {

        if (this.columnGroup instanceof OriginalColumnGroup) {
            const group = this.columnGroup as OriginalColumnGroup;
            const anyChildFiltersActive = () => group.getLeafColumns().some(col => col.isFilterActive());
            group.getLeafColumns().forEach(column => {
                this.addDestroyableEventListener(column, Column.EVENT_FILTER_CHANGED, () => {
                    _.addOrRemoveCssClass(this.filterGroupComp.getGui(), 'ag-has-filter', anyChildFiltersActive());
                });
            });
        } else {
            const column = this.columnGroup as Column;

            this.addDestroyableEventListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));

            this.addDestroyableEventListener(column, Column.EVENT_FILTER_CHANGED, () => {
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
        this.childFilterComps.forEach(filterComp => filterComp.destroy());
        this.childFilterComps.length = 0;
        _.clearElement(this.getGui());
    }

    public destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
