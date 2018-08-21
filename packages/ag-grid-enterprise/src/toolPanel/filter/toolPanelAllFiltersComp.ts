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
    RefSelector,
    Utils,
    ValueService
} from "ag-grid/main";
import {ColumnItem} from "../columnsSelect/columnContainerComp";
import {ToolPanelFilterComp} from "./toolPanelFilterComp";

export class ToolPanelAllFiltersComp extends Component {

    private static TEMPLATE =
        `<div class="ag-column-panel">
            <div class="ag-filter-panel" ref="ePanelContainer" />
        </div>`;

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
    private columnFilterComps: { [key: string]: ColumnItem };

    private initialised = false;

    @RefSelector('ePanelContainer')
    private ePanelContainer: HTMLElement;


    constructor() {
        super(ToolPanelAllFiltersComp.TEMPLATE);
    }

    public init(): void {
        this.instantiate(this.context);
        this.initialised = true;
        if (this.columnController.isReady()) {
            this.eventService.addEventListener('newColumnsLoaded', ()=>this.onColumnsChanged());
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.ePanelContainer.innerHTML = '';
        this.columnTree = this.columnController.getPrimaryColumnTree();
        let groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.setTemplateFromElement(this.ePanelContainer.parentElement);
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

    private destroyColumnFilterComps(): void {
        Utils.removeAllChildren(this.getGui());
        if (this.columnFilterComps) {
            Utils.iterateObject(this.columnFilterComps, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.columnFilterComps = {};
    }

    private recursivelyAddComps(tree: OriginalColumnGroupChild[], dept: number, groupsExist: boolean): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyAddComps(child.getChildren(), dept, groupsExist);
            } else {
                this.recursivelyAddColumnComps(<Column> child, dept, groupsExist);
            }
        });
    }

    private recursivelyAddColumnComps(column: Column, dept: number, groupsExist: boolean): void {
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }

        let renderedFilter = this.componentResolver.createInternalAgGridComponent(ToolPanelFilterComp, {
            column: column
        });
        this.context.wireBean(renderedFilter);
        this.ePanelContainer.appendChild(renderedFilter.getGui());

        // this.columnFilterComps[column.getId()] = renderedColumn;
    }

}