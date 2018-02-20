import {
    _,
    Autowired,
    Column,
    ColumnController,
    Component,
    Context,
    Events,
    EventService,
    GridOptionsWrapper,
    OriginalColumnGroup,
    OriginalColumnGroupChild,
    PostConstruct,
    RefSelector,
    Utils
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";

export interface ToolPanelBaseColumnItem {
    onColumnFilterChanged(filterText: string): void;

    onSelectAllChanged(value: boolean): void;

    isSelected(): boolean;

    isSelectable(): boolean;

    isExpandable(): boolean;

    setExpandable(value: boolean): void;

}

export type ToolPanelColumnItem = ToolPanelBaseColumnItem & Component;

export class ToolPanelColumnsContainerComp extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;

    private columnTree: OriginalColumnGroupChild[];
    private renderedItems: { [key: string]: ToolPanelColumnItem };

    public static TEMPLATE = `<div class="ag-column-select-columns" ref="column-select-columns"></div>`;

    constructor(
        private context:Context,
        private allowDragging: boolean
    ){
        super(ToolPanelColumnsContainerComp.TEMPLATE);
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
            let renderedGroup = new ToolPanelGroupComp(columnGroup, dept, this.onGroupExpanded.bind(this), this.allowDragging);
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

        let renderedColumn = new ToolPanelColumnComp(column, dept, this.allowDragging);
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

    public doSetVisibilityAll (visible:boolean) {
        this.recursivelySetVisibility (this.columnTree, visible);
    }

    private recursivelySetVisibility(columnTree: any[], visible: boolean): void {
        columnTree.forEach(child => {

            let component: ToolPanelColumnItem = this.renderedItems[child.getId()];
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

export class ColumnSelectComp extends Component {

    private static TEMPLATE =
        `<div class="ag-column-select-panel">
            <ag-column-select-header 
                (expand-all)="onExpandAll"
                (collapse-all)="onCollapseAll"
                (select-all)="onSelectAll"
                (unselect-all)="onUnselectAll"
                [filter-changed-callback]="filterChangedCallback"
                />
        </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('column-select-header')
    private eColumnSelectHeader: HTMLElement;

    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;

    private allowDragging: boolean;

    private toolPanelColumnsContainerComp: ToolPanelColumnsContainerComp;

    private filterChangedCallback = this.onFilterTextFieldChanged.bind(this);

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super(ColumnSelectComp.TEMPLATE);
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.toolPanelColumnsContainerComp = new ToolPanelColumnsContainerComp(this.context, this.allowDragging);

        this.addChildComponentToRef (this.context, ()=> this.toolPanelColumnsContainerComp);

        this.instantiate(this.context);
    }

    private onFilterTextFieldChanged(value: string) {
        this.toolPanelColumnsContainerComp.doFilterColumns(value);
    }

    private onSelectAll() {
        this.toolPanelColumnsContainerComp.doSetSelectedAll(true);
    }

    private onUnselectAll() {
        this.toolPanelColumnsContainerComp.doSetSelectedAll(false);
    }

    private onExpandAll() {
        this.toolPanelColumnsContainerComp.doSetExpandedAll(true);
    }

    private onCollapseAll() {
        this.toolPanelColumnsContainerComp.doSetExpandedAll(false);
    }

}
