import {
    AgInputTextField,
    Autowired,
    CellValueChangedEvent,
    Events,
    IDoesFilterPassParams,
    SetFilterParams,
    ProvidedFilter,
    RefSelector,
    ValueFormatterService,
    VirtualList,
    VirtualListModel,
    IAfterGuiAttachedParams,
    AgPromise,
    KeyCode,
    KeyCreatorParams,
    PositionableFeature,
    ResizableStructure,
    _,
    ISetFilter,
    SetFilterModel,
    SetFilterModelValue,
    ValueFormatterParams,
    ColumnModel,
    ValueService,
    GetDataPath,
    GROUP_AUTO_COLUMN_ID,
    IRowNode,
} from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem, SetFilterListItemExpandedChangedEvent, SetFilterListItemParams, SetFilterListItemSelectionChangedEvent } from './setFilterListItem';
import { ISetFilterLocaleText, DEFAULT_LOCALE_TEXT } from './localeText';
import { SetFilterDisplayValue, SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { SetFilterModelFormatter } from './setFilterModelFormatter';

/** @param V type of value in the Set Filter */
export class SetFilter<V = string> extends ProvidedFilter<SetFilterModel, V> implements ISetFilter<V> {
    @RefSelector('eMiniFilter') private readonly eMiniFilter: AgInputTextField;
    @RefSelector('eFilterLoading') private readonly eFilterLoading: HTMLElement;
    @RefSelector('eSetFilterList') private readonly eSetFilterList: HTMLElement;
    @RefSelector('eFilterNoMatches') private readonly eNoMatches: HTMLElement;

    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('valueService') private readonly valueService: ValueService;

    private valueModel: SetValueModel<V> | null = null;
    private setFilterParams: SetFilterParams<any, V> | null = null;
    private virtualList: VirtualList | null = null;
    private positionableFeature: PositionableFeature;
    private caseSensitive: boolean = false;
    private convertValuesToStrings: boolean = false;
    private treeDataTreeList = false;
    private getDataPath?: GetDataPath<any>;
    private groupingTreeList = false;
    private hardRefreshVirtualList = false;

    // To make the filtering super fast, we store the keys in an Set rather than using the default array
    private appliedModelKeys: Set<string | null> | null = null;
    private noAppliedModelKeys: boolean = false;

    private createKey: (value: V | null, node?: IRowNode | null) => string | null;

    private valueFormatter?: (params: ValueFormatterParams) => string;
    private readonly filterModelFormatter = new SetFilterModelFormatter();

    constructor() {
        super('setFilter');
    }

    protected postConstruct() {
        super.postConstruct();
        this.positionableFeature = new PositionableFeature(this.eSetFilterList, { forcePopupParentAsOffsetParent: true });
        this.createBean(this.positionableFeature);
    }

    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    protected updateUiVisibility(): void { }

    protected createBodyTemplate(): string {
        return /* html */`
            <div class="ag-set-filter">
                <div ref="eFilterLoading" class="ag-filter-loading ag-hidden">${this.translateForSetFilter('loadingOoo')}</div>
                <ag-input-text-field class="ag-mini-filter" ref="eMiniFilter"></ag-input-text-field>
                <div ref="eFilterNoMatches" class="ag-filter-no-matches ag-hidden">${this.translateForSetFilter('noMatches')}</div>
                <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        if (e.defaultPrevented) { return; }

        switch (e.key) {
            case KeyCode.SPACE:
                this.handleKeySpace(e);
                break;
            case KeyCode.ENTER:
                this.handleKeyEnter(e);
                break;
            case KeyCode.LEFT:
                this.handleKeyLeft(e);
                break;
            case KeyCode.RIGHT:
                this.handleKeyRight(e);
                break;
        }
    }

    private handleKeySpace(e: KeyboardEvent): void {
        this.getComponentForKeyEvent(e)?.toggleSelected();
    }

    private handleKeyEnter(e: KeyboardEvent): void {
        if (!this.setFilterParams) { return; }

        const { excelMode, readOnly } = this.setFilterParams || {};
        if (!excelMode || !!readOnly) { return; }

        e.preventDefault();

        // in Excel Mode, hitting Enter is the same as pressing the Apply button
        this.onBtApply(false, false, e);

        if (this.setFilterParams.excelMode === 'mac') {
            // in Mac version, select all the input text
            this.eMiniFilter.getInputElement().select();
        }
    }

    private handleKeyLeft(e: KeyboardEvent): void {
        this.getComponentForKeyEvent(e)?.setExpanded(false);
    }

    private handleKeyRight(e: KeyboardEvent): void {
        this.getComponentForKeyEvent(e)?.setExpanded(true);
    }

    private getComponentForKeyEvent(e: KeyboardEvent): SetFilterListItem<V> | undefined {
        const eDocument = this.gridOptionsService.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) { return; }

        const currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) { return; }

        const component = this.virtualList.getComponentAt(currentItem) as SetFilterListItem<V>;
        if (component == null) { return ; }

        e.preventDefault();

        const { readOnly } = this.setFilterParams ?? {};
        if (!!readOnly) { return; }
        return component;
    }

    protected getCssIdentifier(): string {
        return 'set-filter';
    }

    public setModel(model: SetFilterModel | null): AgPromise<void> {
        if (model == null && this.valueModel?.getModel() == null) {
            // refreshing is expensive. if new and old model are both null (e.g. nothing set), skip.
            // mini filter isn't contained within the model, so always reset
            this.setMiniFilter(null);
            return AgPromise.resolve();
        }
        return super.setModel(model);
    }

    private setModelAndRefresh(values: SetFilterModelValue | null): AgPromise<void> {
        return this.valueModel ? this.valueModel.setModel(values).then(() => this.refresh()) : AgPromise.resolve();
    }

    protected resetUiToDefaults(): AgPromise<void> {
        this.setMiniFilter(null);

        return this.setModelAndRefresh(null);
    }

    protected setModelIntoUi(model: SetFilterModel | null): AgPromise<void> {
        this.setMiniFilter(null);

        const values = model == null ? null : model.values;
        return this.setModelAndRefresh(values);
    }

    public getModelFromUi(): SetFilterModel | null {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const values = this.valueModel.getModel();

        if (!values) { return null; }

        return { values, filterType: this.getFilterType() };
    }

    public getFilterType(): 'set' {
        return 'set';
    }

    public getValueModel(): SetValueModel<V> | null {
        return this.valueModel;
    }

    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean {
        // both are missing
        if (a == null && b == null) { return true; }

        return a != null && b != null && _.areEqual(a.values, b.values);
    }

    public setParams(params: SetFilterParams<any, V>): void {
        this.applyExcelModeOptions(params);

        super.setParams(params);

        this.setFilterParams = params;
        this.convertValuesToStrings = !!params.convertValuesToStrings;
        this.caseSensitive = !!params.caseSensitive;
        let keyCreator = params.keyCreator ?? params.colDef.keyCreator;
        this.setValueFormatter(params.valueFormatter, keyCreator, this.convertValuesToStrings, !!params.treeList, !!params.colDef.refData);
        const isGroupCol = params.column.getId().startsWith(GROUP_AUTO_COLUMN_ID);
        this.treeDataTreeList = this.gridOptionsService.is('treeData') && !!params.treeList && isGroupCol;
        this.getDataPath = this.gridOptionsService.get('getDataPath');
        this.groupingTreeList = !!this.columnModel.getRowGroupColumns().length && !!params.treeList && isGroupCol;
        this.createKey = this.generateCreateKey(keyCreator, this.convertValuesToStrings, this.treeDataTreeList || this.groupingTreeList);

        this.valueModel = new SetValueModel({
            filterParams: params,
            setIsLoading: loading => this.setIsLoading(loading),
            valueFormatterService: this.valueFormatterService,
            translate: key => this.translateForSetFilter(key),
            caseFormat: v => this.caseFormat(v),
            createKey: this.createKey,
            valueFormatter: this.valueFormatter,
            usingComplexObjects: !!keyCreator,
            gridOptionsService: this.gridOptionsService,
            columnModel: this.columnModel,
            valueService: this.valueService,
            treeDataTreeList: this.treeDataTreeList,
            groupingTreeList: this.groupingTreeList
        });

        this.initialiseFilterBodyUi();

        this.addEventListenersForDataChanges();
    }

    private setValueFormatter(
        providedValueFormatter: ((params: ValueFormatterParams) => string) | undefined,
        keyCreator: ((params: KeyCreatorParams<any, any>) => string) | undefined,
        convertValuesToStrings: boolean,
        treeList: boolean,
        isRefData: boolean
    ) {
        let valueFormatter = providedValueFormatter;
        if (!valueFormatter) {
            if (keyCreator && !convertValuesToStrings && !treeList) {
                throw new Error('AG Grid: Must supply a Value Formatter in Set Filter params when using a Key Creator unless convertValuesToStrings is enabled');
            }
            // ref data is handled by ValueFormatterService
            if (!isRefData) {
                valueFormatter = params => _.toStringOrNull(params.value)!;
            }
        }
        this.valueFormatter = valueFormatter;
    }

    private generateCreateKey(
        keyCreator: ((params: KeyCreatorParams<any, any>) => string) | undefined,
        convertValuesToStrings: boolean,
        treeDataOrGrouping: boolean
    ): (value: V | null, node?: IRowNode | null) => string | null {
        if (treeDataOrGrouping && !keyCreator) {
            throw new Error('AG Grid: Must supply a Key Creator in Set Filter params when `treeList = true` on a group column, and Tree Data or Row Grouping is enabled.');
        }
        if (keyCreator) {
            return (value, node = null) => {
                const params = this.getKeyCreatorParams(value, node);
                return _.makeNull(keyCreator!(params));
            };
        }
        if (convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return value => Array.isArray(value) ? value as any : _.makeNull(_.toStringOrNull(value));
        } else {
            return value => _.makeNull(_.toStringOrNull(value));
        }
    }

    public getFormattedValue(key: string | null): string | null {
        const value: V | null = this.valueModel!.getValue(key);

        const formattedValue = this.valueFormatterService.formatValue(
            this.setFilterParams!.column, null, value, this.valueFormatter, false);

        return (formattedValue == null ? _.toStringOrNull(value) : formattedValue) ?? this.translateForSetFilter('blanks')
    }

    private applyExcelModeOptions(params: SetFilterParams<any, V>): void {
        // apply default options to match Excel behaviour, unless they have already been specified
        if (params.excelMode === 'windows') {
            if (!params.buttons) {
                params.buttons = ['apply', 'cancel'];
            }

            if (params.closeOnApply == null) {
                params.closeOnApply = true;
            }
        } else if (params.excelMode === 'mac') {
            if (!params.buttons) {
                params.buttons = ['reset'];
            }

            if (params.applyMiniFilterWhileTyping == null) {
                params.applyMiniFilterWhileTyping = true;
            }

            if (params.debounceMs == null) {
                params.debounceMs = 500;
            }
        }
    }

    private addEventListenersForDataChanges(): void {
        if (!this.isValuesTakenFromGrid()) { return; }

        this.addManagedListener(
            this.eventService,
            Events.EVENT_CELL_VALUE_CHANGED,
            (event: CellValueChangedEvent) => {
                // only interested in changes to do with this column
                if (this.setFilterParams && event.column === this.setFilterParams.column) {
                    this.syncAfterDataChange();
                }
            });
    }

    private syncAfterDataChange(): AgPromise<void> {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        let promise = this.valueModel.refreshValues();

        return promise.then(() => {
            this.refresh();
            this.onBtApply(false, true);
        });
    }

    private setIsLoading(isLoading: boolean): void {
        _.setDisplayed(this.eFilterLoading, isLoading);
        if (!isLoading) {
            // hard refresh when async data received
            this.hardRefreshVirtualList = true;
        }
    }

    private initialiseFilterBodyUi(): void {
        this.initVirtualList();
        this.initMiniFilter();
    }

    private initVirtualList(): void {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const translate = this.localeService.getLocaleTextFunc();
        const filterListName = translate('ariaFilterList', 'Filter List');
        const isTree = !!this.setFilterParams.treeList;

        const virtualList = this.virtualList = this.createBean(new VirtualList('filter', isTree ? 'tree' : 'listbox', filterListName));
        const eSetFilterList = this.getRefElement('eSetFilterList');

        if (isTree) {
            eSetFilterList.classList.add('ag-set-filter-tree-list');
        }

        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }

        const { cellHeight } = this.setFilterParams;

        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }

        const componentCreator = (item: SetFilterModelTreeItem | string | null, listItemElement: HTMLElement) => this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);

        const componentUpdater = (item: SetFilterModelTreeItem | string | null, component: SetFilterListItem<V | string | null>) => this.updateSetListItem(item, component);
        virtualList.setComponentUpdater(componentUpdater);

        let model: VirtualListModel;

        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        } else {
            model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
        }
        if (isTree) {
            model = new TreeModelWrapper(model);
        }

        virtualList.setModel(model);
    }

    private getSelectAllLabel(): string {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const key = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            'selectAll' : 'selectAllSearchResults';

        return this.translateForSetFilter(key);
    }

    private createSetListItem(item: SetFilterModelTreeItem | string | null, isTree: boolean, focusWrapper: HTMLElement): SetFilterListItem<V | string | null> {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const groupsExist = this.valueModel.hasGroups();
        let value: V | string | (() => string) | null;
        let depth: number | undefined;
        let isGroup: boolean | undefined;
        let hasIndeterminateExpandState: boolean | undefined;
        let selectedListener: (e: SetFilterListItemSelectionChangedEvent) => void;
        let expandedListener: ((e: SetFilterListItemExpandedChangedEvent) => void) | undefined;

        if(this.isSetFilterModelTreeItem(item)) {
            depth = item.depth;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                // select all
                value = () => this.getSelectAllLabel();
                isGroup = groupsExist;
                hasIndeterminateExpandState = true;
                selectedListener = (e: SetFilterListItemSelectionChangedEvent) => this.onSelectAll(e.isSelected);
                expandedListener = (e: SetFilterListItemExpandedChangedEvent<SetFilterModelTreeItem>) => this.onExpandAll(e.item, e.isExpanded);
            } else if (item.children) {
                // group
                value = this.setFilterParams.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey;
                isGroup = true;
                selectedListener = (e: SetFilterListItemSelectionChangedEvent<SetFilterModelTreeItem>) => this.onGroupItemSelected(e.item, e.isSelected);
                expandedListener = (e: SetFilterListItemExpandedChangedEvent<SetFilterModelTreeItem>) => this.onExpandedChanged(e.item, e.isExpanded);
            } else {
                // leaf
                value = this.setFilterParams.treeListFormatter?.(item.treeKey, item.depth, item.parentTreeKeys) ?? item.treeKey;
                selectedListener = (e: SetFilterListItemSelectionChangedEvent<SetFilterModelTreeItem>) => this.onItemSelected(e.item.key!, e.isSelected);
            }
        } else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                value = () => this.getSelectAllLabel();
                selectedListener = (e: SetFilterListItemSelectionChangedEvent<string>) => this.onSelectAll(e.isSelected);
            } else {
                value = this.valueModel.getValue(item);
                selectedListener = (e: SetFilterListItemSelectionChangedEvent<string | null>) => this.onItemSelected(e.item, e.isSelected);
            }
        }
        const {isSelected, isExpanded} = this.isSelectedExpanded(item);

        const itemParams: SetFilterListItemParams<V | string | null> = {
            focusWrapper,
            value,
            params: this.setFilterParams,
            translate: (translateKey: any) => this.translateForSetFilter(translateKey),
            valueFormatter: this.valueFormatter,
            item,
            isSelected,
            isTree,
            depth,
            groupsExist,
            isGroup,
            isExpanded,
            hasIndeterminateExpandState,
        }
        const listItem = this.createBean(new SetFilterListItem<V | string | null>(itemParams));

        listItem.addEventListener(SetFilterListItem.EVENT_SELECTION_CHANGED, selectedListener);
        if (expandedListener) {
            listItem.addEventListener(SetFilterListItem.EVENT_EXPANDED_CHANGED, expandedListener);
        }

        return listItem;
    }

    private updateSetListItem(item: SetFilterModelTreeItem | string | null, component: SetFilterListItem<V | string | null>): void {
        const { isSelected, isExpanded } = this.isSelectedExpanded(item);
        component.refresh(item, isSelected, isExpanded);
    }

    private isSelectedExpanded(item: SetFilterModelTreeItem | string | null): { isSelected: boolean | undefined, isExpanded: boolean | undefined } {
        let isSelected: boolean | undefined;
        let isExpanded: boolean | undefined;
        if(this.isSetFilterModelTreeItem(item)) {
            isExpanded = item.expanded;
            if (item.key === SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            } else if (item.children) {
                isSelected = this.areAllChildrenSelected(item);
            } else {
                isSelected = this.valueModel!.isKeySelected(item.key!);
            }
        } else {
            if (item === SetFilterDisplayValue.SELECT_ALL) {
                isSelected = this.isSelectAllSelected();
            } else {
                isSelected = this.valueModel!.isKeySelected(item);
            }
        }
        return { isSelected, isExpanded };
    }

    private isSetFilterModelTreeItem(item: any): item is SetFilterModelTreeItem {
        return item?.treeKey !== undefined;
    }

    private initMiniFilter() {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const { eMiniFilter, localeService } = this;
        const translate = localeService.getLocaleTextFunc();

        eMiniFilter.setDisplayed(!this.setFilterParams.suppressMiniFilter);
        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());
        eMiniFilter.setInputAriaLabel(translate('ariaSearchFilterValues', 'Search filter values'));

        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', e => this.onMiniFilterKeyPress(e));
    }

    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }

        super.afterGuiAttached(params);

        // collapse all tree list items (if tree list)
        this.resetExpansion();

        this.refreshVirtualList();

        const { eMiniFilter } = this;

        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));

        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }

        const resizable = !!(params && params.container === 'floatingFilter');
        let resizableObject: ResizableStructure;

        if (this.gridOptionsService.is('enableRtl')) {
            resizableObject = { bottom: true, bottomLeft: true, left: true };
        } else {
            resizableObject = { bottom: true, bottomRight: true, right: true };
        }

        if (resizable) {
            this.positionableFeature.restoreLastSize();
            this.positionableFeature.setResizable(resizableObject);
        } else {
            this.positionableFeature.removeSizeFromEl();
            this.positionableFeature.setResizable(false);
        }
    }

    public afterGuiDetached(): void {
        // discard any unapplied UI state (reset to model)
        if (this.setFilterParams?.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }
    }

    public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        if (this.setFilterParams.excelMode && source !== 'rowDataUpdated' && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }

        const result = super.applyModel(source);

        // keep appliedModelKeys in sync with the applied model
        const appliedModel = this.getModel();

        if (appliedModel) {
            this.appliedModelKeys = new Set();
            appliedModel.values.forEach(key => {
                this.appliedModelKeys!.add(this.caseFormat(key));
            });
        } else {
            this.appliedModelKeys = null;
        }

        this.noAppliedModelKeys = appliedModel?.values.length === 0;

        return result;
    }

    protected isModelValid(model: SetFilterModel): boolean {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelKeys) { return true; }

        // if nothing selected, don't need to check value
        if (this.noAppliedModelKeys) {
            return false;
        }

        const { node, data } = params;
        if (this.treeDataTreeList) {
            return this.doesFilterPassForTreeData(node, data);
        }
        if (this.groupingTreeList) {
            return this.doesFilterPassForGrouping(node, data);
        }

        let value = this.getValueFromNode(node, data);

        if (this.convertValuesToStrings) {
            // for backwards compatibility - keeping separate as it will eventually be removed
            return this.doesFilterPassForConvertValuesToString(node, value);
        }

        if (value != null && Array.isArray(value)) {
            if (value.length === 0) {
                return this.appliedModelKeys!.has(null);
            }
            return value.some(v => this.isInAppliedModel(this.createKey(v, node)));
        }

        return this.isInAppliedModel(this.createKey(value, node));
    }

    private doesFilterPassForConvertValuesToString(node: IRowNode, value: V | null) {
        const key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            if (key.length === 0) {
                return this.appliedModelKeys!.has(null);
            }
            return key.some(v => this.isInAppliedModel(v));
        }

        return this.isInAppliedModel(key as any);
    }

    private doesFilterPassForTreeData(node: IRowNode, data: any): boolean {
        if (node.childrenAfterGroup?.length) {
            // only perform checking on leaves. The core filtering logic for tree data won't work properly otherwise
            return false;
        }
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(this.getDataPath!(data)) as any) as any);
    }

    private doesFilterPassForGrouping(node: IRowNode, data: any): boolean {
        const dataPath = this.columnModel.getRowGroupColumns().map(groupCol => this.valueService.getKeyForNode(groupCol, node));
        dataPath.push(this.getValueFromNode(node, data));
        return this.isInAppliedModel(this.createKey(this.checkMakeNullDataPath(dataPath) as any) as any);
        
    }

    private checkMakeNullDataPath(dataPath: string[] | null): string[] | null {
        if (dataPath) {
            dataPath = dataPath.map(treeKey => _.toStringOrNull(_.makeNull(treeKey))) as any;
        }
        if (dataPath?.some(treeKey => treeKey == null)) {
            return null;
        }
        return dataPath;
    }

    private isInAppliedModel(key: string | null): boolean {
        return this.appliedModelKeys!.has(this.caseFormat(key));
    }

    private getValueFromNode(node: IRowNode, data: any): V | null {
        const { valueGetter, api, colDef, column, columnApi, context } = this.setFilterParams!;

        return valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: data,
            getValue: (field) => data[field],
            node: node,
        });
    }

    private getKeyCreatorParams(value: V | null, node: IRowNode | null = null): KeyCreatorParams {
        return {
            value,
            colDef: this.setFilterParams!.colDef,
            column: this.setFilterParams!.column,
            node: node,
            data: node?.data,
            api: this.setFilterParams!.api,
            columnApi: this.setFilterParams!.columnApi,
            context: this.setFilterParams!.context
        }
    }

    public onNewRowsLoaded(): void {
        if (!this.isValuesTakenFromGrid()) { return; }
        this.syncAfterDataChange();
    }

    private isValuesTakenFromGrid(): boolean {
        if (!this.valueModel) { return false; }
        const valuesType = this.valueModel.getValuesType();
        return valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param values The values to use.
     */
    public setFilterValues(values: (V | null)[]): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        this.valueModel.overrideValues(values).then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    public resetFilterValues(): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange();
    }

    public refreshFilterValues(): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        // the model is still being initialised
        if (!this.valueModel.isInitialised()) { return; }

        this.valueModel.refreshValues().then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }

    public onAnyFilterChanged(): void {
        // don't block the current action when updating the values for this filter
        setTimeout(() => {
            if (!this.isAlive()) { return; }

            if (!this.valueModel) { throw new Error('Value model has not been created.'); }

            this.valueModel.refreshAfterAnyFilterChanged().then(refresh => {
                if (refresh) {
                    this.refresh();
                    this.showOrHideResults();
                }
            });
        }, 0);
    }

    private onMiniFilterInput() {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        if (!this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) { return; }

        const { applyMiniFilterWhileTyping, readOnly } = this.setFilterParams || {};
        if (!readOnly && applyMiniFilterWhileTyping) {
            this.filterOnAllVisibleValues(false);
        } else {
            this.updateUiAfterMiniFilterChange();
        }
    }

    private updateUiAfterMiniFilterChange(): void {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const { excelMode, readOnly } = this.setFilterParams || {};
        if (excelMode == null || !!readOnly) {
            this.refresh();
        } else if (this.valueModel.getMiniFilter() == null) {
            this.resetUiToActiveModel();
        } else {
            this.valueModel.selectAllMatchingMiniFilter(true);
            this.refresh();
            this.onUiChanged();
        }

        this.showOrHideResults();
    }

    private showOrHideResults(): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const hideResults = this.valueModel.getMiniFilter() != null && this.valueModel.getDisplayedValueCount() < 1;

        _.setDisplayed(this.eNoMatches, hideResults);
        _.setDisplayed(this.eSetFilterList, !hideResults);
    }

    private resetUiToActiveModel(): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel()).then(() => this.onUiChanged(false, 'prevent'));
    }

    private onMiniFilterKeyPress(e: KeyboardEvent): void {
        const { excelMode, readOnly } = this.setFilterParams || {};
        if (e.key === KeyCode.ENTER && !excelMode && !readOnly) {
            this.filterOnAllVisibleValues();
        }
    }

    private filterOnAllVisibleValues(applyImmediately = true): void {
        const { readOnly } = this.setFilterParams || {};

        if (!this.valueModel) { throw new Error('Value model has not been created.'); }
        if (!!readOnly) { throw new Error('Unable to filter in readOnly mode.'); }

        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
        this.showOrHideResults();
    }

    private focusRowIfAlive(rowIndex: number | null): void {
        if (rowIndex == null) { return; }

        window.setTimeout(() => {
            if (!this.virtualList) { throw new Error('Virtual list has not been created.'); }

            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }

    private onSelectAll(isSelected: boolean): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }
        if (!this.virtualList) { throw new Error('Virtual list has not been created.'); }

        if (isSelected) {
            this.valueModel.selectAllMatchingMiniFilter();
        } else {
            this.valueModel.deselectAllMatchingMiniFilter();
        }

        this.refreshAfterSelection();
    }

    private onGroupItemSelected(item: SetFilterModelTreeItem, isSelected: boolean): void {
        const recursiveGroupSelection = (i: SetFilterModelTreeItem) => {
            if (i.children) {
                i.children.forEach(childItem => recursiveGroupSelection(childItem));
            } else {
                this.selectItem(i.key!, isSelected);
            }
        };

        recursiveGroupSelection(item);

        this.refreshAfterSelection();
    }

    private onItemSelected(key: string | null, isSelected: boolean): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }
        if (!this.virtualList) { throw new Error('Virtual list has not been created.'); }

        this.selectItem(key, isSelected);

        this.refreshAfterSelection();
    }

    private selectItem(key: string | null, isSelected: boolean): void {
        if (isSelected) {
            this.valueModel!.selectKey(key);
        } else {
            this.valueModel!.deselectKey(key);
        }
    }

    private onExpandAll(item: SetFilterModelTreeItem, isExpanded: boolean): void {
        const recursiveExpansion = (i: SetFilterModelTreeItem) => {
            if (i.filterPasses && i.available && i.children) {
                i.children.forEach(childItem => recursiveExpansion(childItem));
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
        const focusedRow = this.virtualList!.getLastFocusedRow();

        this.valueModel!.updateDisplayedValues('expansion');

        this.refresh();
        this.focusRowIfAlive(focusedRow);
    }

    private refreshAfterSelection(): void {
        const focusedRow = this.virtualList!.getLastFocusedRow();

        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }

    public setMiniFilter(newMiniFilter: string | null): void {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    }

    public getMiniFilter(): string | null {
        return this.valueModel ? this.valueModel.getMiniFilter() : null;
    }

    private refresh() {
        if (!this.virtualList) { throw new Error('Virtual list has not been created.'); }

        this.virtualList.refresh(!this.hardRefreshVirtualList);

        if (this.hardRefreshVirtualList) {
            this.hardRefreshVirtualList = false;
        }
    }

    public getFilterKeys(): SetFilterModelValue {
        return this.valueModel ? this.valueModel.getKeys() : [];
    }

    public getFilterValues(): (V | null)[] {
        return this.valueModel ? this.valueModel.getValues() : [];
    }

    public getValues(): SetFilterModelValue {
        return this.getFilterKeys();
    }

    public refreshVirtualList(): void {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        } else {
            this.refresh();
        }
    }

    private translateForSetFilter(key: keyof ISetFilterLocaleText): string {
        const translate = this.localeService.getLocaleTextFunc();

        return translate(key, DEFAULT_LOCALE_TEXT[key]);
    }

    private isSelectAllSelected(): boolean | undefined {
        if (!this.setFilterParams || !this.valueModel) { return false; }

        if (!this.setFilterParams.defaultToNothingSelected) {
            // everything selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isNothingVisibleSelected()) {
                return false;
            }

            if (this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }
        } else {
            // nothing selected by default
            if (this.valueModel.hasSelections() && this.valueModel.isEverythingVisibleSelected()) {
                return true;
            }

            if (this.valueModel.isNothingVisibleSelected()) {
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
                const mixed = i.children.some(child => {
                    if (!child.filterPasses || !child.available) {
                        return false;
                    }
                    const childSelected = recursiveChildSelectionCheck(child);
                    if (childSelected === undefined) {
                        return true;
                    }
                    if (childSelected) {
                        someTrue = true;
                    } else {
                        someFalse = true;
                    }
                    return someTrue && someFalse;
                });
                // returning `undefined` means the checkbox status is indeterminate.
                // if not mixed and some true, all must be true
                return mixed ? undefined : someTrue;
            } else {
                return this.valueModel!.isKeySelected(i.key!);
            }
        };

        if (!this.setFilterParams!.defaultToNothingSelected) {
            // everything selected by default
            return recursiveChildSelectionCheck(item);
        } else {
            // nothing selected by default
            return this.valueModel!.hasSelections() && recursiveChildSelectionCheck(item);
        }
    }

    public destroy(): void {
        if (this.virtualList != null) {
            this.virtualList.destroy();
            this.virtualList = null;
        }

        super.destroy();
    }

    private caseFormat<T extends string | number | null>(valueToFormat: T): typeof valueToFormat {
        if (valueToFormat == null || typeof valueToFormat !== 'string') {
            return valueToFormat;
        }
        return this.caseSensitive ? valueToFormat : valueToFormat.toUpperCase() as T;
    }

    private resetExpansion(): void {
        if (!this.setFilterParams?.treeList) {
            return;
        }

        const selectAllItem = this.valueModel?.getSelectAllItem();

        if (this.isSetFilterModelTreeItem(selectAllItem)) {
            const recursiveCollapse = (i: SetFilterModelTreeItem) => {
                if (i.children) {
                    i.children.forEach(childItem => recursiveCollapse(childItem));
                    i.expanded = false;
                }
            };
            recursiveCollapse(selectAllItem);
            this.valueModel!.updateDisplayedValues('expansion');
        }
    }

    public getModelAsString(model: SetFilterModel): string {
        return this.filterModelFormatter.getModelAsString(model, this);
    }
}

class ModelWrapper<V> implements VirtualListModel {
    constructor(private readonly model: SetValueModel<V>) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): string | null {
        return this.model.getDisplayedItem(index) as any;
    }

    public isRowSelected(index: number): boolean {
        return this.model.isKeySelected(this.getRow(index));
    }

    public areRowsEqual(oldRow: string | null, newRow: string | null): boolean {
        return oldRow === newRow;
    }
}

class ModelWrapperWithSelectAll<V> implements VirtualListModel {
    constructor(
        private readonly model: SetValueModel<V>,
        private readonly isSelectAllSelected: (() => boolean | undefined)) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount() + 1;
    }

    public getRow(index: number): string | null {
        return index === 0 ? this.model.getSelectAllItem() as any : this.model.getDisplayedItem(index - 1);
    }

    public isRowSelected(index: number): boolean | undefined {
        return index === 0 ? this.isSelectAllSelected() : this.model.isKeySelected(this.getRow(index));
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
