import type {
    AbstractColDef,
    AgComponentSelector,
    BeanCollection,
    ColGroupDef,
    ColumnEventType,
    ColumnModel,
    ColumnNameService,
    ColumnToolPanelState,
    InternalColumn,
    InternalProvidedColumnGroup,
    VirtualListModel,
} from '@ag-grid-community/core';
import {
    Component,
    Events,
    VirtualList,
    _exists,
    _includes,
    _setAriaLabel,
    _setAriaLevel,
    isProvidedColumnGroup,
} from '@ag-grid-community/core';
import type { ToolPanelColDefService } from '@ag-grid-enterprise/side-bar';

import { ExpandState } from './agPrimaryColsHeader';
import { ColumnModelItem } from './columnModelItem';
import type { ToolPanelColumnCompParams } from './columnToolPanel';
import type { ModelItemUtils } from './modelItemUtils';
import { PrimaryColsListPanelItemDragFeature } from './primaryColsListPanelItemDragFeature';
import { ToolPanelColumnComp } from './toolPanelColumnComp';
import { ToolPanelColumnGroupComp } from './toolPanelColumnGroupComp';

class UIColumnModel implements VirtualListModel {
    private readonly items: ColumnModelItem[];

    constructor(items: ColumnModelItem[]) {
        this.items = items;
    }

    public getRowCount(): number {
        return this.items.length;
    }

    public getRow(index: number): ColumnModelItem {
        return this.items[index];
    }
}

const PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';

export class AgPrimaryColsList extends Component {
    static readonly selector: AgComponentSelector = 'AG-PRIMARY-COLS-LIST';

    public static TEMPLATE = /* html */ `<div class="${PRIMARY_COLS_LIST_PANEL_CLASS}" role="presentation"></div>`;

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private colDefService: ToolPanelColDefService;
    private modelItemUtils: ModelItemUtils;

    public override wireBeans(beans: BeanCollection) {
        super.wireBeans(beans);
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.colDefService = beans.toolPanelColDefService;
        this.modelItemUtils = beans.modelItemUtils;
    }

    private allowDragging: boolean;
    private filterText: string | null;
    private expandGroupsByDefault: boolean;
    private params: ToolPanelColumnCompParams;
    private eventType: ColumnEventType;

    private groupsExist: boolean;

    private virtualList: VirtualList;

    private allColsTree: ColumnModelItem[];
    private displayedColsList: ColumnModelItem[];
    private destroyColumnItemFuncs: (() => void)[] = [];
    private hasLoadedInitialState: boolean = false;
    private isInitialState: boolean = false;

    constructor() {
        super(AgPrimaryColsList.TEMPLATE);
    }

    public override destroy(): void {
        this.destroyColumnTree();
        super.destroy();
    }

    private destroyColumnTree(): void {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach((f) => f());
        this.destroyColumnItemFuncs = [];
    }

    public init(params: ToolPanelColumnCompParams, allowDragging: boolean, eventType: ColumnEventType): void {
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;

        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));

        const eventsImpactingCheckedState: string[] = [
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED,
        ];

        eventsImpactingCheckedState.forEach((event) => {
            // update header select all checkbox with current selection state
            this.addManagedListener(this.eventService, event, this.fireSelectionChangedEvent.bind(this));
        });

        this.expandGroupsByDefault = !this.params.contractColumnSelection;

        this.virtualList = this.createManagedBean(
            new VirtualList({
                cssIdentifier: 'column-select',
                ariaRole: 'tree',
            })
        );

        this.appendChild(this.virtualList.getGui());

        this.virtualList.setComponentCreator((item: ColumnModelItem, listItemElement: HTMLElement) => {
            _setAriaLevel(listItemElement, item.getDept() + 1);
            return this.createComponentFromItem(item, listItemElement);
        });

        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }

        if (this.params.suppressColumnMove) {
            return;
        }

        this.createManagedBean(new PrimaryColsListPanelItemDragFeature(this, this.virtualList));
    }

    private createComponentFromItem(item: ColumnModelItem, listItemElement: HTMLElement): Component {
        if (item.isGroup()) {
            const renderedGroup = new ToolPanelColumnGroupComp(
                item,
                this.allowDragging,
                this.eventType,
                listItemElement
            );
            this.getContext().createBean(renderedGroup);

            return renderedGroup;
        }

        const columnComp = new ToolPanelColumnComp(item, this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);

        return columnComp;
    }

    public onColumnsChanged(): void {
        if (!this.hasLoadedInitialState) {
            this.hasLoadedInitialState = true;
            this.isInitialState = !!this.params.initialState;
        }

        const expandedStates = this.getExpandedStates();

        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;

        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        } else {
            this.buildTreeFromProvidedColumnDefs();
        }

        this.setExpandedStates(expandedStates);

        this.markFilteredColumns();
        this.flattenAndFilterModel();

        this.isInitialState = false;
    }

    public getDisplayedColsList(): ColumnModelItem[] {
        return this.displayedColsList;
    }

    private getExpandedStates(): { [key: string]: boolean } {
        const res: { [id: string]: boolean } = {};

        if (this.isInitialState) {
            const { expandedGroupIds } = this.params.initialState as ColumnToolPanelState;
            expandedGroupIds.forEach((id) => {
                res[id] = true;
            });
            return res;
        }

        if (!this.allColsTree) {
            return {};
        }

        this.forEachItem((item) => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) {
                // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });

        return res;
    }

    private setExpandedStates(states: { [key: string]: boolean }): void {
        if (!this.allColsTree) {
            return;
        }

        const { isInitialState } = this;
        this.forEachItem((item) => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) {
                // group should always exist, this is defensive
                const expanded = states[colGroup.getId()];
                const groupExistedLastTime = expanded != null;
                if (groupExistedLastTime || isInitialState) {
                    item.setExpanded(!!expanded);
                }
            }
        });
    }

    private buildTreeFromWhatGridIsDisplaying(): void {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    }

    public setColumnLayout(colDefs: AbstractColDef[]): void {
        const columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);

        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some((colDef) => {
            return colDef && typeof (colDef as ColGroupDef).children !== 'undefined';
        });

        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private buildTreeFromProvidedColumnDefs(): void {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getColDefColTree());
        this.groupsExist = this.columnModel.isProvidedColGroupsPresent();
    }

    private buildListModel(columnTree: (InternalColumn | InternalProvidedColumnGroup)[]): void {
        const columnExpandedListener = this.onColumnExpanded.bind(this);
        const addListeners = (item: ColumnModelItem) => {
            item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            const removeFunc = item.removeEventListener.bind(
                item,
                ColumnModelItem.EVENT_EXPANDED_CHANGED,
                columnExpandedListener
            );
            this.destroyColumnItemFuncs.push(removeFunc);
        };

        const recursivelyBuild = (
            tree: (InternalColumn | InternalProvidedColumnGroup)[],
            dept: number,
            parentList: ColumnModelItem[]
        ): void => {
            tree.forEach((child) => {
                if (isProvidedColumnGroup(child)) {
                    createGroupItem(child, dept, parentList);
                } else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };

        const createGroupItem = (
            columnGroup: InternalProvidedColumnGroup,
            dept: number,
            parentList: ColumnModelItem[]
        ): void => {
            const columnGroupDef = columnGroup.getColGroupDef();
            const skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }

            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }

            const displayName = this.columnNameService.getDisplayNameForProvidedColumnGroup(
                null,
                columnGroup,
                'columnToolPanel'
            );
            const item: ColumnModelItem = new ColumnModelItem(
                displayName,
                columnGroup,
                dept,
                true,
                this.expandGroupsByDefault
            );

            parentList.push(item);
            addListeners(item);

            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };

        const createColumnItem = (column: InternalColumn, dept: number, parentList: ColumnModelItem[]): void => {
            const skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;

            if (skipThisColumn) {
                return;
            }

            const displayName = this.columnNameService.getDisplayNameForColumn(column, 'columnToolPanel');

            parentList.push(new ColumnModelItem(displayName, column, dept));
        };

        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    }

    private onColumnExpanded(): void {
        this.flattenAndFilterModel();
    }

    private flattenAndFilterModel(): void {
        this.displayedColsList = [];

        const recursiveFunc = (item: ColumnModelItem) => {
            if (!item.isPassesFilter()) {
                return;
            }
            this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };

        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));

        const focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();

        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }

        this.notifyListeners();

        this.refreshAriaLabel();
    }

    private refreshAriaLabel(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const columnListName = translate('ariaColumnPanelList', 'Column List');
        const localeColumns = translate('columns', 'Columns');
        const items = this.displayedColsList.length;

        _setAriaLabel(this.virtualList.getAriaElement(), `${columnListName} ${items} ${localeColumns}`);
    }

    private focusRowIfAlive(rowIndex: number): void {
        window.setTimeout(() => {
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }

    private forEachItem(callback: (item: ColumnModelItem) => void): void {
        const recursiveFunc = (items: ColumnModelItem[]) => {
            items.forEach((item) => {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };

        if (!this.allColsTree) {
            return;
        }

        recursiveFunc(this.allColsTree);
    }

    public doSetExpandedAll(value: boolean): void {
        this.forEachItem((item) => {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    }

    public setGroupsExpanded(expand: boolean, groupIds?: string[]): void {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }

        const expandedGroupIds: string[] = [];

        this.forEachItem((item) => {
            if (!item.isGroup()) {
                return;
            }

            const groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });

        const unrecognisedGroupIds = groupIds.filter((groupId) => !_includes(expandedGroupIds, groupId));
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    }

    private getExpandState(): ExpandState {
        let expandedCount = 0;
        let notExpandedCount = 0;

        this.forEachItem((item) => {
            if (!item.isGroup()) {
                return;
            }
            if (item.isExpanded()) {
                expandedCount++;
            } else {
                notExpandedCount++;
            }
        });

        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }

        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }

        return ExpandState.EXPANDED;
    }

    public doSetSelectedAll(selectAllChecked: boolean): void {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    }

    private getSelectionState(): boolean | undefined {
        let checkedCount = 0;
        let uncheckedCount = 0;

        const pivotMode = this.columnModel.isPivotMode();

        this.forEachItem((item) => {
            if (item.isGroup()) {
                return;
            }
            if (!item.isPassesFilter()) {
                return;
            }

            const column = item.getColumn();
            const colDef = column.getColDef();

            let checked: boolean;

            if (pivotMode) {
                const noPivotModeOptionsAllowed =
                    !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
            } else {
                if (colDef.lockVisible) {
                    return;
                }

                checked = column.isVisible();
            }

            checked ? checkedCount++ : uncheckedCount++;
        });

        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }

        return !(checkedCount === 0 || uncheckedCount > 0);
    }

    public setFilterText(filterText: string) {
        this.filterText = _exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }

    private markFilteredColumns(): void {
        const passesFilter = (item: ColumnModelItem) => {
            if (!_exists(this.filterText)) {
                return true;
            }

            const displayName = item.getDisplayName();

            return displayName == null || displayName.toLowerCase().indexOf(this.filterText) !== -1;
        };

        const recursivelyCheckFilter = (item: ColumnModelItem, parentPasses: boolean): boolean => {
            let atLeastOneChildPassed = false;
            if (item.isGroup()) {
                const groupPasses = passesFilter(item);
                item.getChildren().forEach((child) => {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }

            const filterPasses = parentPasses || atLeastOneChildPassed ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };

        this.allColsTree.forEach((item) => recursivelyCheckFilter(item, false));
    }

    private notifyListeners(): void {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    }

    private fireGroupExpandedEvent(): void {
        const expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    }

    private fireSelectionChangedEvent(): void {
        if (!this.allColsTree) {
            return;
        }
        const selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    }

    public getExpandedGroups(): string[] {
        const expandedGroupIds: string[] = [];

        if (!this.allColsTree) {
            return expandedGroupIds;
        }

        this.forEachItem((item) => {
            if (item.isGroup() && item.isExpanded()) {
                expandedGroupIds.push(item.getColumnGroup().getId());
            }
        });

        return expandedGroupIds;
    }
}
