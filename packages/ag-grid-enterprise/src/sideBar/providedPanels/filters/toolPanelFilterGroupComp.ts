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
    }

    public collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }

    private setGroupTitle() {
        if (this.columnGroup instanceof OriginalColumnGroup) {
            const groupName = this.columnController.getDisplayNameForOriginalColumnGroup(null, this.columnGroup, 'toolPanel');
            console.log(groupName, this.depth);
            this.filterGroupComp.setTitle(groupName as string);
        } else {
            const columnName = this.columnController.getDisplayNameForColumn(this.columnGroup as Column, 'header', false);
            this.filterGroupComp.setTitle(columnName as string);
        }
    }
}
