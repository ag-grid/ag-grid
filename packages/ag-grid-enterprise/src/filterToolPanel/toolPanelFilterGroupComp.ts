import { RefPlaceholder, _clearElement, _setAriaLabel, _setAriaRole } from 'ag-stack';

import type {
    AgColumn,
    AgProvidedColumnGroup,
    FilterOpenedEvent,
    IconName,
    TooltipCallbackParams,
    TooltipFeature,
} from 'ag-grid-community';
import {
    Component,
    _addGridCommonParams,
    _createIconNoSpan,
    _getHeaderTooltipComponentDefinition,
    _getShouldDisplayTooltip,
    _resolveHeaderTooltipValue,
    isProvidedColumnGroup,
} from 'ag-grid-community';

import { AgGroupComponentSelector } from '../agStack/agGroupComponent';
import type { GroupComponent, GroupComponentParams } from '../widgets/gridEnterpriseWidgetTypes';
import { ToolPanelFilterComp } from './toolPanelFilterComp';

export type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

export class ToolPanelFilterGroupComp extends Component {
    private readonly filterGroupComp: GroupComponent = RefPlaceholder;

    private filterGroupName: string | null;
    private tooltipFeature?: TooltipFeature;

    constructor(
        private readonly columnGroup: AgColumn | AgProvidedColumnGroup,
        private childFilterComps: (ToolPanelFilterGroupComp | ToolPanelFilterComp)[],
        private readonly expandedCallback: () => void,
        private readonly depth: number,
        private readonly showingColumn: boolean
    ) {
        super();
    }

    public postConstruct(): void {
        const groupParams: GroupComponentParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical',
        };
        this.setTemplate(
            {
                tag: 'div',
                cls: 'ag-filter-toolpanel-group-wrapper',
                children: [{ tag: 'ag-group-component', ref: 'filterGroupComp' }],
            },
            [AgGroupComponentSelector],
            { filterGroupComp: groupParams }
        );

        this.setGroupTitle();
        const { filterGroupComp, depth, childFilterComps, gos } = this;
        filterGroupComp.setAlignItems('stretch');

        filterGroupComp.addCss(`ag-filter-toolpanel-group-level-${depth}`);
        filterGroupComp.getGui().style.setProperty('--ag-indentation-level', String(depth));
        filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${depth}-header`);

        for (const filterComp of childFilterComps) {
            filterGroupComp.addItem(filterComp as Component);
            filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${depth + 1}-header`);
            filterComp.getGui().style.setProperty('--ag-indentation-level', String(depth + 1));
        }

        const column = this.showingColumn ? (this.columnGroup as AgColumn) : undefined;
        const getColDef = () => column?.colDef ?? (this.columnGroup as AgProvidedColumnGroup).getColGroupDef();
        this.tooltipFeature = this.createOptionalManagedBean(
            this.beans.tooltipSvc?.createTooltip({
                getGui: () => filterGroupComp.getTitleBarGui(),
                getTooltipComponentDefinition: () => _getHeaderTooltipComponentDefinition(getColDef()),
                getLocation: () => 'filterToolPanelColumnGroup',
                getTooltipValue: () => {
                    const colDef = getColDef();
                    const displayName = this.filterGroupName;
                    return _resolveHeaderTooltipValue(
                        colDef,
                        _addGridCommonParams<TooltipCallbackParams>(gos, {
                            location: 'filterToolPanelColumnGroup',
                            colDef,
                            column: this.columnGroup,
                            value: displayName,
                            valueFormatted: displayName,
                        })
                    );
                },
                shouldDisplayTooltip: _getShouldDisplayTooltip(
                    gos,
                    () => filterGroupComp.getGui().querySelector('.ag-group-title') as HTMLElement | undefined
                ),
                getAdditionalParams: () => {
                    const colDef = getColDef();
                    return {
                        ...(colDef ? { colDef } : {}),
                        column: this.columnGroup,
                        valueFormatted: this.filterGroupName,
                    };
                },
            })
        );

        this.refreshFilterClass();
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
        this.addInIcon('filterActive');
    }

    private setupTooltip(): void {
        const refresh = () => this.tooltipFeature?.refreshTooltip();

        refresh();

        this.addManagedEventListeners({ newColumnsLoaded: refresh });
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }

    public onPanelHidden() {
        for (const filterComp of this.childFilterComps) {
            filterComp.onPanelHidden();
        }
    }

    public isColumnGroup(): boolean {
        return isProvidedColumnGroup(this.columnGroup);
    }

    public isExpanded(): boolean {
        return this.filterGroupComp.isExpanded();
    }

    public getChildren(): ToolPanelFilterItem[] {
        return this.childFilterComps;
    }

    public getFilterGroupName(): string {
        return this.filterGroupName ?? '';
    }

    public getFilterGroupId(): string {
        return this.columnGroup.getId();
    }

    public hideGroupItem(hide: boolean, index: number) {
        this.filterGroupComp.hideItem(hide, index);
    }

    public hideGroup(hide: boolean) {
        this.setDisplayed(!hide);
    }

    private addInIcon(iconName: IconName): void {
        const eIcon = _createIconNoSpan(iconName, this.beans)!;
        if (eIcon) {
            eIcon.classList.add('ag-filter-toolpanel-group-instance-header-icon');
            // as we only display the icons when the filter is active
            // the aria-label should always be `ariaFilterActive`.
            const translate = this.getLocaleTextFunc();
            _setAriaLabel(eIcon, translate('ariaFilterActive', 'Filter Active'));
            _setAriaRole(eIcon, 'img');
        }
        this.filterGroupComp.addTitleBarWidget(eIcon);
    }

    private forEachToolPanelFilterChild(action: (filterComp: ToolPanelFilterItem) => void) {
        for (const filterComp of this.childFilterComps) {
            if (filterComp instanceof ToolPanelFilterComp) {
                action(filterComp);
            }
        }
    }

    private addExpandCollapseListeners() {
        const expandListener = this.isColumnGroup()
            ? () => this.expandedCallback()
            : () => this.forEachToolPanelFilterChild((filterComp) => filterComp.expand());

        const collapseListener = this.isColumnGroup()
            ? () => this.expandedCallback()
            : () => this.forEachToolPanelFilterChild((filterComp) => filterComp.collapse());

        this.addManagedListeners(this.filterGroupComp, {
            expanded: expandListener,
            collapsed: collapseListener,
        });
    }

    private getColumns(): AgColumn[] {
        if (isProvidedColumnGroup(this.columnGroup)) {
            return this.columnGroup.getLeafColumns();
        }

        return [this.columnGroup];
    }

    private addFilterChangedListeners() {
        for (const column of this.getColumns()) {
            this.addManagedListeners(column, { filterChanged: () => this.refreshFilterClass() });
        }

        if (!isProvidedColumnGroup(this.columnGroup)) {
            this.addManagedEventListeners({ filterOpened: this.onFilterOpened.bind(this) });
        }
    }

    private refreshFilterClass(): void {
        const columns = this.getColumns();

        const anyChildFiltersActive = () => columns.some((col) => col.isFilterActive());
        this.filterGroupComp.toggleCss('ag-has-filter', anyChildFiltersActive());
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.

        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.columnGroup) {
            return;
        }
        if (!this.isExpanded()) {
            return;
        }

        this.collapse();
    }

    public expand() {
        this.filterGroupComp.toggleGroupExpand(true);
    }

    public collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }

    private setGroupTitle() {
        const columnGroup = this.columnGroup;
        const filterGroupName = isProvidedColumnGroup(columnGroup)
            ? this.getColumnGroupName(columnGroup)
            : this.getColumnName(columnGroup);
        this.filterGroupName = filterGroupName;

        this.filterGroupComp.setTitle(filterGroupName || '');
    }

    private getColumnGroupName(columnGroup: AgProvidedColumnGroup): string | null {
        return this.beans.colNames.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    }

    private getColumnName(column: AgColumn): string | null {
        return this.beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel', false);
    }

    private destroyFilters() {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        _clearElement(this.getGui());
    }

    public override destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
