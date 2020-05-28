import {
    AgCheckbox,
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
    Promise,
    FocusController,
    _
} from '@ag-grid-community/core';

import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { SetFilterModel } from './setFilterModel';

export class SetFilter extends ProvidedFilter {
    private valueModel: SetValueModel;

    @RefSelector('eSelectAll') private eSelectAll: AgCheckbox;
    @RefSelector('eSelectAllLabel') private eSelectAllLabel: HTMLElement;
    @RefSelector('eMiniFilter') private eMiniFilter: AgInputTextField;
    @RefSelector('eFilterLoading') private eFilterLoading: HTMLInputElement;
    @RefSelector('eSetFilterList') private eSetFilterList: HTMLElement;

    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('focusController') private focusController: FocusController;

    private selectAllState?: boolean;
    private setFilterParams: ISetFilterParams;
    private virtualList: VirtualList;

    // To make the filtering super fast, we store the values in an object, and check for the boolean value.
    // Although Set would be a more natural choice of data structure, its performance across browsers is
    // significantly worse than using an object: https://jsbench.me/hdk91jbw1h/
    private appliedModelValues: { [key: string]: boolean; } | null = null;

    // unlike the simple filters, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    protected updateUiVisibility(): void { }

    protected postConstruct(): void {
        super.postConstruct();

        const focusableEl = this.getFocusableElement();

        if (focusableEl) {
            this.addManagedListener(focusableEl, 'keydown', this.handleKeyDown.bind(this));
        }
    }

    protected createBodyTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return /* html */`
            <div ref="eFilterLoading" class="ag-filter-loading ag-hidden">${translate('loadingOoo', 'Loading...')}</div>
            <div>
                <div class="ag-filter-header-container" role="presentation">
                    <ag-input-text-field class="ag-mini-filter" ref="eMiniFilter"></ag-input-text-field>
                    <label ref="eSelectAllContainer" class="ag-set-filter-item ag-set-filter-select-all">
                        <ag-checkbox ref="eSelectAll" class="ag-set-filter-item-checkbox"></ag-checkbox>
                        <span ref="eSelectAllLabel" class="ag-set-filter-item-value"></span>
                    </label>
                </div>
                <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) { return; }

        switch (e.which || e.keyCode) {
            case Constants.KEY_TAB:
                this.handleKeyTab(e);
                break;
            case Constants.KEY_SPACE:
                this.handleKeySpace(e);
                break;
            case Constants.KEY_ENTER:
                this.handleKeyEnter(e);
                break;
        }
    }

    private handleKeyTab(e: KeyboardEvent): void {
        if (!this.eSetFilterList.contains(document.activeElement)) { return; }

        const focusableElement = this.getFocusableElement();
        const method = e.shiftKey ? 'previousElementSibling' : 'nextElementSibling';

        let currentRoot = this.eSetFilterList;
        let nextRoot: HTMLElement;

        while (currentRoot !== focusableElement && !nextRoot) {
            nextRoot = currentRoot[method] as HTMLElement;
            currentRoot = currentRoot.parentElement;
        }

        if (!nextRoot) { return; }

        if (
            (e.shiftKey && this.focusController.focusLastFocusableElement(nextRoot)) ||
            (!e.shiftKey && this.focusController.focusFirstFocusableElement(nextRoot))
        ) {
            e.preventDefault();
        }
    }

    private handleKeySpace(e: KeyboardEvent): void {
        if (!this.eSetFilterList.contains(document.activeElement)) { return; }

        const currentItem = this.virtualList.getLastFocusedRow();

        if (_.exists(currentItem)) {
            const component = this.virtualList.getComponentAt(currentItem) as SetFilterListItem;

            if (component) {
                e.preventDefault();
                component.setSelected(!component.isSelected(), true);
            }
        }
    }

    private handleKeyEnter(e: KeyboardEvent): void {
        if (this.setFilterParams.excelMode) {
            e.preventDefault();

            // in Excel Mode, hitting Enter is the same as pressing the Apply button
            this.onBtApply(false, false, e);

            if (this.setFilterParams.excelMode === 'mac') {
                // in Mac version, select all the input text
                this.eMiniFilter.getInputElement().select();
            }
        }
    }

    protected getCssIdentifier(): string {
        return 'set-filter';
    }

    protected resetUiToDefaults(): Promise<void> {
        this.setMiniFilter(null);

        return this.valueModel.setModel(null).then(() => this.refresh());
    }

    protected setModelIntoUi(model: SetFilterModel): Promise<void> {
        this.setMiniFilter(null);

        if (model instanceof Array) {
            const message = 'ag-Grid: The Set Filter Model is no longer an array and models as arrays are ' +
                'deprecated. Please check the docs on what the set filter model looks like. Future versions of ' +
                'ag-Grid will have the array version of the model removed.';
            _.doOnce(() => console.warn(message), 'setFilter.modelAsArray');
        }

        // also supporting old filter model for backwards compatibility
        const values = model == null ? null : (model instanceof Array ? model as string[] : model.values);

        return this.valueModel.setModel(values).then(() => this.refresh());
    }

    public getModelFromUi(): SetFilterModel | null {
        const values = this.valueModel.getModel();

        if (!values) { return null; }

        if (this.gridOptionsWrapper.isEnableOldSetFilterModel()) {
            // this is a hack, it breaks casting rules, to apply with old model
            return (values as any) as SetFilterModel;
        }

        return { values, filterType: 'set' };
    }

    public getValueModel(): SetValueModel {
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

        this.checkSetFilterDeprecatedParams(params);
        this.setFilterParams = params;

        this.valueModel = new SetValueModel(
            params.colDef,
            params.rowModel,
            params.valueGetter,
            params.doesRowPassOtherFilter,
            params.suppressSorting,
            loading => this.setLoading(loading),
            this.valueFormatterService,
            params.column
        );

        this.initialiseFilterBodyUi();

        const syncValuesAfterDataChange =
            this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            !params.values &&
            !params.suppressSyncValuesAfterDataChange;

        if (syncValuesAfterDataChange) {
            this.addEventListenersForDataChanges();
        }
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

    private checkSetFilterDeprecatedParams(params: ISetFilterParams): void {
        if (params.syncValuesLikeExcel) {
            const message = 'ag-Grid: since version 22.x, the Set Filter param syncValuesLikeExcel is no longer' +
                ' used as this is the default behaviour. To turn this default behaviour off, use the' +
                ' param suppressSyncValuesAfterDataChange';
            _.doOnce(() => console.warn(message), 'syncValuesLikeExcel deprecated');
        }

        if (params.selectAllOnMiniFilter) {
            const message = 'ag-Grid: since version 22.x, the Set Filter param selectAllOnMiniFilter is no longer' +
                ' used as this is the default behaviour.';
            _.doOnce(() => console.warn(message), 'selectAllOnMiniFilter deprecated');
        }

        if (params.suppressSyncValuesAfterDataChange) {
            const message = 'ag-Grid: since version 23.1, the Set Filter param suppressSyncValuesAfterDataChange has' +
                ' been deprecated and will be removed in a future major release.';
            _.doOnce(() => console.warn(message), 'suppressSyncValuesAfterDataChange deprecated');
        }

        if (params.suppressRemoveEntries) {
            const message = 'ag-Grid: since version 23.1, the Set Filter param suppressRemoveEntries has' +
                ' been deprecated and will be removed in a future major release.';
            _.doOnce(() => console.warn(message), 'suppressRemoveEntries deprecated');
        }
    }

    private addEventListenersForDataChanges(): void {
        this.addManagedListener(
            this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => this.syncAfterDataChange());

        this.addManagedListener(
            this.eventService,
            Events.EVENT_CELL_VALUE_CHANGED,
            (event: CellValueChangedEvent) => {
                // only interested in changes to do with this column
                if (event.column === this.setFilterParams.column) {
                    this.syncAfterDataChange();
                }
            });
    }

    private syncAfterDataChange(refreshValues = true, keepSelection = true): void {
        let promise = Promise.resolve<void>(null);

        if (refreshValues) {
            promise = this.valueModel.refreshValues(keepSelection);
        } else if (!keepSelection) {
            promise = this.valueModel.setModel(null);
        }

        promise.then(() => {
            this.refresh();
            this.onBtApply(false, true);
        });
    }

    public setLoading(loading: boolean): void {
        _.setDisplayed(this.eFilterLoading, loading);
    }

    private initialiseFilterBodyUi(): void {
        this.initVirtualList();
        this.initMiniFilter();
        this.initSelectAll();
    }

    private initVirtualList() {
        const virtualList = this.virtualList = this.createBean(new VirtualList('filter'));
        const eSetFilterList = this.getRefElement('eSetFilterList');

        if (eSetFilterList) {
            eSetFilterList.appendChild(virtualList.getGui());
        }

        const { cellHeight } = this.setFilterParams;

        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }

        virtualList.setComponentCreator(value => this.createSetListItem(value));
        virtualList.setModel(new ModelWrapper(this.valueModel));
    }

    private createSetListItem(value: any): Component {
        const listItem = this.createBean(new SetFilterListItem(value, this.setFilterParams));
        const selected = this.valueModel.isValueSelected(value);

        listItem.setSelected(selected);
        listItem.addEventListener(
            SetFilterListItem.EVENT_SELECTED, () => this.onItemSelected(value, listItem.isSelected())
        );

        return listItem;
    }

    private initMiniFilter() {
        const { eMiniFilter } = this;

        _.setDisplayed(eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);

        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());

        this.addManagedListener(eMiniFilter.getInputElement(), 'keypress', e => this.onMiniFilterKeyPress(e));
    }

    private initSelectAll() {
        const eSelectAllContainer = this.getRefElement('eSelectAllContainer');

        if (this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(eSelectAllContainer, false);
        } else {
            this.eSelectAll.onValueChange(() => { this.onSelectAll(); });
        }
    }

    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.refreshVirtualList();

        if (this.setFilterParams.excelMode) {
            this.resetUiToActiveModel();
        }

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const { eMiniFilter } = this;

        eMiniFilter.setInputPlaceholder(translate('searchOoo', 'Search...'));
        eMiniFilter.getFocusableElement().focus();
    }

    public applyModel(): boolean {
        if (this.setFilterParams.excelMode && this.valueModel.isEverythingVisibleSelected()) {
            // In Excel, if the filter is applied with all visible values selected, then any active filter on the
            // column is removed. This ensures the filter is removed in this situation.
            this.valueModel.selectAllMatchingMiniFilter();
        }

        const result = super.applyModel();

        if (result) {
            // keep appliedModelValues in sync with the applied model
            const appliedModel = this.getModel() as SetFilterModel;

            if (appliedModel) {
                this.appliedModelValues = {};

                _.forEach(appliedModel.values, value => this.appliedModelValues[value] = true);
            } else {
                this.appliedModelValues = null;
            }
        }

        return result;
    }

    protected isModelValid(model: SetFilterModel): boolean {
        return this.setFilterParams.excelMode ? model == null || model.values.length > 0 : true;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        if (this.appliedModelValues == null) { return true; }

        const { valueGetter, colDef: { keyCreator } } = this.setFilterParams;

        let value = valueGetter(params.node);

        if (keyCreator) {
            value = keyCreator({ value });
        }

        value = _.makeNull(value);

        if (Array.isArray(value)) {
            return _.some(value, v => this.appliedModelValues[_.makeNull(v)] === true);
        }

        // Comparing against a value performs better than just checking for undefined
        // https://jsbench.me/hdk91jbw1h/
        return this.appliedModelValues[value] === true;
    }

    public onNewRowsLoaded(): void {
        const valuesType = this.valueModel.getValuesType();
        const keepSelection = this.isNewRowsActionKeep();

        this.syncAfterDataChange(valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, keepSelection);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     */
    public setFilterValues(options: string[]): void {
        this.valueModel.overrideValues(options, this.isNewRowsActionKeep()).then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    public resetFilterValues(): void {
        this.valueModel.setValuesType(SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES);
        this.syncAfterDataChange(true, this.isNewRowsActionKeep());
    }

    public refreshFilterValues(): void {
        this.valueModel.refreshValues().then(() => {
            this.refresh();
            this.onUiChanged();
        });
    }

    public onAnyFilterChanged(): void {
        this.valueModel.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    private updateSelectAllCheckbox(): void {
        if (this.valueModel.isEverythingVisibleSelected()) {
            this.selectAllState = true;
        } else if (this.valueModel.isNothingVisibleSelected()) {
            this.selectAllState = false;
        } else {
            this.selectAllState = undefined;
        }

        this.eSelectAll.setValue(this.selectAllState, true);
    }

    private onMiniFilterInput() {
        if (this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            if (this.setFilterParams.applyMiniFilterWhileTyping) {
                this.filterOnAllVisibleValues(false);
            } else {
                this.updateUiAfterMiniFilterChange();
            }
        }
    }

    private updateUiAfterMiniFilterChange(): void {
        if (this.setFilterParams.excelMode) {
            if (this.valueModel.getMiniFilter() == null) {
                this.resetUiToActiveModel();
            } else {
                this.valueModel.selectAllMatchingMiniFilter(true);
                this.refresh();
                this.onUiChanged();
            }
        } else {
            this.refresh();
        }
    }

    private resetUiToActiveModel(): void {
        this.eMiniFilter.setValue(null, true);
        this.valueModel.setMiniFilter(null);
        this.setModelIntoUi(this.getModel() as SetFilterModel).then(() => {
            this.refresh();
            this.onUiChanged(false, 'prevent');
        });
    }

    private updateSelectAllLabel() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const label = this.valueModel.getMiniFilter() == null || !this.setFilterParams.excelMode ?
            translate('selectAll', 'Select All') :
            translate('selectAllSearchResults', 'Select All Search Results');

        this.eSelectAllLabel.innerText = `(${label})`;
    }

    private onMiniFilterKeyPress(e: KeyboardEvent): void {
        if (_.isKeyPressed(e, Constants.KEY_ENTER) && !this.setFilterParams.excelMode) {
            this.filterOnAllVisibleValues();
        }
    }

    private filterOnAllVisibleValues(applyImmediately = true): void {
        this.valueModel.selectAllMatchingMiniFilter(true);
        this.refresh();
        this.onUiChanged(false, applyImmediately ? 'immediately' : 'debounce');
    }

    private onSelectAll() {
        this.selectAllState = !this.selectAllState;

        if (this.selectAllState) {
            this.valueModel.selectAllMatchingMiniFilter();
        } else {
            this.valueModel.deselectAllMatchingMiniFilter();
        }

        this.refresh();
        this.onUiChanged();
    }

    private onItemSelected(value: any, selected: boolean) {
        if (selected) {
            this.valueModel.selectValue(value);
        } else {
            this.valueModel.deselectValue(value);
        }

        const focusedRow = this.virtualList.getLastFocusedRow();

        this.updateSelectAllCheckbox();
        this.onUiChanged();

        if (_.exists(focusedRow)) {
            window.setTimeout(() => {
                if (this.isAlive()) {
                    this.virtualList.focusRow(focusedRow);
                }
            }, 10);
        }
    }

    public setMiniFilter(newMiniFilter: string): void {
        this.eMiniFilter.setValue(newMiniFilter);
        this.onMiniFilterInput();
    }

    public getMiniFilter() {
        return this.valueModel.getMiniFilter();
    }

    public selectEverything() {
        this.valueModel.selectAllMatchingMiniFilter();
        this.refresh();
    }

    public selectNothing() {
        this.valueModel.deselectAllMatchingMiniFilter();
        this.refresh();
    }

    public unselectValue(value: string) {
        this.valueModel.deselectValue(value);
        this.refresh();
    }

    public selectValue(value: string) {
        this.valueModel.selectValue(value);
        this.refresh();
    }

    private refresh() {
        this.virtualList.refresh();
        this.updateSelectAllCheckbox();
        this.updateSelectAllLabel();
    }

    public isValueSelected(value: string) {
        return this.valueModel.isValueSelected(value);
    }

    public isEverythingSelected() {
        return this.valueModel.isEverythingVisibleSelected();
    }

    public isNothingSelected() {
        return this.valueModel.isNothingVisibleSelected();
    }

    public getUniqueValueCount() {
        return this.valueModel.getUniqueValueCount();
    }

    public getUniqueValue(index: any) {
        return this.valueModel.getUniqueValue(index);
    }

    public refreshVirtualList(): void {
        if (this.setFilterParams.refreshValuesOnOpen) {
            this.refreshFilterValues();
        }
        else {
            this.virtualList.refresh();
        }
    }
}

class ModelWrapper implements VirtualListModel {
    constructor(private readonly model: SetValueModel) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): string {
        return this.model.getDisplayedValue(index);
    }
}
