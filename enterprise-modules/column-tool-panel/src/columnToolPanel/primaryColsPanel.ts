import {
    Autowired,
    ColDef,
    ColGroupDef,
    Component,
    GridOptionsWrapper,
    ToolPanelColumnCompParams,
    RefSelector,
    IPrimaryColsPanel
} from "ag-grid-community";
import {PrimaryColsListPanel} from "./primaryColsListPanel";
import {PrimaryColsHeaderPanel} from "./primaryColsHeaderPanel";

export interface BaseColumnItem {
    getDisplayName(): string | null;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}

export class PrimaryColsPanel extends Component implements IPrimaryColsPanel {

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

    private allowDragging: boolean;
    private params: ToolPanelColumnCompParams;

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    public init(allowDragging: boolean, params: ToolPanelColumnCompParams): void {
        this.setTemplate(PrimaryColsPanel.TEMPLATE);
        this.allowDragging = allowDragging;
        this.params = params;

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
        this.addDestroyableEventListener(this.primaryColsListPanel, 'selectionChanged', this.onSelectionChange.bind(this));
    }

    public onExpandAll(): void {
        this.primaryColsListPanel.doSetExpandedAll(true);
    }

    public onCollapseAll(): void {
        this.primaryColsListPanel.doSetExpandedAll(false);
    }

    public expandGroups(groupIds?: string[]): void {
        this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
    }

    public collapseGroups(groupIds?: string[]): void {
        this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
    }

    public setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void {
        this.primaryColsListPanel.setColumnLayout(colDefs);
    }

    private onFilterChanged(event: any): void {
        this.primaryColsListPanel.setFilterText(event.filterText);
    }

    public syncLayoutWithGrid(): void {
        this.primaryColsListPanel.syncColumnLayout();
    }

    public notifyListeners(): void {
        this.primaryColsListPanel.notifyListeners();
    }

    private onSelectAll(): void {
        this.primaryColsListPanel.doSetSelectedAll(true);
    }

    private onUnselectAll(): void {
        this.primaryColsListPanel.doSetSelectedAll(false);
    }

    private onGroupExpanded(event: any): void {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    }

    private onSelectionChange(event: any): void {
        this.primaryColsHeaderPanel.setSelectionState(event.state);
    }
}
