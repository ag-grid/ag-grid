import {Autowired, Component, Context, Events, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid/main";
import {ColumnContainerComp} from "./columnContainerComp";

export interface BaseColumnItem {

    getDisplayName(): string;

    onSelectAllChanged(value: boolean): void;

    isSelected(): boolean;

    isSelectable(): boolean;

    isExpandable(): boolean;

    setExpanded(value: boolean): void;

}

export class ColumnSelectComp extends Component {

    private static TEMPLATE =
        `<div class="ag-column-select-panel">
            <ag-column-select-header 
                (expand-all)="onExpandAll"
                (collapse-all)="onCollapseAll"
                (select-all)="onSelectAll"
                (unselect-all)="onUnselectAll"
                (filter-changed)="onFilterChanged">
            </ag-column-select-header>
            <ag-column-container 
                [allow-dragging]="allowDragging"
                ref="eToolPanelColumnsContainerComp">
            </ag-column-container>
        </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('column-select-header')
    private eColumnSelectHeader: HTMLElement;

    @RefSelector('filterTextField')
    private eFilterTextField: HTMLInputElement;

    private allowDragging: boolean;

    @RefSelector('eToolPanelColumnsContainerComp')
    private columnContainerComp: ColumnContainerComp;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean) {
        super(ColumnSelectComp.TEMPLATE);
        this.allowDragging = allowDragging;
    }

    @PostConstruct
    public init(): void {
        this.instantiate(this.context);
    }

    private onFilterChanged(event: any) {
        this.columnContainerComp.setFilterText(event.filterText);
    }

    private onSelectAll() {
        this.columnContainerComp.doSetSelectedAll(true);
    }

    private onUnselectAll() {
        this.columnContainerComp.doSetSelectedAll(false);
    }

    private onExpandAll() {
        this.columnContainerComp.doSetExpandedAll(true);
    }

    private onCollapseAll() {
        this.columnContainerComp.doSetExpandedAll(false);
    }

}
