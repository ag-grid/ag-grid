import {
    _,
    AgGroupComponent,
    Autowired,
    Column,
    ColumnController,
    Component,
    EventService,
    FilterManager,
    GridApi,
    GridOptionsWrapper,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    PreConstruct,
    RefSelector
} from "ag-grid-community";
import {ToolPanelFilterComp} from "./toolPanelFilterComp";

export type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

export class ToolPanelFilterGroupComp extends Component {
    private static TEMPLATE =
        `<div>
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

        _.addCssClass(this.filterGroupComp.getGui(), `ag-level-${this.depth}`);

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
        _.addOrRemoveCssClass(this.filterGroupComp.getGui(), 'ag-hidden', hide);
    }

    private addTopLevelColumnGroupExpandListener() {
        this.addDestroyableEventListener(this.filterGroupComp, 'expanded', () => {
            this.childFilterComps.forEach(filterComp => {
                if (filterComp instanceof ToolPanelFilterComp) {
                   filterComp.expand();
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
            this.addDestroyableEventListener(column, Column.EVENT_FILTER_CHANGED, () => {
                _.addOrRemoveCssClass(this.filterGroupComp.getGui(), 'ag-has-filter', column.isFilterActive());
            });
        }
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
