import {
    Autowired,
    Column,
    ColumnApi,
    ColumnController,
    Component,
    ComponentResolver,
    Context,
    EventService,
    GridApi,
    GridOptionsWrapper,
    IRowModel,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    IToolPanelComp,
    ValueService
} from "ag-grid-community";

import {ToolPanelFilterComp} from "./toolPanelFilterComp";

export class FiltersToolPanel extends Component implements IToolPanelComp {

    private static TEMPLATE =
        `<div class="ag-filter-panel" ref="ePanelContainer" />`;

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired("context") private context: Context;
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired("gridApi") private gridApi: GridApi;
    @Autowired("eventService") private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;

    @Autowired('valueService') private valueService: ValueService;
    @Autowired('$scope') private $scope: any;

    private columnTree: OriginalColumnGroupChild[];

    private initialised = false;

    constructor() {
        super(FiltersToolPanel.TEMPLATE);
    }

    public init(): void {
        this.instantiate(this.context);
        this.initialised = true;
        this.eventService.addEventListener('newColumnsLoaded', ()=>this.onColumnsChanged());
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.getGui().innerHTML = '';
        this.columnTree = this.columnController.getPrimaryColumnTree();
        let groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.setTemplateFromElement(this.getGui());
    }

    public refresh(): void {
    }

    // lazy initialise the panel
    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (visible && !this.initialised) {
            this.init();
        }
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], dept: number, groupsExist: boolean): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyAddComps(child.getChildren(), dept, groupsExist);
            } else {
                this.recursivelyAddColumnComps(<Column> child);
            }
        });
    }

    private recursivelyAddColumnComps(column: Column): void {

        if (column.getColDef() && column.getColDef().suppressFilter) {
            return;
        }

        let renderedFilter = this.componentResolver.createInternalAgGridComponent(ToolPanelFilterComp, {
            column: column
        });
        this.context.wireBean(renderedFilter);
        this.getGui().appendChild(renderedFilter.getGui());
    }
}