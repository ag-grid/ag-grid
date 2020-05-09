import {
    AgCheckbox,
    AgInputTextField,
    Autowired,
    CellValueChangedEvent,
    Component,
    Constants,
    Events,
    EventService,
    IDoesFilterPassParams,
    ISetFilterParams,
    ProvidedFilter,
    RefSelector,
    ValueFormatterService,
    VirtualList,
    VirtualListModel,
    _,
    IAfterGuiAttachedParams
} from '@ag-grid-community/core';

import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { SetFilterModel } from './setFilterModel';

export class SetFilter extends ProvidedFilter {
    private valueModel: SetValueModel;

    @RefSelector('eSelectAll') private eSelectAll: AgCheckbox;
    @RefSelector('eMiniFilter') private eMiniFilter: AgInputTextField;
    @RefSelector('eFilterLoading') private eFilterLoading: HTMLInputElement;

    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('eventService') private eventService: EventService;

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

    protected createBodyTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return /* html */`
            <div ref="eFilterLoading" class="ag-filter-loading ag-hidden">${translate('loadingOoo', 'Loading...')}</div>
            <div>
                <div class="ag-filter-header-container" role="presentation">
                    <ag-input-text-field class="ag-mini-filter" ref="eMiniFilter"></ag-input-text-field>
                    <label ref="eSelectAllContainer" class="ag-set-filter-item ag-set-filter-select-all">
                        <ag-checkbox ref="eSelectAll" class="ag-set-filter-item-checkbox"></ag-checkbox><span class="ag-set-filter-item-value">(${translate('selectAll', 'Select All')})</span>
                    </label>
                </div>
                <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`;
    }

    protected getCssIdentifier(): string {
        return 'set-filter';
    }

    protected resetUiToDefaults(): void {
        this.setMiniFilter(null);
        this.selectEverything();
    }

    protected setModelIntoUi(model: SetFilterModel): void {
        this.resetUiToDefaults();

        if (!model) { return; }

        if (model instanceof Array) {
            const message = 'ag-Grid: The Set Filter Model is no longer an array and models as arrays are ' +
                'deprecated. Please check the docs on what the set filter model looks like. Future versions of ' +
                'ag-Grid will have the array version of the model removed.';
            _.doOnce(() => console.warn(message), 'setFilter.modelAsArray');
        }

        // also supporting old filter model for backwards compatibility
        const newValues = model instanceof Array ? model as string[] : model.values;

        this.valueModel.setModel(newValues);
        this.refresh();
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
        this.valueModel.onFilterValuesReady(() => this.refresh());

        const syncValuesAfterDataChange =
            this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            !params.values &&
            !params.suppressSyncValuesAfterDataChange;

        if (syncValuesAfterDataChange) {
            this.addEventListenersForDataChanges();
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
        this.addDestroyableEventListener(
            this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => this.syncAfterDataChange());

        this.addDestroyableEventListener(
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
        if (refreshValues) {
            this.valueModel.refreshValues(keepSelection);
        } else if (!keepSelection) {
            this.valueModel.setModel(null);
        }

        this.valueModel.onFilterValuesReady(() => {
            this.refresh();
            this.onBtApply(false, true);
        });
    }

    private updateCheckboxIcon(): void {
        this.eSelectAll.setValue(this.selectAllState);
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
        const virtualList = this.virtualList = this.wireBean(new VirtualList('filter'));
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
        const listItem = this.wireBean(new SetFilterListItem(value, this.setFilterParams));
        const selected = this.valueModel.isValueSelected(value);

        listItem.setSelected(selected);
        listItem.addEventListener(
            SetFilterListItem.EVENT_SELECTED, () => this.onItemSelected(value, listItem.isSelected()));

        return listItem;
    }

    private initMiniFilter() {
        const { eMiniFilter } = this;

        _.setDisplayed(eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);

        eMiniFilter.setValue(this.valueModel.getMiniFilter());
        eMiniFilter.onValueChange(() => this.onMiniFilterInput());

        this.addDestroyableEventListener(eMiniFilter.getInputElement(), 'keypress', e => this.onMiniFilterKeyPress(e));
    }

    private initSelectAll() {
        this.updateCheckboxIcon();

        const eSelectAllContainer = this.getRefElement('eSelectAllContainer');

        if (this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(eSelectAllContainer, false);
        } else {
            this.addDestroyableEventListener(eSelectAllContainer, 'click', e => this.onSelectAll(e));
        }

        this.addDestroyableEventListener(this.eSelectAll.getInputElement(), 'keydown', (e: KeyboardEvent) => {
            if (e.keyCode === Constants.KEY_SPACE) {
                e.preventDefault();
                this.onSelectAll(e);
            }
        });
    }

    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.refreshVirtualList();

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const { eMiniFilter } = this;

        eMiniFilter.setInputPlaceholder(translate('searchOoo', 'Search...'));
        eMiniFilter.getFocusableElement().focus();
    }

    public applyModel(): boolean {
        const result = super.applyModel();

        // keep the appliedModelValuesMapped in sync with the applied model
        const appliedModel = this.getModel() as SetFilterModel;

        if (appliedModel) {
            this.appliedModelValues = {};

            _.forEach(appliedModel.values, value => this.appliedModelValues[value] = true);
        } else {
            this.appliedModelValues = null;
        }

        return result;
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
        this.valueModel.overrideValues(options, this.isNewRowsActionKeep());
        this.valueModel.onFilterValuesReady(() => {
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
        this.valueModel.refreshValues();
        this.valueModel.onFilterValuesReady(() => {
            this.refresh();
            this.onUiChanged();
        });
    }

    public onAnyFilterChanged(): void {
        this.valueModel.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    private updateSelectAll(): void {
        if (this.valueModel.isEverythingSelected()) {
            this.selectAllState = true;
        } else if (this.valueModel.isNothingSelected()) {
            this.selectAllState = false;
        } else {
            this.selectAllState = undefined;
        }

        this.updateCheckboxIcon();
    }

    private onMiniFilterKeyPress(e: KeyboardEvent): void {
        if (_.isKeyPressed(e, Constants.KEY_ENTER)) {
            this.valueModel.selectAllDisplayed(true);
            this.refresh();
            this.onUiChanged(true);
        }
    }

    private onMiniFilterInput() {
        if (this.valueModel.setMiniFilter(this.eMiniFilter.getValue())) {
            this.virtualList.refresh();
        }

        this.updateSelectAll();
    }

    private onSelectAll(event: Event) {
        event.preventDefault();

        _.addAgGridEventPath(event);

        this.selectAllState = !this.selectAllState;

        if (this.selectAllState) {
            this.valueModel.selectAllDisplayed();
        } else {
            this.valueModel.deselectAllDisplayed();
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

        this.updateSelectAll();
        this.onUiChanged();
    }

    public setMiniFilter(newMiniFilter: string): void {
        this.valueModel.setMiniFilter(newMiniFilter);
        this.eMiniFilter.setValue(this.valueModel.getMiniFilter());
    }

    public getMiniFilter() {
        return this.valueModel.getMiniFilter();
    }

    public selectEverything() {
        this.valueModel.selectAllDisplayed();
        this.refresh();
    }

    public selectNothing() {
        this.valueModel.deselectAllDisplayed();
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
        this.updateSelectAll();
    }

    public isValueSelected(value: string) {
        return this.valueModel.isValueSelected(value);
    }

    public isEverythingSelected() {
        return this.valueModel.isEverythingSelected();
    }

    public isNothingSelected() {
        return this.valueModel.isNothingSelected();
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
