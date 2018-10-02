import {Autowired, Component, Context, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid-community/main";
import {PrimaryColsListPanel} from "./primaryColsListPanel";
import {PrimaryColsHeaderPanel} from "./primaryColsHeaderPanel";
import {ToolPanelColumnCompParams} from "../../columnToolPanel";

export interface BaseColumnItem {

    getDisplayName(): string;

    onSelectAllChanged(value: boolean): void;

    isSelected(): boolean;

    isSelectable(): boolean;

    isExpandable(): boolean;

    setExpanded(value: boolean): void;

}

export class PrimaryColsPanel extends Component {

    private static TEMPLATE =
        `<div class="ag-column-select-panel">
            <ag-primary-cols-header
                [params]="params"
                (expand-all)="onExpandAll"
                (collapse-all)="onCollapseAll"
                (select-all)="onSelectAll"
                (unselect-all)="onUnselectAll"
                (filter-changed)="onFilterChanged"
                ref="eColumnSelectHeader">
            </ag-primary-cols-header>
            <ag-primary-cols-list
                [allow-dragging]="allowDragging"
                [params]="params"
                (group-expanded)="onGroupExpanded"
                ref="eToolPanelColumnsContainerComp">
            </ag-primary-cols-list>
        </div>`;

    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eColumnSelectHeader')
    private columnSelectHeaderComp: PrimaryColsHeaderPanel;

    @RefSelector('eToolPanelColumnsContainerComp')
    private columnContainerComp: PrimaryColsListPanel;

    private allowDragging: boolean;
    private params: ToolPanelColumnCompParams;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean, params: ToolPanelColumnCompParams) {
        super(PrimaryColsPanel.TEMPLATE);
        this.allowDragging = allowDragging;
        this.params = params;
    }

    @PostConstruct
    public init(): void {
        this.instantiate(this.context);

        let hideFilter = this.params.suppressColumnFilter;
        let hideSelect = this.params.suppressColumnSelectAll;
        let hideExpand = this.params.suppressColumnExpandAll;

        if (hideExpand && hideFilter && hideSelect) {
            this.columnSelectHeaderComp.setVisible(false);
        }
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

    private onGroupExpanded(event: any) {
        this.columnSelectHeaderComp.setExpandState(event.state);
    }

}
