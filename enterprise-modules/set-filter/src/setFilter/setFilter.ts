import {
    AgInputTextField,
    Autowired,
    CellValueChangedEvent,
    Component,
    Constants,
    Events,
    IDoesFilterPassParams,
    ISetFilterParams,
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
} from '@ag-grid-community/core';
import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem, SetFilterListItemSelectionChangedEvent } from './setFilterListItem';
import { ISetFilterLocaleText, DEFAULT_LOCALE_TEXT } from './localeText';

export class SetFilter<V> extends ProvidedFilter<SetFilterModel, V> implements ISetFilter {
    public static SELECT_ALL_VALUE = '__AG_SELECT_ALL__';

    @RefSelector('eMiniFilter') private readonly eMiniFilter: AgInputTextField;
    @RefSelector('eFilterLoading') private readonly eFilterLoading: HTMLElement;
    @RefSelector('eSetFilterList') private readonly eSetFilterList: HTMLElement;
    @RefSelector('eFilterNoMatches') private readonly eNoMatches: HTMLElement;

    @Autowired('valueFormatterService') private readonly valueFormatterService: ValueFormatterService;

    private valueModel: SetValueModel | null = null;
    private setFilterParams: ISetFilterParams | null = null;
    private virtualList: VirtualList | null = null;
    private positionableFeature: PositionableFeature;
    private caseSensitive: boolean = false;

    // To make the filtering super fast, we store the values in an object, and check for the boolean value.
    // Although Set would be a more natural choice of data structure, its performance across browsers is
    // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
    private appliedModelValues: { [key: string]: boolean; } | null = null;

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
        }
    }

    private handleKeySpace(e: KeyboardEvent): void {
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (!this.eSetFilterList.contains(eDocument.activeElement) || !this.virtualList) { return; }

        const currentItem = this.virtualList.getLastFocusedRow();
        if (currentItem == null) { return; }

        const component = this.virtualList.getComponentAt(currentItem) as SetFilterListItem;
        if (component == null) { return ; }

        e.preventDefault();

        const { readOnly } = this.setFilterParams || {};
        if (!!readOnly) { return; }
        component.toggleSelected();
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

    protected getCssIdentifier(): string {
        return 'set-filter';
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

    public getValueModel(): SetValueModel | null {
        return this.valueModel;
    }

    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean {
        // both are missing
        if (a == null && b == null) { return true; }

        return a != null && b != null && _.areEqual(a.values, b.values);
    }

    public setParams(params: ISetFilterParams): void {
        this.applyExcelModeOptions(params);

        super.setParams(params);

        this.setFilterParams = params;
        this.caseSensitive = params.caseSensitive || false;

        this.valueModel = new SetValueModel(
            params,
            loading => this.showOrHideLoadingScreen(loading),
            this.valueFormatterService,
            key => this.translateForSetFilter(key),
            v => this.caseFormat(v)
        );

        this.initialiseFilterBodyUi();

        this.addEventListenersForDataChanges();
    }

    private applyExcelModeOptions(params: ISetFilterParams): void {
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

    private showOrHideLoadingScreen(isLoading: boolean): void {
        _.setDisplayed(this.eFilterLoading, isLoading);
    }

    private initialiseFilterBodyUi(): void {
        this.initVirtualList();
        this.initMiniFilter();
    }

    private initVirtualList(): void {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const filterListName = translate('ariaFilterList', 'Filter List');

        const virtualList = this.virtualList = this.createBean(new VirtualList('filter', 'listbox', filterListName));
        const eSetFilterList = this.getRefElement('eSetFilterList');

        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }

        const { cellHeight } = this.setFilterParams;

        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }

        virtualList.setComponentCreator(value => this.createSetListItem(value));

        let model: VirtualListModel;

        if (this.setFilterParams.suppressSelectAll) {
            model = new ModelWrapper(this.valueModel);
        } else {
            model = new ModelWrapperWithSelectAll(this.valueModel, () => this.isSelectAllSelected());
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

    private createSetListItem(value: any): Component {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        let listItem: SetFilterListItem;

        if (value === SetFilter.SELECT_ALL_VALUE) {
            listItem = this.createBean(new SetFilterListItem(
                () => this.getSelectAllLabel(),
                this.setFilterParams,
                key => this.translateForSetFilter(key),
                this.isSelectAllSelected()));

            listItem.addEventListener(
                SetFilterListItem.EVENT_SELECTION_CHANGED,
                (e: SetFilterListItemSelectionChangedEvent) => this.onSelectAll(e.isSelected)
            );

            return listItem;
        }

        listItem = this.createBean(new SetFilterListItem(
            value, this.setFilterParams, key => this.translateForSetFilter(key), this.valueModel.isValueSelected(value)));

        listItem.addEventListener(
            SetFilterListItem.EVENT_SELECTION_CHANGED,
            (e: SetFilterListItemSelectionChangedEvent) => this.onItemSelected(value, e.isSelected)
        );

        return listItem;
    }

    private initMiniFilter() {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        const { eMiniFilter, gridOptionsWrapper } = this;
        const translate = gridOptionsWrapper.getLocaleTextFunc();

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

        if (this.setFilterParams.excelMode) {
            this.resetUiToActiveModel();
            this.showOrHideResults();
        }

        this.refreshVirtualList();

        const { eMiniFilter } = this;

        eMiniFilter.setInputPlaceholder(this.translateForSetFilter('searchOoo'));

        if (!params || !params.suppressFocus) {
            eMiniFilter.getFocusableElement().focus();
        }

        const resizable = !!(params && params.container === 'floatingFilter');
        let resizableObject: ResizableStructure;

        if (this.gridOptionsWrapper.isEnableRtl()) {
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

    public applyModel(): boolean {
        if (!this.setFilterParams) { throw new Error('Set filter params have not been provided.'); }
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        if (this.setFilterParams.excelMode && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }

        const result = super.applyModel();

        // keep appliedModelValues in sync with the applied model
        const appliedModel = this.getModel();

        if (appliedModel) {
            this.appliedModelValues = appliedModel.values.reduce(
                (values, value) => {
                    values[this.caseFormat(String(value))] = true;
                    return values;
                },
                {} as { [key: string]: boolean; });
        } else {
            this.appliedModelValues = null;
        }

        return result;
    }

    protected isModelValid(model: SetFilterModel): boolean {
        return this.setFilterParams && this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (!this.setFilterParams || !this.valueModel || !this.appliedModelValues) { return true; }

        const { node, data } = params;
        const { valueGetter, colDef: { keyCreator }, api, colDef, column, columnApi, context } = this.setFilterParams;

        let value = valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: data,
            getValue: (field) => data[field],
            node: node,
        });

        if (keyCreator) {
            const keyParams: KeyCreatorParams = {
                value,
                colDef,
                column,
                node,
                data,
                api,
                columnApi,
                context,
            };
            value = keyCreator(keyParams);
        }

        value = _.makeNull(value);

        if (Array.isArray(value)) {
            return value.some(v => this.appliedModelValues![this.caseFormat(String(_.makeNull(v)))] === true);
        }

        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[this.caseFormat(String(value))] === true;
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
     * @param options The options to use.
     */
    public setFilterValues(options: string[]): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }

        this.valueModel.overrideValues(options).then(() => {
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

            this.valueModel.refreshAfterAnyFilterChanged().then(() => this.refresh());
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

        const focusedRow = this.virtualList.getLastFocusedRow();

        this.refresh();
        this.onUiChanged();
        this.focusRowIfAlive(focusedRow);
    }

    private onItemSelected(value: any, isSelected: boolean): void {
        if (!this.valueModel) { throw new Error('Value model has not been created.'); }
        if (!this.virtualList) { throw new Error('Virtual list has not been created.'); }

        if (isSelected) {
            this.valueModel.selectValue(value);
        } else {
            this.valueModel.deselectValue(value);
        }

        const focusedRow = this.virtualList.getLastFocusedRow();

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

        this.virtualList.refresh();
    }

    public getValues(): (string | null)[] {
        return this.valueModel ? this.valueModel.getValues() : [];
    }

    public refreshVirtualList(): void {
        if (this.setFilterParams && this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        } else {
            this.refresh();
        }
    }

    private translateForSetFilter(key: keyof ISetFilterLocaleText): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

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
}

class ModelWrapper implements VirtualListModel {
    constructor(private readonly model: SetValueModel) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): string | null {
        return this.model.getDisplayedValue(index);
    }

    public isRowSelected(index: number): boolean {
        return this.model.isValueSelected(this.getRow(index));
    }
}

class ModelWrapperWithSelectAll implements VirtualListModel {
    constructor(
        private readonly model: SetValueModel,
        private readonly isSelectAllSelected: (() => boolean | undefined)) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount() + 1;
    }

    public getRow(index: number): string | null {
        return index === 0 ? SetFilter.SELECT_ALL_VALUE : this.model.getDisplayedValue(index - 1);
    }

    public isRowSelected(index: number): boolean | undefined {
        return index === 0 ? this.isSelectAllSelected() : this.model.isValueSelected(this.getRow(index));
    }
}