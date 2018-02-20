import {_, Autowired, Component, Context, Events, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid/main";

export class ColumnSelectHeaderComp extends Component {

    @Autowired('context') private context: Context;

    public static TEMPLATE: string =
        `<div class="ag-column-select-header">

            <div class="ag-column-tool-panel">
                <button class="ag-column-tool-panel-item" (click)="onSelectAll">
                    <span class="ag-icon ag-icon-checkbox-checked"/>
                </button>
                <button class="ag-column-tool-panel-item" (click)="onUnselectAll">
                    <span class="ag-icon ag-icon-checkbox-unchecked"/>
                </button>
                <button class="ag-column-tool-panel-item" (click)="onExpandAll">
                    <span class="ag-icon ag-icon-expanded"/>
                </button>
                <button class="ag-column-tool-panel-item" (click)="onCollapseAll">
                    <span class="ag-icon ag-icon-contracted"/>
                </button>
            </div>
            
        </div>`;

    private attributes: {
        filterChangedCallback:(filterValue:string)=>void,
    };

    constructor() {
        super(ColumnSelectHeaderComp.TEMPLATE);
    }

    @PostConstruct
    public init(): void {

        this.addChildComponentToRef (this.context, ()=> new ToolPanelFilterComp(this.attributes.filterChangedCallback));

        // this.addChildComponentToRef(this.context, ()=> new ToolbarComp (this.onCollapseAll, this.onSelectAll, this.onUnselectAll));
        this.instantiate(this.context);
    }

    private onExpandAll(): void {
        this.dispatchEvent({type: 'expandAll'});
    }

    private onCollapseAll(): void {
        this.dispatchEvent({type: 'collapseAll'});
    }

    private onSelectAll(): void {
        this.dispatchEvent({type: 'selectAll'});
    }

    private onUnselectAll(): void {
        this.dispatchEvent({type: 'unselectAll'});
    }
}

export class ToolPanelFilterComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;

    public static TEMPLATE = (translatedPlaceholder:string)=>
        `<div class="ag-filter-body">
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
        this.setTemplate(ToolPanelFilterComp.TEMPLATE(placeHolder));
        this.addDestroyableEventListener(this.eFilterTextField, 'input', _.debounce(this.onFilterTextFieldChanged.bind(this), 400))
    }

    private translate(toTranslate: string, defaultValue: string): string {
        let translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return translate(toTranslate, defaultValue);
    }

    private onFilterTextFieldChanged() {
        let filterText = this.eFilterTextField.value;
        this.onFilterChanged(filterText)
    }
}
