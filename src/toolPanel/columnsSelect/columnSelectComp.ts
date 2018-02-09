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
    OriginalColumnGroupChild,
    RefSelector,
    GridOptionsWrapper,
    _
} from "ag-grid/main";
import {ToolPanelGroupComp} from "./toolPanelGroupComp";
import {ToolPanelColumnComp} from "./toolPanelColumnComp";

enum CheckboxState {CHECKED, UNCHECKED, INTERMEDIATE};

export interface ToolPanelBaseColumnItem {
    onColumnFilterChanged(filterText: string): void;

    onSelectAllChanged (value:boolean):void;

    isSelected():boolean;

    isSelectable():boolean;

    setSelectionCallback (callback:(selected:boolean)=>void):void;
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

    private eFilterTextField: HTMLInputElement;
    private eSelectAllContainer: HTMLElement;
    private eSelectAll: HTMLInputElement;
    private selectAllState: CheckboxState = CheckboxState.UNCHECKED;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateCheckedIcon: HTMLElement;

    static translate = ()=>{};

    private static TEMPLATE = `<div class="ag-column-select-panel">
        <div class="ag-column-select-header" ref="column-select-header"></div>
        <div class="ag-column-select-columns" ref="column-select-columns"></div>
    </div>`;

    private renderedItems: {[key: string]: ToolPanelColumnItem};

    private columnTree: OriginalColumnGroupChild[];

    private allowDragging: boolean;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super(ColumnSelectComp.TEMPLATE);
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.setupHeader ();
        this.addDestroyableEventListener(this.globalEventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    }

    private setupHeader ():void{
        this.setupFilterBox();
        this.setupSelectAll();
    }

    private setupSelectAll() {
        let translate = this.translate.bind(this);
        this.eColumnSelectHeader.appendChild(_.loadTemplate(`<label ref="selectAllContainer">
            <div ref="selectAll" class="ag-filter-checkbox"></div><span class="ag-filter-value">(${translate('selectAll', 'Select All')})</span>
        </label>`));

        this.eSelectAllContainer = this.getRefElement('selectAllContainer');
        this.eSelectAll = <HTMLInputElement>this.getRefElement('selectAll');

        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, null);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, null);
        this.eIndeterminateCheckedIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, null);

        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
    }

    private onSelectAll(event: Event) {
        _.addAgGridEventPath(event);
        if (this.selectAllState === CheckboxState.CHECKED) {
            this.selectAllState = CheckboxState.UNCHECKED;
        } else {
            this.selectAllState = CheckboxState.CHECKED;
        }
        this.doSelectAll();
    }

    private doSelectAll(): void {
        let checked = this.selectAllState === CheckboxState.CHECKED;
        _.iterateObject(this.renderedItems, (key, column)=>{
            column.onSelectAllChanged (checked);
        });

        this.updateCheckboxIcon();
    }



    private updateCheckboxIcon() {
        _.removeAllChildren(this.eSelectAll);

        let selectedCount: number = 0;
        let allSelectableCount: number = 0;
        _.iterateObject(this.renderedItems, (key, renderedItem) =>{
            if (renderedItem.isSelected()) selectedCount ++;
            if (renderedItem.isSelectable()) allSelectableCount ++;
        });


        if (selectedCount === allSelectableCount){
            this.selectAllState = CheckboxState.CHECKED;
            this.eSelectAll.appendChild(this.eCheckedIcon);
        } else if (selectedCount === 0){
            this.selectAllState = CheckboxState.UNCHECKED;
            this.eSelectAll.appendChild(this.eUncheckedIcon);
        } else {
            this.selectAllState = CheckboxState.INTERMEDIATE;
            this.eSelectAll.appendChild(this.eIndeterminateCheckedIcon);
        }
    }


    setupFilterBox() {
        let translate = this.translate.bind(this);
        this.eColumnSelectHeader.appendChild(_.loadTemplate(`<div class="ag-filter-body">
            <input ref="filterTextField" class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
        </div>`));

        this.eFilterTextField = <HTMLInputElement>this.getRefElement('filterTextField');

        let debounceMs = 400;
        let toDebounce: () => void = _.debounce(this.onFilterTextFieldChanged.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eFilterTextField, 'input', toDebounce);
    }


    private onFilterTextFieldChanged() {
        let filterText = this.eFilterTextField.value;

        _.iterateObject(this.renderedItems, (key, value)=>{
            value.onColumnFilterChanged (filterText);
        })
    }

    private translate(toTranslate:string, defaultValue:string):string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, defaultValue);
    }

    public onColumnsChanged(): void {
        this.resetColumns();
        this.columnTree = this.columnController.getPrimaryColumnTree();
        this.recursivelyRenderComponents(this.columnTree, 0);
        this.updateCheckboxIcon();
    }

    public destroy(): void {
        super.destroy();
        this.resetColumns();
    }

    private resetColumns(): void {
        Utils.removeAllChildren(this.eColumnSelectColumns);
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
            this.eColumnSelectColumns.appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;

            renderedGroup.setSelectionCallback(()=>{
                this.updateCheckboxIcon();
            });

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
        this.eColumnSelectColumns.appendChild(renderedColumn.getGui());

        renderedColumn.setSelectionCallback(()=>{
            this.updateCheckboxIcon();
        });

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
