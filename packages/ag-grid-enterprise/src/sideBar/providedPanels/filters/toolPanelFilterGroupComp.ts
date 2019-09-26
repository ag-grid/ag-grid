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

type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

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

    constructor(columnGroup: OriginalColumnGroupChild, childFilterComps: ToolPanelFilterItem[], depth: number) {
        super();
        this.columnGroup = columnGroup;
        this.childFilterComps = childFilterComps;
        this.depth = depth;
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

        this.childFilterComps.forEach(filterComp => this.filterGroupComp.addItem(filterComp));

        // TODO temp workaround for top level column groups with set filters as list is loaded asynchronously
        if (this.depth === 0 && this.childFilterComps.length === 1) {
            this.addTopLevelColumnGroupExpandListener();
        }

        this.addFilterChangedListeners();
    }

    private addTopLevelColumnGroupExpandListener() {
        this.addDestroyableEventListener(this.filterGroupComp, 'expanded', () => {
            this.childFilterComps.forEach(filterComp => {
                if (filterComp instanceof ToolPanelFilterComp) {
                    filterComp.doExpand();
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
        }
    }

    public collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }

    private setGroupTitle() {
        if (this.columnGroup instanceof OriginalColumnGroup) {
            const groupName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');
            this.filterGroupComp.setTitle(groupName as string);
        } else {
            const columnName = this.columnController.getDisplayNameForColumn(this.columnGroup as Column, 'header', false);
            this.filterGroupComp.setTitle(columnName as string);
        }
    }
}
