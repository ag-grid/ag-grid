import {
    Component,
    Autowired,
    ColumnController,
    EventService,
    Context,
    PostConstruct,
    Events,
    OriginalColumnGroup,
    Column,
    Utils,
    OriginalColumnGroupChild
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";

export class ColumnSelectComp extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;
    @Autowired('context') private context: Context;

    private static TEMPLATE = '<div class="ag-column-select-panel"></div>';

    private renderedItems: {[key: string]: Component};

    private columnTree: OriginalColumnGroupChild[];

    private allowDragging: boolean;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super(ColumnSelectComp.TEMPLATE);
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.destroyAllRenderedElements();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        this.recursivelyRenderComponents(this.columnTree, 0);
    }

    public destroy(): void {
        super.destroy();
        this.destroyAllRenderedElements();
    }

    private destroyAllRenderedElements(): void {
        Utils.removeAllChildren(this.getGui());
        if (this.renderedItems) {
            Utils.iterateObject(this.renderedItems, (key: string, renderedItem: Component) => renderedItem.destroy() );
        }
        this.renderedItems = {};
    }

    private recursivelyRenderGroupComponent(columnGroup: OriginalColumnGroup, dept: number): void {
        // only render group if user provided the definition
        let newDept: number;

        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) { return; }

        if (!columnGroup.isPadding()) {
            let renderedGroup = new ToolPanelGroupComp(columnGroup, dept, this.onGroupExpanded.bind(this), this.allowDragging);
            this.context.wireBean(renderedGroup);
            this.appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            this.renderedItems[columnGroup.getId()] = renderedGroup;
        } else {
            // no children, so no indent
            newDept = dept;
        }

        this.recursivelyRenderComponents(columnGroup.getChildren(), newDept);
    }

    private recursivelyRenderColumnComponent(column: Column, dept: number): void {
        if (column.getColDef() && column.getColDef().suppressToolPanel) { return; }

        let renderedColumn = new ToolPanelColumnComp(column, dept, this.allowDragging);
        this.context.wireBean(renderedColumn);
        this.appendChild(renderedColumn.getGui());

        this.renderedItems[column.getId()] = renderedColumn;
    }

    private recursivelyRenderComponents(tree: OriginalColumnGroupChild[], dept: number): void {
        tree.forEach( child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyRenderGroupComponent(<OriginalColumnGroup> child, dept);
            } else {
                this.recursivelyRenderColumnComponent(<Column> child, dept);
            }
        });
    }

    private recursivelySetVisibility(columnTree: any[], visible: boolean): void {

        columnTree.forEach( child => {

            let component = this.renderedItems[child.getId()];
            if (component) {
                component.setVisible(visible);
            }

            if (child instanceof OriginalColumnGroup) {
                let columnGroup = <OriginalColumnGroup> child;

                let newVisible: boolean;
                if (component) {
                    let expanded = (<ToolPanelGroupComp>component).isExpanded();
                    newVisible = visible ? expanded : false;
                } else {
                    newVisible = visible;
                }

                let newChildren = columnGroup.getChildren();
                this.recursivelySetVisibility(newChildren, newVisible);

            }

        });
    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.columnTree, true);
    }
}
