import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    Context,
    Events,
    EventService,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    Utils
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";
import {BaseColumnItem} from "./columnSelectComp";

export type ColumnItem = BaseColumnItem & Component;

export class ColumnContainerComp extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;
    @Autowired('context') private context: Context;

    private props: {
        allowDragging: boolean;
    };

    private columnTree: OriginalColumnGroupChild[];
    private renderedItems: { [key: string]: ColumnItem };

    public static TEMPLATE = `<div class="ag-column-container"></div>`;

    constructor(){
        super(ColumnContainerComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    public onColumnsChanged(): void {
        this.resetColumns();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        this.recursivelyRenderComponents(this.columnTree, 0);
    }

    private resetColumns(): void {
        Utils.removeAllChildren(this.getGui());
        if (this.renderedItems) {
            Utils.iterateObject(this.renderedItems, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.renderedItems = {};
    }

    private recursivelyRenderGroupComponent(columnGroup: OriginalColumnGroup, dept: number): void {
        // only render group if user provided the definition
        let newDept: number;

        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressToolPanel) {
            return;
        }

        if (!columnGroup.isPadding()) {
            let renderedGroup = new ToolPanelGroupComp(columnGroup, dept, this.onGroupExpanded.bind(this), this.props.allowDragging);
            this.context.wireBean(renderedGroup);
            this.getGui().appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            this.renderedItems[columnGroup.getId()] = renderedGroup;
        } else {
            // no children, so no indent
            newDept = dept;
        }

        this.recursivelyRenderComponents(columnGroup.getChildren(), newDept);

    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.columnTree, true);
    }

    private recursivelyRenderColumnComponent(column: Column, dept: number): void {
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }

        let renderedColumn = new ToolPanelColumnComp(column, dept, this.props.allowDragging);
        this.context.wireBean(renderedColumn);
        this.getGui().appendChild(renderedColumn.getGui());

        this.renderedItems[column.getId()] = renderedColumn;
    }

    private recursivelyRenderComponents(tree: OriginalColumnGroupChild[], dept: number): void {
        tree.forEach(child => {
            if (child instanceof OriginalColumnGroup) {
                this.recursivelyRenderGroupComponent(<OriginalColumnGroup> child, dept);
            } else {
                this.recursivelyRenderColumnComponent(<Column> child, dept);
            }
        });
    }

    public destroy(): void {
        super.destroy();
        this.resetColumns();
    }

    public doSetExpandedAll(value: boolean): void {
        _.iterateObject(this.renderedItems, (key, renderedItem) => {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpandable(value);
            }
        });
    }

    public doFilterColumns(filterText:string) {
        _.iterateObject(this.renderedItems, (key, value) => {
            value.onColumnFilterChanged(filterText);
        })
    }

    public doSetVisibilityAll(visible:boolean) {
        this.recursivelySetVisibility(this.columnTree, visible);
    }

    private recursivelySetVisibility(columnTree: any[], visible: boolean): void {
        columnTree.forEach(child => {

            let component: ColumnItem = this.renderedItems[child.getId()];
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
        })

    }

    public doSetSelectedAll(checked:boolean): void {
        _.iterateObject(this.renderedItems, (key, column)=>{
            column.onSelectAllChanged (checked);
        });
    }
}
