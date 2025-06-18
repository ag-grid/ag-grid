import type {
    AgColumn,
    AgInputTextField,
    AgPromise,
    ComponentSelector,
    ElementParams,
    FilterDisplayParams,
    IAfterGuiAttachedParams,
    ISetFilter,
    ISetFilterParams,
    SetFilterModel,
    SetFilterModelValue,
    SetFilterParams,
    SetFilterUi,
    TextFormatter,
} from 'ag-grid-community';
import {
    AgInputTextFieldSelector,
    KeyCode,
    ProvidedFilter,
    RefPlaceholder,
    _areEqual,
    _createIconNoSpan,
    _exists,
    _getActiveDomElement,
    _makeNull,
    _setDisplayed,
    _warn,
} from 'ag-grid-community';

import type { VirtualListModel } from '../widgets/iVirtualList';
import { VirtualList } from '../widgets/virtualList';
import { FlatSetDisplayValueModel } from './flatSetDisplayValueModel';
import type { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { SET_FILTER_ADD_SELECTION_TO_FILTER, SET_FILTER_SELECT_ALL } from './iSetDisplayValueModel';
import type { SetFilterHandler } from './setFilterHandler';
import type {
    SetFilterListItemExpandedChangedEvent,
    SetFilterListItemParams,
    SetFilterListItemSelectionChangedEvent,
} from './setFilterListItem';
import { SetFilterListItem } from './setFilterListItem';
import { translateForSetFilter } from './setFilterUtils';
import { TreeSetDisplayValueModel } from './treeSetDisplayValueModel';

/** @param V type of value in the Set Filter */
export class SetFilter<V = string>
    extends ProvidedFilter<SetFilterModel, V, ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>>
    implements ISetFilter<V>, SetFilterUi
{
    public readonly filterType = 'set' as const;

    private readonly eMiniFilter: AgInputTextField = RefPlaceholder;
    private readonly eFilterLoading: HTMLElement = RefPlaceholder;
    private readonly eFilterLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eSetFilterList: HTMLElement = RefPlaceholder;
    private readonly eFilterNoMatches: HTMLElement = RefPlaceholder;

    private virtualList: VirtualList<SetFilterListItem<V | string | null>, SetFilterModelTreeItem | string | null>;

    private hardRefreshVirtualList = false;

    public handler: SetFilterHandler<V>;
    private handlerDestroyFuncs?: (() => void)[];

    private formatter: TextFormatter;
    private displayValueModel: ISetDisplayValueModel<V>;

    private miniFilterText: string | null = null;

    /** When true, in excelMode = 'windows', it adds previously selected filter items to newly checked filter selection */
    private addCurrentSelectionToFilter: boolean = false;

    /** Keys that have been selected for this filter. */
    private selectedKeys = new Set<string | null>();

    constructor() {
        super('setFilter', 'set-filter');
    }

    protected override setParams(
        params: ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>
    ): void {
        super.setParams(params);

        const handler = this.updateHandler(params.getHandler() as unknown as SetFilterHandler<V>);

        const { column, textFormatter, treeList, treeListPathGetter, treeListFormatter } = params;

        this.formatter = textFormatter ?? ((value) => value ?? null);

        this.displayValueModel = treeList
            ? new TreeSetDisplayValueModel(
                  this.formatter,
                  treeListPathGetter,
                  treeListFormatter,
                  handler.isTreeDataOrGrouping()
              )
            : (new FlatSetDisplayValueModel<V>(
                  this.beans.valueSvc,
                  () => this.handler.valueFormatter,
                  this.formatter,
                  column as AgColumn
              ) as any);

        handler.valueModel.allKeys.then((values) => {
            this.updateDisplayedValues('reload', values ?? []);
            this.resetSelectionState(values ?? []);
        });

        if (handler.valueModel.isLoading()) {
            this.setIsLoading(true);
        }

        this.initialiseFilterBodyUi();
    }

    public override refresh(legacyNewParams: SetFilterParams<any, V>): boolean {
        if (this.params.treeList !== legacyNewParams.treeList) {
            // too hard to refresh when tree list changes, just destroy
            return false;
        }
        this.updateHandler(
            (
                legacyNewParams as unknown as ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>
            ).getHandler() as unknown as SetFilterHandler<V>
        );
        return super.refresh(legacyNewParams);
    }

    protected override updateParams(
        newParams: ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>,
        oldParams: ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>
    ): void {
        super.updateParams(newParams, oldParams);

        this.updateMiniFilter();

        if (newParams.suppressSelectAll !== oldParams.suppressSelectAll) {
            this.createVirtualListModel(newParams);
        }

        const { textFormatter, treeListPathGetter, treeListFormatter } = newParams;

        this.formatter = textFormatter ?? ((value) => value ?? null);

        if (this.displayValueModel instanceof TreeSetDisplayValueModel) {
            this.displayValueModel.updateParams(treeListPathGetter, treeListFormatter);
        }
        this.handler.refreshFilterValues();
    }

    private updateHandler(handler: SetFilterHandler<V>): SetFilterHandler<V> {
        const oldHandler = this.handler;
        if (oldHandler !== handler) {
            this.handlerDestroyFuncs?.forEach((func) => func());
            this.handlerDestroyFuncs = [
                ...this.addManagedListeners(handler, {
                    anyFilterChanged: (event) => {
                        handler.valueModel.allKeys.then((values) => {
                            if (this.isAlive()) {
                                this.updateDisplayedValues('otherFilter', values ?? []);
                                if (event.updated) {
                                    this.checkAndRefreshVirtualList();
                                    this.showOrHideResults();
                                }
                            }
                        });
                    },
                    dataChanged: ({ hardRefresh }) => {
                        handler.valueModel.allKeys.then((values) => {
                            if (this.isAlive()) {
                                this.updateDisplayedValues('reload', values ?? []);
                                this.setSelectedModel(this.state.model?.values ?? null);
                                if (hardRefresh) {
                                    this.hardRefreshVirtualList = true;
                                }
                                this.checkAndRefreshVirtualList();
                            }
                        });
                    },
                }),
                ...this.addManagedListeners(handler.valueModel, {
                    loadingStart: () => this.setIsLoading(true),
                    loadingEnd: () => this.setIsLoading(false),
                }),
            ];
            this.handler = handler;
        }
        return handler;
    }

    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    protected updateUiVisibility(): void {}

    protected createBodyTemplate(): ElementParams | null {
        return {
            tag: 'div',
            cls: 'ag-set-filter',
            children: [
                {
                    tag: 'div',
                    ref: 'eFilterLoading',
                    cls: 'ag-filter-loading ag-loading ag-hidden',
                    children: [
                        { tag: 'span', ref: 'eFilterLoadingIcon', cls: 'ag-loading-icon' },
                        { tag: 'span', cls: 'ag-loading-text', children: translateForSetFilter(this, 'loadingOoo') },
                    ],
                },
                { tag: 'ag-input-text-field', ref: 'eMiniFilter', cls: 'ag-mini-filter' },
                {
                    tag: 'div',
                    ref: 'eFilterNoMatches',
                    cls: 'ag-filter-no-matches ag-hidden',
                    children: translateForSetFilter(this, 'noMatches'),
                },
                { tag: 'div', ref: 'eSetFilterList', cls: 'ag-set-filter-list', role: 'presentation' },
            ],
        };
    }
    protected getAgComponents(): ComponentSelector[] {
        return [AgInputTextFieldSelector];
    }

    protected override handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        if (e.defaultPrevented) {
            return;
        }

        const getComponentForKeyEvent = () => {
            if (!this.eSetFilterList.contains(_getActiveDomElement(this.beans))) {
                return;
            }

            const currentItem = this.virtualList.getLastFocusedRow();
            if (currentItem == null) {
                return;
            }

            const component = this.virtualList.getComponentAt(currentItem) as SetFilterListItem<V>;
            if (component == null) {
                return;
            }

            e.preventDefault();

            const { readOnly } = this.params;
            if (readOnly) {
                return;
            }
            return component;
        };

        switch (e.key) {
            case KeyCode.SPACE:
                getComponentForKeyEvent()?.toggleSelected();
                break;
            case KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
            case KeyCode.LEFT:
                getComponentForKeyEvent()?.setExpanded(false);
                break;
            case KeyCode.RIGHT:
                getComponentForKeyEvent()?.setExpanded(true);
                break;
        }
    }

    private handleKeyEnter(e: KeyboardEvent): void {
        e.preventDefault();

        const { excelMode, readOnly } = this.params;
        if (!excelMode || !!readOnly) {
            return;
        }

        // in Excel Mode, hitting Enter is the same as pressing the Apply button
        this.params.onAction('apply', undefined, e);

        if (this.params.excelMode === 'mac') {
            // in Mac version, select all the input text
            this.eMiniFilter.getInputElement().select();
        }
    }

    private setModelAndRefresh(values: SetFilterModelValue | null): AgPromise<void> {
        return this.setSelectedModel(values).then(() => {
            if (this.isAlive()) {
                // Async values could arrive after the grid has been destroyed
                this.checkAndRefreshVirtualList();
            }
        });
    }

    protected setModelIntoUi(model: SetFilterModel | null): AgPromise<void> {
        this.setMiniFilter(this.params.state.state?.miniFilterValue ?? null);

        const values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    }

    public getModelFromUi(): SetFilterModel | null {
        const values = this.getSelectedModel();

        if (!values) {
            return null;
        }

        return { values, filterType: this.filterType };
    }

    protected areNonNullModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean {
        return _areEqual(a.values, b.values);
    }

    private setIsLoading(isLoading: boolean): void {
        _setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
    }

    private initialiseFilterBodyUi(): void {
        this.initVirtualList();
        this.initMiniFilter();
        this.initLoading();
    }

    private initLoading(): void {
        const loadingIcon = _createIconNoSpan('setFilterLoading', this.beans, this.params.column as AgColumn);
        if (loadingIcon) {
            this.eFilterLoadingIcon.appendChild(loadingIcon);
        }
    }

    private initVirtualList(): void {
        const filterListName = translateForSetFilter(this, 'ariaFilterList');
        const isTree = !!this.params.treeList;

        const virtualList = (this.virtualList = this.createBean(
            new VirtualList({
                cssIdentifier: 'filter',
                ariaRole: isTree ? 'tree' : 'listbox',
                listName: filterListName,
            })
        ));
        const eSetFilterList = this.eSetFilterList;

        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }

        eSetFilterList.appendChild(virtualList.getGui());

        const { cellHeight } = this.params;

        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }

        const componentCreator = (item: SetFilterModelTreeItem | string | null, listItemElement: HTMLElement) =>
            this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);

        const componentUpdater = (
            item: SetFilterModelTreeItem | string | null,
            component: SetFilterListItem<V | string | null>
        ) => this.updateSetListItem(item, component);
        virtualList.setComponentUpdater(componentUpdater);

        this.createVirtualListModel(this.params);
    }

    private createVirtualListModel(
        params: ISetFilterParams<any, V> & FilterDisplayParams<any, any, SetFilterModel>
    ): void {
        let model: VirtualListModel;
        if (params.suppressSelectAll) {
            model = new ModelWrapper(this.displayValueModel);
        } else {
            model = new ModelWrapperWithSelectAll(
                this.displayValueModel,
                this.showAddCurrentSelectionToFilter.bind(this)
            );
        }
        if (params.treeList) {
            model = new TreeModelWrapper(model);
        }

        this.virtualList.setModel(model);
    }

    private getSelectAllLabel(): string {
        const key = this.miniFilterText == null || !this.params.excelMode ? 'selectAll' : 'selectAllSearchResults';

        return translateForSetFilter(this, key);
    }

    private getAddSelectionToFilterLabel(): string {
        return translateForSetFilter(this, 'addCurrentSelectionToFilter');
    }

    private createSetListItem(
        item: SetFilterModelTreeItem | string | null,
        isTree: boolean,
        focusWrapper: HTMLElement
    ): SetFilterListItem<V | string | null> {
        const groupsExist = this.displayValueModel.hasGroups();
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);

        const { value, depth, isGroup, hasIndeterminateExpandState, selectedListener, expandedListener } =
            this.newSetListItemAttributes(item);

        const itemParams: SetFilterListItemParams<V | string | null> = {
            focusWrapper,
            value,
            params: this.params,
            translate: (translateKey: any) => translateForSetFilter(this, translateKey),
            valueFormatter: this.handler.valueFormatter,
            item,
            isSelected,
            isTree,
            depth,
            groupsExist,
            isGroup,
            isExpanded,
            hasIndeterminateExpandState,
        };
        const listItem = this.createBean(new SetFilterListItem<V | string | null>(itemParams));

        listItem.addEventListener('selectionChanged', selectedListener as any);
        if (expandedListener) {
            listItem.addEventListener('expandedChanged', expandedListener as any);
        }

        return listItem;
    }

    private newSetTreeItemAttributes(item: SetFilterModelTreeItem): {
        value: V | string | (() => string) | null;
        depth?: number | undefined;
        isGroup?: boolean | undefined;
        hasIndeterminateExpandState?: boolean | undefined;
        selectedListener: (e: SetFilterListItemSelectionChangedEvent) => void;
        expandedListener?: (e: SetFilterListItemExpandedChangedEvent) => void;
    } {
        const groupsExist = this.displayValueModel.hasGroups();

        // Select all option
        if (item.key === SET_FILTER_SELECT_ALL) {
            return {
                value: () => this.getSelectAllLabel(),
                isGroup: groupsExist,
                depth: item.depth,
                hasIndeterminateExpandState: true,
                selectedListener: (e: SetFilterListItemSelectionChangedEvent) => this.onSelectAll(e.isSelected),
                expandedListener: (e: SetFilterListItemExpandedChangedEvent<SetFilterModelTreeItem>) =>
                    this.onExpandAll(e.item, e.isExpanded),
            };
        }

        // Add selection to filter option
        if (item.key === SET_FILTER_ADD_SELECTION_TO_FILTER) {
            return {
                value: () => this.getAddSelectionToFilterLabel(),
                depth: item.depth,
                isGroup: false,
                hasIndeterminateExpandState: false,
                selectedListener: (e: SetFilterListItemSelectionChangedEvent) => {
                    this.addCurrentSelectionToFilter = e.isSelected;
                },
            };
        }

        // Group
        if (item.children) {
            return {
                value: this.params.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey,
                depth: item.depth,
                isGroup: true,
                selectedListener: (e: SetFilterListItemSelectionChangedEvent<SetFilterModelTreeItem>) =>
                    this.onGroupItemSelected(e.item, e.isSelected),
                expandedListener: (e: SetFilterListItemExpandedChangedEvent<SetFilterModelTreeItem>) =>
                    this.onExpandedChanged(e.item, e.isExpanded),
            };
        }

        // Leaf
        return {
            value: this.params.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey,
            depth: item.depth,
            selectedListener: (e: SetFilterListItemSelectionChangedEvent<SetFilterModelTreeItem>) =>
                this.onItemSelected(e.item.key!, e.isSelected),
        };
    }

    private newSetListItemAttributes(item: SetFilterModelTreeItem | string | null): {
        value: V | string | (() => string) | null;
        depth?: number | undefined;
        isGroup?: boolean | undefined;
        hasIndeterminateExpandState?: boolean | undefined;
        selectedListener: (e: SetFilterListItemSelectionChangedEvent) => void;
        expandedListener?: (e: SetFilterListItemExpandedChangedEvent) => void;
    } {
        // Tree item
        if (this.isSetFilterModelTreeItem(item)) {
            return this.newSetTreeItemAttributes(item);
        }

        // List item - 'Select All'
        if (item === SET_FILTER_SELECT_ALL) {
            return {
                value: () => this.getSelectAllLabel(),
                selectedListener: (e: SetFilterListItemSelectionChangedEvent<string>) => this.onSelectAll(e.isSelected),
            };
        }

        // List item - 'Add selection to filter'
        if (item === SET_FILTER_ADD_SELECTION_TO_FILTER) {
            return {
                value: () => this.getAddSelectionToFilterLabel(),
                selectedListener: (e: SetFilterListItemSelectionChangedEvent<string | null>) => {
                    this.addCurrentSelectionToFilter = e.isSelected;
                },
            };
        }

        // List item
        return {
            value: this.handler.valueModel.allValues.get(item) ?? null,
            selectedListener: (e: SetFilterListItemSelectionChangedEvent<string | null>) =>
                this.onItemSelected(e.item, e.isSelected),
        };
    }

    private updateSetListItem(
        item: SetFilterModelTreeItem | string | null,
        component: SetFilterListItem<V | string | null>
    ): void {
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        component.refresh(item, isSelected, isExpanded);
    }

    private isSelectedExpanded(item: SetFilterModelTreeItem | string | null): {
        isSelected: boolean | undefined;
        isExpanded: boolean | undefined;
    } {
        let isSelected: boolean | undefined;
        let isExpanded: boolean | undefined;
        if (this.isSetFilterModelTreeItem(item)) {
            isExpanded = item.expanded;
            if (item.key === SET_FILTER_SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            } else if (item.key === SET_FILTER_ADD_SELECTION_TO_FILTER) {
                isSelected = this.isAddCurrentSelectionToFilterChecked();
            } else if (item.children) {
                isSelected = this.areAllChildrenSelected(item);
            } else {
                isSelected = this.selectedKeys.has(item.key!);
            }
        } else {
            if (item === SET_FILTER_SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            } else if (item === SET_FILTER_ADD_SELECTION_TO_FILTER) {
                isSelected = this.isAddCurrentSelectionToFilterChecked();
            } else {
                isSelected = this.selectedKeys.has(item);
            }
        }
        return { isSelected, isExpanded };
    }

    private isSetFilterModelTreeItem(item: any): item is SetFilterModelTreeItem {
        return item?.treeKey !== undefined;
    }

    private initMiniFilter() {
        const { eMiniFilter } = this;

        this.updateMiniFilter();
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());
        eMiniFilter.setInputAriaLabel(translateForSetFilter(this, 'ariaSearchFilterValues'));

        this.addManagedElementListeners(eMiniFilter.getInputElement(), {
            keydown: (e) => this.onMiniFilterKeyDown(e!),
        });
    }

    private updateMiniFilter() {
        const { eMiniFilter, miniFilterText, params } = this;

        eMiniFilter.setDisplayed(!params.suppressMiniFilter);
        eMiniFilter.setValue(miniFilterText);
    }

    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    public override afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        // collapse all tree list items (if tree list)
        this.resetExpansion();

        this.refreshVirtualList();

        const { eMiniFilter } = this;

        eMiniFilter.setInputPlaceholder(translateForSetFilter(this, 'searchOoo'));

        if (!params || !params.suppressFocus) {
            if (eMiniFilter.isDisplayed()) {
                eMiniFilter.getFocusableElement().focus();
            } else {
                this.virtualList.awaitStable(() => this.virtualList.focusRow(0));
            }
        }
    }

    public override afterGuiDetached(): void {
        super.afterGuiDetached();

        const { excelMode, model, onStateChange } = this.params;
        // discard any unapplied UI state (reset to model)
        if (excelMode) {
            this.resetMiniFilter();
        }
        if (excelMode || model !== this.state.model) {
            onStateChange({
                model,
                state: this.getState(),
            });
            this.showOrHideResults();
        }
    }

    protected override canApply(model: SetFilterModel | null): boolean {
        return this.params.excelMode ? model == null || model.values.length > 0 : true;
    }

    /**
     * @deprecated v34 Internal method - should only be called by the grid.
     */
    public override onNewRowsLoaded(): void {
        // we don't warn here because the multi filter can call this
    }

    /**
     * @deprecated v34 Use the same method on the filter handler (`api.getColumnFilterHandler()`) instead.
     */
    public setFilterValues(values: (V | null)[]): void {
        _warn(283);
        this.handler.setFilterValues(values);
    }

    /**
     * @deprecated v34 Use the same method on the filter handler (`api.getColumnFilterHandler()`) instead.
     */
    public resetFilterValues(): void {
        _warn(283);
        this.handler.resetFilterValues();
    }

    /**
     * @deprecated v34 Use the same method on the filter handler (`api.getColumnFilterHandler()`) instead.
     */
    public refreshFilterValues(): void {
        _warn(283);
        this.doRefreshFilterValues();
    }

    private doRefreshFilterValues(): void {
        this.handler.refreshFilterValues();
    }

    /**
     * @deprecated v34 Internal method - should only be called by the grid.
     */
    public onAnyFilterChanged(): void {
        // we don't warn here because the multi filter can call this
    }

    private onMiniFilterInput() {
        if (!this.doSetMiniFilter(this.eMiniFilter.getValue())) {
            return;
        }

        const { applyMiniFilterWhileTyping, readOnly, excelMode } = this.params;

        const updateSelections = !readOnly && (applyMiniFilterWhileTyping || !!excelMode);
        const apply = applyMiniFilterWhileTyping && !readOnly ? 'debounce' : undefined;

        this.updateUiAfterMiniFilterChange(updateSelections, apply);
    }

    private updateUiAfterMiniFilterChange(updateSelections: boolean, apply?: 'immediately' | 'debounce'): void {
        if (updateSelections) {
            this.selectAllMatchingMiniFilter(true);
        }
        this.checkAndRefreshVirtualList();
        this.onUiChanged(updateSelections ? apply : 'prevent');

        this.showOrHideResults();
    }

    private showOrHideResults(): void {
        const hideResults = this.miniFilterText != null && this.displayValueModel.getDisplayedValueCount() < 1;

        _setDisplayed(this.eFilterNoMatches, hideResults);
        _setDisplayed(this.eSetFilterList, !hideResults);
    }

    private resetMiniFilter(): void {
        this.eMiniFilter.setValue(null, true);
        this.doSetMiniFilter(null);
    }

    private onMiniFilterKeyDown(e: KeyboardEvent): void {
        const { excelMode, readOnly } = this.params;
        if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
            this.updateUiAfterMiniFilterChange(true, 'immediately');
        }
    }

    private focusRowIfAlive(rowIndex: number | null): Promise<void> {
        if (rowIndex == null) {
            return Promise.resolve();
        }

        return new Promise((res) => {
            window.setTimeout(() => {
                if (this.isAlive()) {
                    this.virtualList.focusRow(rowIndex);
                }
                res();
            }, 0);
        });
    }

    private onSelectAll(isSelected: boolean): void {
        if (isSelected) {
            this.selectAllMatchingMiniFilter();
        } else {
            this.deselectAllMatchingMiniFilter();
        }

        this.refreshAfterSelection();
    }

    private onGroupItemSelected(item: SetFilterModelTreeItem, isSelected: boolean): void {
        const recursiveGroupSelection = (i: SetFilterModelTreeItem) => {
            if (!i.filterPasses) {
                return;
            }
            const children = i.children;
            if (children) {
                for (const childItem of children.values()) {
                    recursiveGroupSelection(childItem);
                }
            } else {
                this.setKeySelected(i.key!, isSelected);
            }
        };

        recursiveGroupSelection(item);

        this.refreshAfterSelection();
    }

    private onItemSelected(key: string | null, isSelected: boolean): void {
        this.setKeySelected(key, isSelected);

        this.refreshAfterSelection();
    }

    private onExpandAll(item: SetFilterModelTreeItem, isExpanded: boolean): void {
        const recursiveExpansion = (i: SetFilterModelTreeItem) => {
            if (i.filterPasses && i.available && i.children) {
                for (const childItem of i.children.values()) {
                    recursiveExpansion(childItem);
                }
                i.expanded = isExpanded;
            }
        };

        recursiveExpansion(item);

        this.refreshAfterExpansion();
    }

    private onExpandedChanged(item: SetFilterModelTreeItem, isExpanded: boolean): void {
        item.expanded = isExpanded;

        this.refreshAfterExpansion();
    }

    private refreshAfterExpansion(): void {
        const focusedRow = this.virtualList.getLastFocusedRow();

        this.updateDisplayedValues('expansion');

        this.checkAndRefreshVirtualList();
        this.focusRowIfAlive(focusedRow);
    }

    private refreshAfterSelection(): void {
        const focusedRow = this.virtualList.getLastFocusedRow();

        this.checkAndRefreshVirtualList();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }

    public setMiniFilter(newMiniFilter: string | null): void {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    }

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    private doSetMiniFilter(value: string | null | undefined): boolean {
        value = _makeNull(value);

        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }

        if (value === null) {
            // Reset 'Add current selection to filter' checkbox when clearing mini filter
            this.addCurrentSelectionToFilter = false;
        }

        this.miniFilterText = value;
        this.updateDisplayedValues('miniFilter');

        return true;
    }

    public getMiniFilter(): string | null {
        return this.miniFilterText;
    }

    protected override getUiChangeEventParams(): any {
        return {
            miniFilterValue: this.miniFilterText,
        };
    }

    protected override getState(): any {
        const miniFilterValue = this.miniFilterText;
        return miniFilterValue ? { miniFilterValue } : undefined;
    }

    private checkAndRefreshVirtualList() {
        this.virtualList.refresh(!this.hardRefreshVirtualList);

        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    }

    /**
     * @deprecated v34 Use the same method on the filter handler (`api.getColumnFilterHandler()`) instead.
     */
    public getFilterKeys(): SetFilterModelValue {
        _warn(283);
        return this.handler.getFilterKeys();
    }

    /**
     * @deprecated v34 Use the same method on the filter handler (`api.getColumnFilterHandler()`) instead.
     */
    public getFilterValues(): (V | null)[] {
        _warn(283);
        return this.handler.getFilterValues();
    }

    private refreshVirtualList(): void {
        if (this.params.refreshValuesOnOpen) {
            this.doRefreshFilterValues();
        } else {
            this.checkAndRefreshVirtualList();
        }
    }

    private isSelectAllSelected(): boolean | undefined {
        if (!this.params.defaultToNothingSelected) {
            // everything selected by default
            if (this.hasSelections() && this.isNothingVisibleSelected()) {
                return false;
            }

            if (this.isEverythingVisibleSelected()) {
                return true;
            }
        } else {
            // nothing selected by default
            if (this.hasSelections() && this.isEverythingVisibleSelected()) {
                return true;
            }

            if (this.isNothingVisibleSelected()) {
                return false;
            }
        }
        // returning `undefined` means the checkbox status is indeterminate.
        return undefined;
    }

    private areAllChildrenSelected(item: SetFilterModelTreeItem): boolean | undefined {
        const recursiveChildSelectionCheck = (i: SetFilterModelTreeItem): boolean | undefined => {
            if (i.children) {
                let someTrue = false;
                let someFalse = false;
                for (const child of i.children.values()) {
                    if (!child.filterPasses || !child.available) {
                        continue;
                    }
                    const childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        // child indeterminate so indeterminate
                        return undefined;
                    }
                    if (childSelected) {
                        someTrue = true;
                    } else {
                        someFalse = true;
                    }
                    if (someTrue && someFalse) {
                        // indeterminate
                        return undefined;
                    }
                }
                return someTrue;
            } else {
                return this.selectedKeys.has(i.key!);
            }
        };

        if (!this.params.defaultToNothingSelected) {
            // everything selected by default
            return recursiveChildSelectionCheck(item);
        } else {
            // nothing selected by default
            return this.hasSelections() && recursiveChildSelectionCheck(item);
        }
    }

    private resetExpansion(): void {
        if (!this.params.treeList) {
            return;
        }

        const selectAllItem = this.displayValueModel.getSelectAllItem();

        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            const recursiveCollapse = (i: SetFilterModelTreeItem) => {
                const children = i.children;
                if (children) {
                    for (const childItem of children.values()) {
                        recursiveCollapse(childItem);
                    }
                    i.expanded = false;
                }
            };
            recursiveCollapse(selectAllItem);
            this.updateDisplayedValues('expansion');
        }
    }

    public getModelAsString(model: SetFilterModel | null): string {
        return this.handler.getModelAsString(model);
    }

    protected override getPositionableElement(): HTMLElement {
        return this.eSetFilterList;
    }

    private updateDisplayedValues(
        source: 'reload' | 'otherFilter' | 'miniFilter' | 'expansion',
        allKeys?: (string | null)[]
    ): void {
        if (source === 'expansion') {
            this.displayValueModel.refresh();
            return;
        }

        const handler = this.handler;
        const valueModel = handler.valueModel;

        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayValueModel.updateDisplayedValuesToAllAvailable(
                (key: string | null) => valueModel.allValues.get(key) ?? null,
                allKeys,
                valueModel.availableKeys,
                source
            );
            return;
        }

        // if filter present, we filter down the list
        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = handler.caseFormat(this.formatter(this.miniFilterText) || '');

        const matchesFilter = (valueToCheck: string | null): boolean =>
            valueToCheck != null && handler.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;

        const nullMatchesFilter = !!this.params.excelMode && matchesFilter(translateForSetFilter(this, 'blanks'));

        this.displayValueModel.updateDisplayedValuesToMatchMiniFilter(
            (key: string | null) => valueModel.allValues.get(key) ?? null,
            allKeys,
            valueModel.availableKeys,
            matchesFilter,
            nullMatchesFilter,
            source
        );
    }

    private hasSelections(): boolean {
        return this.params.defaultToNothingSelected
            ? this.selectedKeys.size > 0
            : this.handler.valueModel.allValues.size !== this.selectedKeys.size;
    }

    private isInWindowsExcelMode(): boolean {
        return this.params.excelMode === 'windows';
    }

    private isAddCurrentSelectionToFilterChecked(): boolean {
        return this.isInWindowsExcelMode() && this.addCurrentSelectionToFilter;
    }

    private showAddCurrentSelectionToFilter(): boolean {
        // We only show the 'Add current selection to filter' option
        // when excel mode is enabled with 'windows' mode
        // and when the users types a value in the mini filter.
        return this.isInWindowsExcelMode() && _exists(this.miniFilterText) && this.miniFilterText.length > 0;
    }

    private selectAllMatchingMiniFilter(clearExistingSelection = false): void {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedKeys = new Set(this.handler.valueModel.allValues.keys());
        } else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) {
                this.selectedKeys.clear();
            }

            this.displayValueModel.forEachDisplayedKey((key) => this.selectedKeys.add(key));
        }
    }

    private deselectAllMatchingMiniFilter(): void {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedKeys.clear();
        } else {
            // ensure everything that matches the mini filter is deselected
            this.displayValueModel.forEachDisplayedKey((key) => this.selectedKeys.delete(key));
        }
    }

    private setKeySelected(key: string | null, selected: boolean): void {
        if (selected) {
            this.selectedKeys.add(key);
        } else {
            if (this.params.excelMode && this.isEverythingVisibleSelected()) {
                // ensure we're starting from the correct "everything selected" state
                this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
            }

            this.selectedKeys.delete(key);
        }
    }

    private isEverythingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey((it) => !this.selectedKeys.has(it));
    }

    private isNothingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey((it) => this.selectedKeys.has(it));
    }

    private getSelectedModel(): SetFilterModelValue | null {
        if (!this.hasSelections()) {
            return null;
        }

        // When excelMode = 'windows' and the user has ticked 'Add current selection to filter'
        // the filtering keys can be different from the selected keys, and they should be included
        // in the model.
        const filteringKeys = this.isAddCurrentSelectionToFilterChecked() ? this.params.model?.values : undefined;

        if (filteringKeys?.length) {
            if (this.selectedKeys) {
                // When existing filtering keys are present along with selected keys,
                // we combine them and return the result.
                // We use a set structure to avoid duplicates
                const modelKeys = new Set<string | null>([...filteringKeys, ...this.selectedKeys]);
                return Array.from(modelKeys);
            }

            return Array.from(filteringKeys);
        }

        // No extra filtering keys are present - so just return the selected keys
        return Array.from(this.selectedKeys);
    }

    private setSelectedModel(model: SetFilterModelValue | null): AgPromise<void> {
        const handler = this.handler;
        const valueModel = handler.valueModel;
        return valueModel.allKeys.then((keys) => {
            if (model == null) {
                this.resetSelectionState(keys ?? []);
            } else {
                // select all values from the model that exist in the filter
                this.selectedKeys.clear();

                const existingFormattedKeys: Map<string | null, string | null> = new Map();
                valueModel.allValues.forEach((_value, key) => {
                    existingFormattedKeys.set(handler.caseFormat(key), key);
                });

                model.forEach((unformattedKey) => {
                    const formattedKey = handler.caseFormat(_makeNull(unformattedKey));
                    const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
                    if (existingUnformattedKey !== undefined) {
                        this.selectedKeys.add(existingUnformattedKey);
                    }
                });
            }
        });
    }

    private resetSelectionState(keys: (string | null)[]): void {
        if (this.params.defaultToNothingSelected) {
            this.selectedKeys.clear();
        } else {
            this.selectedKeys = new Set(keys);
        }
    }

    public override destroy(): void {
        (this.virtualList as any) = this.destroyBean(this.virtualList);

        this.handlerDestroyFuncs?.forEach((func) => func());

        (this.handler as any) = undefined;
        (this.displayValueModel as any) = undefined;
        this.selectedKeys.clear();

        super.destroy();
    }
}

class ModelWrapper<V> implements VirtualListModel {
    constructor(private readonly model: ISetDisplayValueModel<V>) {}

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): string | null {
        return this.model.getDisplayedItem(index) as any;
    }

    public areRowsEqual(oldRow: string | null, newRow: string | null): boolean {
        return oldRow === newRow;
    }
}

class ModelWrapperWithSelectAll<V> implements VirtualListModel {
    constructor(
        private readonly model: ISetDisplayValueModel<V>,
        private readonly showAddCurrentSelectionToFilter: () => boolean
    ) {}

    public getRowCount(): number {
        const showAddCurrentSelectionToFilter = this.showAddCurrentSelectionToFilter();
        const outboundItems = showAddCurrentSelectionToFilter ? 2 : 1;
        return this.model.getDisplayedValueCount() + outboundItems;
    }

    public getRow(index: number): string | null {
        if (index === 0) {
            return this.model.getSelectAllItem() as any;
        }

        const showAddCurrentSelectionToFilter = this.showAddCurrentSelectionToFilter();
        const outboundItems = showAddCurrentSelectionToFilter ? 2 : 1;
        if (index === 1 && showAddCurrentSelectionToFilter) {
            return this.model.getAddSelectionToFilterItem() as any;
        }

        return this.model.getDisplayedItem(index - outboundItems) as any;
    }

    public areRowsEqual(oldRow: string | null, newRow: string | null): boolean {
        return oldRow === newRow;
    }
}

// isRowSelected is used by VirtualList to add aria tags for flat lists. We want to suppress this when using trees
class TreeModelWrapper implements VirtualListModel {
    constructor(private readonly model: VirtualListModel) {}

    public getRowCount(): number {
        return this.model.getRowCount();
    }

    public getRow(index: number): SetFilterModelTreeItem | null {
        return this.model.getRow(index);
    }

    public areRowsEqual(oldRow: SetFilterModelTreeItem | null, newRow: SetFilterModelTreeItem | null): boolean {
        if (oldRow == null && newRow == null) {
            return true;
        }
        return oldRow != null && newRow != null && oldRow.treeKey === newRow.treeKey && oldRow.depth === newRow.depth;
    }
}
