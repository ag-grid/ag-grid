import {PreConstruct, _, Autowired, Component, Context, Events, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid/main";

export class ColumnSelectHeaderComp extends Component {

    @Autowired('context') private context: Context;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eFilterTextField')
    private eFilterTextField: HTMLInputElement;

    private onFilterTextChangedDebounced: ()=>void;

    @PreConstruct
    private preConstruct(): void {

        let translate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.setTemplate(
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
            
            <div class="ag-filter-body">
                <input class="ag-filter-filter" ref="eFilterTextField" type="text" placeholder="${translate('filterOoo', 'Filter...')}" (input)="onFilterTextChanged">
            </div>
        
        </div>`);
    }

    @PostConstruct
    public init(): void {
        this.instantiate(this.context);
    }

    private onFilterTextChanged(): void {
        if (!this.onFilterTextChangedDebounced) {
            this.onFilterTextChangedDebounced = _.debounce( ()=> {
                let filterText = this.eFilterTextField.value;
                this.dispatchEvent({type: 'filterChanged', filterText: filterText});
            }, 400);
        }

        this.onFilterTextChangedDebounced();
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
