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
    _
} from '@ag-grid-community/core';

import { SetFilterModelValuesType, SetValueModel } from './setValueModel';
import { SetFilterListItem } from './setFilterListItem';
import { SetFilterModel } from './setFilterModel';

export class SetFilter extends ProvidedFilter {
    private valueModel: SetValueModel;

    @RefSelector('eSelectAll') private eSelectAll: AgCheckbox;
    @RefSelector('eSelectAllContainer') private eSelectAllContainer: HTMLElement;
    @RefSelector('eMiniFilter') private eMiniFilter: AgInputTextField;
    @RefSelector('eFilterLoading') private eFilterLoading: HTMLInputElement;

    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('eventService') private eventService: EventService;

    private selectAllState?: boolean;
    private setFilterParams: ISetFilterParams;
    private virtualList: VirtualList;

    // to make the filtering super fast, we store the values in a map.
    // otherwise we would be searching a list of values for each row when checking doesFilterPass
    private appliedModelValuesMapped?: { [value: string]: boolean; };

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
        this.valueModel.setModel(null, true);
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
        if (!a && !b) { return true; }

        // one is missing, other present
        if ((!a && b) || (a && !b)) { return false; }

        // both present, so compare

        // if different sizes, they are different
        if (a.values.length != b.values.length) { return false; }

        // now check each one value by value
        for (let i = 0; i < a.values.length; i++) {
            if (a.values[i] !== b.values[i]) { return false; }
        }

        // got this far means value lists are identical
        return true;
    }

    public setParams(params: ISetFilterParams): void {
        super.setParams(params);

        this.checkSetFilterDeprecatedParams(params);
        this.setFilterParams = params;
        this.initialiseFilterBodyUi();

        const syncValuesAfterDataChange = !params.suppressSyncValuesAfterDataChange &&
            // sync values only with CSRM
            this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE &&
            // sync only needed if user not providing values
            !params.values;

        if (syncValuesAfterDataChange) {
            this.setupSyncValuesAfterDataChange();
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
    }

    // gets called with change to data values, thus need to update the values available for selection
    // in the set filter.
    private syncValuesAfterDataChange(): void {
        const everythingSelected = !this.getModel();

        this.valueModel.refreshAfterNewRowsLoaded(true, everythingSelected);
        this.refresh();

        this.onBtApply(false, true);
    }

    // this keeps the filter up to date with changes in the row data
    private setupSyncValuesAfterDataChange(): void {
        // add listener for when data is changed via transaction update (includes delta row mode
        // as this uses transaction updates)
        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, this.syncValuesAfterDataChange.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, (event: CellValueChangedEvent) => {
            // only interested in changes to do with this column
            if (event.column !== this.setFilterParams.column) { return; }

            this.syncValuesAfterDataChange();
        });
    }

    private updateCheckboxIcon(): void {
        this.eSelectAll.setValue(this.selectAllState);
    }

    public setLoading(loading: boolean): void {
        _.setDisplayed(this.eFilterLoading, loading);
    }

    private initialiseFilterBodyUi(): void {
        this.virtualList = new VirtualList('filter');
        this.getContext().wireBean(this.virtualList);

        const eSetFilterList = this.getRefElement('eSetFilterList');

        if (eSetFilterList) {
            eSetFilterList.appendChild(this.virtualList.getGui());
        }

        if (_.exists(this.setFilterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.setFilterParams.cellHeight);
        }

        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));

        this.valueModel = new SetValueModel(
            this.setFilterParams.colDef,
            this.setFilterParams.rowModel,
            this.setFilterParams.valueGetter,
            this.setFilterParams.doesRowPassOtherFilter,
            this.setFilterParams.suppressSorting,
            (values, toSelect) => this.setFilterValues(values, !toSelect, !!toSelect, toSelect),
            this.setLoading.bind(this),
            this.valueFormatterService,
            this.setFilterParams.column
        );

        this.virtualList.setModel(new ModelWrapper(this.valueModel));

        _.setDisplayed(this.eMiniFilter.getGui(), !this.setFilterParams.suppressMiniFilter);

        this.eMiniFilter.setValue(this.valueModel.getMiniFilter() as any);
        this.eMiniFilter.onValueChange(() => this.onMiniFilterInput());
        this.addDestroyableEventListener(this.eMiniFilter.getInputElement(), 'keypress', this.onMiniFilterKeyPress.bind(this));

        this.updateCheckboxIcon();

        if (this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(this.eSelectAllContainer, false);
        } else {
            this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
        }

        this.addDestroyableEventListener(this.eSelectAll.getInputElement(), 'keydown', (e: KeyboardEvent) => {
            if (e.keyCode === Constants.KEY_SPACE) {
                e.preventDefault();
                this.onSelectAll(e);
            }
        });

        this.refresh();
    }

    private createSetListItem(value: any): Component {
        const listItem = new SetFilterListItem(value, this.setFilterParams);

        this.getContext().wireBean(listItem);

        const selected = this.valueModel.isValueSelected(value);

        listItem.setSelected(selected);
        listItem.addEventListener(
            SetFilterListItem.EVENT_SELECTED, () => this.onItemSelected(value, listItem.isSelected()));

        return listItem;
    }

    // we need to have the GUI attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the GUI state
    public afterGuiAttached(params: any): void {
        const { virtualList, eMiniFilter } = this;
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        virtualList.refresh();

        eMiniFilter.setInputPlaceholder(translate('searchOoo', 'Search...'));
        eMiniFilter.getFocusableElement().focus();
    }

    public refreshVirtualList(): void {
        this.virtualList.refresh();
    }

    public applyModel(): boolean {
        const result = super.applyModel();

        // keep the appliedModelValuesMapped in sync with the applied model
        const appliedModel = this.getModel() as SetFilterModel;

        if (appliedModel) {
            this.appliedModelValuesMapped = appliedModel.values.reduce((object, value) => {
                object[value] = true;
                return object;
            }, {} as { [key: string]: boolean; });
        } else {
            this.appliedModelValuesMapped = undefined;
        }

        return result;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        // should never happen, if filter model not set, then this method should never be called
        if (!this.appliedModelValuesMapped) { return true; }

        let value = this.setFilterParams.valueGetter(params.node);

        if (this.setFilterParams.colDef.keyCreator) {
            value = this.setFilterParams.colDef.keyCreator({ value });
        }

        value = _.makeNull(value);

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                if (!!this.appliedModelValuesMapped[value[i]]) { return true; }
            }

            return false;
        }

        return !!this.appliedModelValuesMapped[value];
    }

    public onNewRowsLoaded(): void {
        const valuesType = this.valueModel.getValuesType();
        const valuesTypeProvided =
            valuesType === SetFilterModelValuesType.PROVIDED_CB ||
            valuesType === SetFilterModelValuesType.PROVIDED_LIST;

        // if the user is providing values, and we are keeping the previous selection, then
        // loading new rows into the grid should have no impact.
        const keepSelection = this.isNewRowsActionKeep();

        if (keepSelection && valuesTypeProvided) { return; }

        const everythingSelected = !this.getModel();

        // default is reset
        this.valueModel.refreshAfterNewRowsLoaded(keepSelection, everythingSelected);
        this.refresh();
        this.onBtApply(false, true);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     * @param selectAll If by default all the values should be selected.
     * @param notify If we should let know the model that the values of the filter have changed
     * @param toSelect The subset of options to subselect
     */
    public setFilterValues(options: string[], selectAll: boolean = false, notify: boolean = true, toSelect?: string[]): void {
        this.valueModel.onFilterValuesReady(() => {
            const keepSelection = this.setFilterParams && this.setFilterParams.newRowsAction === 'keep';
            this.valueModel.setValuesType(SetFilterModelValuesType.PROVIDED_LIST);
            this.valueModel.refreshValues(options, keepSelection, selectAll);
            this.updateSelectAll();

            (toSelect || options).forEach(value => this.valueModel.selectValue(value));

            this.refreshVirtualList();

            if (notify) {
                this.onUiChanged();
            }
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    public resetFilterValues(): void {
        this.valueModel.setValuesType(SetFilterModelValuesType.NOT_PROVIDED);
        this.onNewRowsLoaded();
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
            this.onEnterKeyOnMiniFilter();
        }
    }

    private onEnterKeyOnMiniFilter(): void {
        this.valueModel.selectAllFromMiniFilter();
        this.refresh();
        this.onUiChanged(true);
    }

    private onMiniFilterInput() {
        const miniFilterChanged = this.valueModel.setMiniFilter(this.eMiniFilter.getValue());

        if (miniFilterChanged) {
            this.refreshVirtualList();
        }

        this.updateSelectAll();
    }

    private onSelectAll(event: Event) {
        event.preventDefault();

        _.addAgGridEventPath(event);

        this.selectAllState = !this.selectAllState;

        this.doSelectAll();
    }

    private doSelectAll(): void {
        if (!!this.selectAllState) {
            this.valueModel.selectAllUsingMiniFilter();
        } else {
            this.valueModel.selectNothingUsingMiniFilter();
        }

        this.refresh();
        this.onUiChanged();
    }

    private onItemSelected(value: any, selected: boolean) {
        if (selected) {
            this.valueModel.selectValue(value);
        } else {
            this.valueModel.unselectValue(value);
        }

        this.updateSelectAll();
        this.onUiChanged();
    }

    public setMiniFilter(newMiniFilter: any): void {
        this.valueModel.setMiniFilter(newMiniFilter);
        this.eMiniFilter.setValue(this.valueModel.getMiniFilter() as any);
    }

    public getMiniFilter() {
        return this.valueModel.getMiniFilter();
    }

    public selectEverything() {
        this.valueModel.selectAllUsingMiniFilter();
        this.refresh();
    }

    public selectNothing() {
        this.valueModel.selectNothingUsingMiniFilter();
        this.refresh();
    }

    public unselectValue(value: any) {
        this.valueModel.unselectValue(value);
        this.refresh();
    }

    public selectValue(value: any) {
        this.valueModel.selectValue(value);
        this.refresh();
    }

    private refresh() {
        this.updateSelectAll();
        this.refreshVirtualList();
    }

    public isValueSelected(value: any) {
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
}

class ModelWrapper implements VirtualListModel {
    constructor(private model: SetValueModel) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): any {
        return this.model.getDisplayedValue(index);
    }
}
