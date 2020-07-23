import {
    ColDef,
    ColGroupDef,
    ToolPanelColumnCompParams,
    RefSelector,
    IPrimaryColsPanel,
    ManagedFocusComponent,
} from "@ag-grid-community/core";
import { PrimaryColsListPanel } from "./primaryColsListPanel";
import { PrimaryColsHeaderPanel } from "./primaryColsHeaderPanel";

export interface BaseColumnItem {
    getDisplayName(): string | null;
    onSelectAllChanged(value: boolean): void;
    isSelected(): boolean;
    isSelectable(): boolean;
    isExpandable(): boolean;
    setExpanded(value: boolean): void;
}

export class PrimaryColsPanel extends ManagedFocusComponent implements IPrimaryColsPanel {

    private static TEMPLATE = /* html */
        `<div class="ag-column-select">
            <ag-primary-cols-header ref="primaryColsHeaderPanel"></ag-primary-cols-header>
            <ag-primary-cols-list ref="primaryColsListPanel"></ag-primary-cols-list>
        </div>`;

    @RefSelector('primaryColsHeaderPanel') private readonly primaryColsHeaderPanel: PrimaryColsHeaderPanel;
    @RefSelector('primaryColsListPanel') private readonly primaryColsListPanel: PrimaryColsListPanel;

    private allowDragging: boolean;
    private params: ToolPanelColumnCompParams;

    constructor() {
        super(PrimaryColsPanel.TEMPLATE, true);
    }

    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    public init(allowDragging: boolean, params: ToolPanelColumnCompParams): void {
        this.allowDragging = allowDragging;
        this.params = params;

        this.primaryColsHeaderPanel.init(this.params);

        const hideFilter = this.params.suppressColumnFilter;
        const hideSelect = this.params.suppressColumnSelectAll;
        const hideExpand = this.params.suppressColumnExpandAll;

        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }

        this.addManagedListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
        this.addManagedListener(this.primaryColsListPanel, 'selectionChanged', this.onSelectionChange.bind(this));

        this.primaryColsListPanel.init(this.params, this.allowDragging);

        this.addManagedListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));
        this.wireFocusManagement();
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        const nextEl = this.focusController.findNextFocusableElement(this.getFocusableElement(), false, e.shiftKey);

        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
        }
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
