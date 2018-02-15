import {
    _,
    Autowired,
    BaseHtmlElementBuilder,
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
    Utils,
    HtmlElementBuilder
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";
import {ToolbarBuilder, ToolbarItemBuilder} from "../../toolbar/toolbar";


export interface ToolPanelBaseColumnItem {
    onColumnFilterChanged(filterText: string): void;

    onSelectAllChanged(value: boolean): void;

    isSelected(): boolean;

    isSelectable(): boolean;

    isExpandable(): boolean;

    setExpandable(value: boolean): void;

}

export type ToolPanelColumnItem = ToolPanelBaseColumnItem & Component;




export class ColumnSelectComp extends Component {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private globalEventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('column-select-header')
    eColumnSelectHeader: HTMLElement;

    @RefSelector('column-select-columns')
    eColumnSelectColumns: HTMLElement;



    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;
    @RefSelector('expandAllButton')
    private eExpandAll: HTMLButtonElement;
    @RefSelector('collapseAllButton')
    private eCollapseAll: HTMLButtonElement;
    @RefSelector('selectAllButton')
    private eSelectAll: HTMLInputElement;
    @RefSelector('deselectAllButton')
    private eDeselectAll: HTMLInputElement;


    private renderedItems: { [key: string]: ToolPanelColumnItem };

    private columnTree: OriginalColumnGroupChild[];

    private allowDragging: boolean;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super();
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        BaseHtmlElementBuilder
            .from('div', 'ag-column-select-panel')
            .withChild(BaseHtmlElementBuilder
                .from('div', "ag-column-select-header", 'column-select-header')
                .withChild(this.createFilter())
                .withChild(this.createToolbar())
            )
            .withChild(this.createColumnsContainer())
            .withBinding(this)
            .build();

        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    createFilter():HtmlElementBuilder {
        return BaseHtmlElementBuilder
            .from('div', "ag-filter-body")
            .withChild(BaseHtmlElementBuilder.fromString(`<input class="ag-filter-filter" ref="filterTextField" type="text">`)
                .withProperty('placeholder', this.translate('filterOoo', 'Filter...'))
                .withEventHandler('input', _.debounce(this.onFilterTextFieldChanged.bind(this), 400))
            );
    }

    createColumnsContainer():HtmlElementBuilder {
        return BaseHtmlElementBuilder
            .from('div', "ag-column-select-columns", 'column-select-columns');
    }

    createToolbar(): ToolbarBuilder{
        return new ToolbarBuilder()
            .withButtons([
                new ToolbarItemBuilder()
                    .withChild(`<span class="ag-icon ag-icon-checkbox-checked">`)
                    .withEventHandler('click', this.onSelectAll.bind(this)),
                new ToolbarItemBuilder()
                    .withChild(`<span class="ag-icon ag-icon-checkbox-unchecked">`)
                    .withEventHandler('click', this.onDeselectAll.bind(this)),
                new ToolbarItemBuilder()
                    .withChild(`<span class="ag-icon ag-icon-expanded">`)
                    .withEventHandler('click', this.onExpandAll.bind(this)),
                new ToolbarItemBuilder()
                    .withChild(`<span class="ag-icon ag-icon-contracted">`)
                    .withEventHandler('click', this.onCollapseAll.bind(this)),
            ]);
    }

    private onExpandAll(event: Event) {
        _.addAgGridEventPath(event);
        this.doSetExandedAll(true);
    }

    private onCollapseAll(event: Event) {
        _.addAgGridEventPath(event);
        this.doSetExandedAll(false);
    }

    private doSetExandedAll(value: boolean): void {
        _.iterateObject(this.renderedItems, (key, renderedItem) => {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpandable(value);
            }
        });

    }

    private onDeselectAll(event: Event) {
        _.addAgGridEventPath(event);
        this.doSelectAll(false);
    }

    private onSelectAll(event: Event) {
        _.addAgGridEventPath(event);
        this.doSelectAll(true);
    }

    private doSelectAll(value:boolean): void {
        _.iterateObject(this.renderedItems, (key, column) => {
            column.onSelectAllChanged(value);
        });
    }

    private onFilterTextFieldChanged() {
        let filterText = this.eFilterTextField.value;

        _.iterateObject(this.renderedItems, (key, value) => {
            value.onColumnFilterChanged(filterText);
        })
    }

    private translate(toTranslate: string, defaultValue: string): string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, defaultValue);
    }

    public onColumnsChanged(): void {
        this.resetColumns();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        this.recursivelyRenderComponents(this.columnTree, 0);
    }

    public destroy(): void {
        super.destroy();
        this.resetColumns();
    }

    private resetColumns(): void {
        Utils.removeAllChildren(this.eColumnSelectColumns);
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
            this.eColumnSelectColumns.appendChild(renderedGroup.getGui());
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
        if (column.getColDef() && column.getColDef().suppressToolPanel) {
            return;
        }

        let renderedColumn = new ToolPanelColumnComp(column, dept, this.allowDragging);
        this.context.wireBean(renderedColumn);
        this.eColumnSelectColumns.appendChild(renderedColumn.getGui());


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

        });
    }

    public onGroupExpanded(): void {
        this.recursivelySetVisibility(this.columnTree, true);
    }
}
