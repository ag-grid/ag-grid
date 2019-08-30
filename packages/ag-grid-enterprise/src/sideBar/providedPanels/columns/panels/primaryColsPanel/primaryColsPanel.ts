import { Autowired, Component, GridOptionsWrapper, Listener, PostConstruct, RefSelector } from "ag-grid-community/main";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
import { PrimaryColsHeaderPanel } from "./primaryColsHeaderPanel";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";

export interface BaseColumnItem {

    getDisplayName(): string | null;

    onSelectAllChanged(value: boolean): void;

    isSelected(): boolean;

    isSelectable(): boolean;

    isExpandable(): boolean;

    setExpanded(value: boolean): void;

}

export class PrimaryColsPanel extends Component {

    private static TEMPLATE =
        `<div class="ag-column-select-panel">
            <ag-primary-cols-header ref="primaryColsHeaderPanel"></ag-primary-cols-header>
            <ag-primary-cols-list ref="primaryColsListPanel"></ag-primary-cols-list>
        </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('primaryColsHeaderPanel')
    private primaryColsHeaderPanel: PrimaryColsHeaderPanel;

    @RefSelector('primaryColsListPanel')
    private primaryColsListPanel: PrimaryColsListPanel;

    private readonly allowDragging: boolean;
    private readonly params: ToolPanelColumnCompParams;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    constructor(allowDragging: boolean, params: ToolPanelColumnCompParams) {
        super(PrimaryColsPanel.TEMPLATE);
        this.allowDragging = allowDragging;
        this.params = params;
    }

    @PostConstruct
    public init(): void {

        this.primaryColsHeaderPanel.init(this.params);
        this.primaryColsListPanel.init(this.params, this.allowDragging);

        const hideFilter = this.params.suppressColumnFilter;
        const hideSelect = this.params.suppressColumnSelectAll;
        const hideExpand = this.params.suppressColumnExpandAll;

        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }

        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addDestroyableEventListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));

        this.addDestroyableEventListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
    }

    private onFilterChanged(event: any) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    }

    private onSelectAll() {
        this.primaryColsListPanel.doSetSelectedAll(true);
    }

    private onUnselectAll() {
        this.primaryColsListPanel.doSetSelectedAll(false);
    }

    private onExpandAll() {
        this.primaryColsListPanel.doSetExpandedAll(true);
    }

    private onCollapseAll() {
        this.primaryColsListPanel.doSetExpandedAll(false);
    }

    private onGroupExpanded(event: any) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    }

}
