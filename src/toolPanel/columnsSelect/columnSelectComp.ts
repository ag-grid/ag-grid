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


export class ToolpanelHeaderComp extends Component {
    public static TEMPLATE: string = `<div class="ag-column-select-header" ref="column-select-header"></div>`;

    constructor(
        private context:Context,
        private onFilterChanged:(filterValue:string)=>void,
        private onExpandAll: (event:MouseEvent)=>void,
        private onCollapseAll: (event:MouseEvent)=>void,
        private onSelectAll: (event:MouseEvent)=>void,
        private onUnselectAll: (event:MouseEvent)=>void,
    ){
        super(ToolpanelHeaderComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addChildComponentToRef (this.context, ()=> new ToolpanelFilterComp(this.onFilterChanged));
        this.addChildComponentToRef(this.context, ()=> new ToolbarComp (this.onExpandAll, this.onCollapseAll, this.onSelectAll, this.onUnselectAll));

    }
}

export class ToolbarComp extends Component {
    public static TEMPLATE = `<div class="ag-column-tool-panel" ref="toolPanel">
            <div class="ag-column-tool-panel-item" ref="selectAllButton">
                <button><span class="ag-icon ag-icon-checkbox-checked"></button>
            </div>
            <div class="ag-column-tool-panel-item" ref="deselectAllButton">
                <button><span class="ag-icon ag-icon-checkbox-unchecked"></button>
            </div>
             <div class="ag-column-tool-panel-item" ref="expandAllButton">
                <button><span class="ag-icon ag-icon-expanded"></button>
            </div>
            <div class="ag-column-tool-panel-item" ref="collapseAllButton">
                <button><span class="ag-icon ag-icon-contracted"></button>
            </div>
        </div>`;

    @RefSelector('expandAllButton')
    private eExpandAll: HTMLButtonElement;
    @RefSelector('collapseAllButton')
    private eCollapseAll: HTMLButtonElement;
    @RefSelector('selectAllButton')
    private eSelectAll: HTMLInputElement;
    @RefSelector('deselectAllButton')
    private eDeselectAll: HTMLInputElement;

    constructor(
        private onExpandAll: (event:MouseEvent)=>void,
        private onCollapseAll: (event:MouseEvent)=>void,
        private onSelectAll: (event:MouseEvent)=>void,
        private onUnselectAll: (event:MouseEvent)=>void,
    ){
        super(ToolbarComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.eExpandAll, 'click', this.onExpandAll);
        this.addDestroyableEventListener(this.eCollapseAll, 'click', this.onCollapseAll);
        this.addDestroyableEventListener(this.eSelectAll, 'click', this.onSelectAll);
        this.addDestroyableEventListener(this.eDeselectAll, 'click', this.onUnselectAll);
    }
}

export class ToolpanelFilterComp extends Component {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;

    public static TEMPLATE = (translatedPlaceholder:string)=>`<div class="ag-filter-body">
            <input class="ag-filter-filter" ref="filterTextField" type="text" placeholder="${translatedPlaceholder}">
        </div>`;

    constructor(
        private onFilterChanged:(filterValue:string)=>void
    ){
        super();
    }

    @PostConstruct
    public init(): void {
        let placeHolder:string = this.translate('filterOoo', 'Filter...');
        this.setTemplate (ToolpanelFilterComp.TEMPLATE (placeHolder));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', _.debounce(this.onFilterTextFieldChanged.bind(this), 400))
    }

    translate(toTranslate: string, defaultValue: string): string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, defaultValue);
    }

    private onFilterTextFieldChanged() {
        let filterText = this.eFilterTextField.value;

        this.onFilterChanged(filterText)
    }
}

export class ToolpanelColumnsContainerComp extends Component {
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;

    private columnTree: OriginalColumnGroupChild[];
    private renderedItems: { [key: string]: ToolPanelColumnItem };

    public static TEMPLATE = `<div class="ag-column-select-columns" ref="column-select-columns"></div>`;

    constructor(
        private context:Context,
        private allowDragging: boolean
    ){
        super(ToolpanelColumnsContainerComp.TEMPLATE);
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
    private static TEMPLATE = '<div class="ag-column-select-panel"></div>';


    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('column-select-header')
    eColumnSelectHeader: HTMLElement;





    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;







    private allowDragging: boolean;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super(ColumnSelectComp.TEMPLATE);
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        let toolpanelColumnsContainerComp = new ToolpanelColumnsContainerComp(this.context, this.allowDragging);
        this.addChildComponentToRef (this.context, ()=> new ToolpanelHeaderComp(
            this.context,
            this.onFilterTextFieldChanged.bind(this),
            (event)=>this.onExpandAll(event, toolpanelColumnsContainerComp),
            (event)=>this.onCollapseAll(event, toolpanelColumnsContainerComp),
            (event)=>this.onSelectAll(event, toolpanelColumnsContainerComp),
            (event)=>this.onDeselectAll(event, toolpanelColumnsContainerComp),
        ));
        this.addChildComponentToRef (this.context, ()=> toolpanelColumnsContainerComp);
    }

    private onFilterTextFieldChanged(value:string, toolpanelColumnsContainerComp: ToolpanelColumnsContainerComp) {
        toolpanelColumnsContainerComp.doFilterColumns(value);
    }

    private onSelectAll(event: Event, toolpanelColumnsContainerComp: ToolpanelColumnsContainerComp) {
        _.addAgGridEventPath(event);
        toolpanelColumnsContainerComp.doSetSelectedAll(true);
    }

    private onDeselectAll(event: Event, toolpanelColumnsContainerComp: ToolpanelColumnsContainerComp) {
        _.addAgGridEventPath(event);
        toolpanelColumnsContainerComp.doSetSelectedAll(false);
    }

    private onExpandAll(event: Event, toolpanelColumnsContainerComp: ToolpanelColumnsContainerComp) {
        _.addAgGridEventPath(event);
        toolpanelColumnsContainerComp.doSetExpandedAll(true);
    }

    private onCollapseAll(event: Event, toolpanelColumnsContainerComp: ToolpanelColumnsContainerComp) {
        _.addAgGridEventPath(event);
        toolpanelColumnsContainerComp.doSetExpandedAll(false);
    }



}
