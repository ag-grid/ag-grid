import {
    _,
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
    ValueFormatterService
} from "ag-grid-community";
import {SetFilterModelValuesType, SetValueModel} from "./setValueModel";
import {SetFilterListItem} from "./setFilterListItem";
import {VirtualList, VirtualListModel} from "../rendering/virtualList";
import {SetFilterModel} from "./setFilterModel";

enum CheckboxState {CHECKED, UNCHECKED, INTERMEDIATE}

export class SetFilter extends ProvidedFilter {

    private valueModel: SetValueModel;

    @RefSelector('eSelectAll') private eSelectAll: HTMLInputElement;
    @RefSelector('eSelectAllContainer') private eSelectAllContainer: HTMLElement;
    @RefSelector('eMiniFilter') private eMiniFilter: HTMLInputElement;
    @RefSelector('ag-filter-loading') private eFilterLoading: HTMLInputElement;
    
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('eventService') private eventService: EventService;

    private selectAllState: CheckboxState;

    private setFilterParams: ISetFilterParams;

    private virtualList: VirtualList;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateCheckedIcon: HTMLElement;

    // to make the filtering super fast, we store the values in a map.
    // otherwise we would be searching a list of values for each row when checking doesFilterPass
    private appliedModelValuesMapped: { [value: string]: any } | undefined;

    // unlike the simple filter's, nothing in the set filter UI shows/hides.
    // maybe this method belongs in abstractSimpleFilter???
    protected updateUiVisibility(): void {}

    protected createBodyTemplate(): string {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div ref="ag-filter-loading" class="loading-filter ag-hidden">${translate('loadingOoo', 'Loading...')}</div>
                <div>
                    <div class="ag-filter-header-container" role="presentation">
                        <div class="ag-input-wrapper" id="ag-mini-filter" role="presentation">
                            <input ref="eMiniFilter" class="ag-filter-filter" type="text" placeholder="${translate('searchOoo', 'Search...')}"/>
                        </div>
                        <label ref="eSelectAllContainer" class="ag-set-filter-item">
                            <div ref="eSelectAll" class="ag-filter-checkbox"></div><span class="ag-filter-value">(${translate('selectAll', 'Select All')})</span>
                        </label>
                    </div>
                    <div ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
                </div>`;
    }

    protected resetUiToDefaults(): void {
        this.setMiniFilter(null);
        this.valueModel.setModel(null, true);
        this.selectEverything();
    }

    protected setModelIntoUi(model: SetFilterModel): void {
        this.resetUiToDefaults();
        if (model) {
            // also supporting old filter model for backwards compatibility
            const newValues: string[] | null = (model instanceof Array) ? model : model.values;

            this.valueModel.setModel(newValues);
            this.updateSelectAll();
            this.virtualList.refresh();
        }
    }

    public getModelFromUi(): SetFilterModel | null {
        const values = this.valueModel.getModel();
        if (!values) { return null; }

        if (this.gridOptionsWrapper.isEnableOldSetFilterModel()) {
            // this is a hack, it breaks casting rules, to apply with old model
            return (values as any) as SetFilterModel;
        } else {
            return {
                values: values,
                filterType: 'set'
            };
        }
    }

    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean {
        return false;
    }

    public setParams(params: ISetFilterParams): void {
        super.setParams(params);

        this.setFilterParams = params;

        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.setFilterParams.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.setFilterParams.column);
        this.eIndeterminateCheckedIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.setFilterParams.column);

        this.initialiseFilterBodyUi();

        const doSyncLikeExcel = params.syncValuesLikeExcel
                                    // sync like excel only withs with CSRM
                                    && this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE
                                    // sync only needed if user not providing values
                                    && !params.values;
        if (doSyncLikeExcel) {
            this.setupSyncValuesLikeExcel();
        }
    }

    private resetFilterValuesAndReapplyModel(): void {
        const modelBeforeUpdate = this.getModel();
        this.resetFilterValues();
        if (modelBeforeUpdate) {
            this.setModel(modelBeforeUpdate);
        }
    }

    private setupSyncValuesLikeExcel(): void {
        const col = this.setFilterParams.column;

        const rowDataUpdatedListener = () => {
            this.resetFilterValuesAndReapplyModel();
        };

        const cellValueChangedListener = (event: CellValueChangedEvent) => {
            // only interested in changes to do with this column
            if (event.column !== col) { return; }
            this.resetFilterValuesAndReapplyModel();
        };

        this.addDestroyableEventListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, rowDataUpdatedListener);
        this.addDestroyableEventListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, cellValueChangedListener);
    }

    private updateCheckboxIcon() {
        _.clearElement(this.eSelectAll);

        let icon: HTMLElement;
        switch (this.selectAllState) {
            case CheckboxState.INTERMEDIATE:
                icon = this.eIndeterminateCheckedIcon;
                break;
            case CheckboxState.CHECKED:
                icon = this.eCheckedIcon;
                break;
            case CheckboxState.UNCHECKED:
                icon = this.eUncheckedIcon;
                break;
            default: // default happens when initialising for first time
                icon = this.eCheckedIcon;
                break;
        }

        this.eSelectAll.appendChild(icon);
    }

    public setLoading(loading: boolean): void {
        _.setDisplayed(this.eFilterLoading, loading);
    }

    private initialiseFilterBodyUi(): void {
        this.virtualList = new VirtualList();
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
            (values: string[] | null, toSelect?: string[] | null) => this.setFilterValues(values!, toSelect ? false : true, toSelect ? true : false, toSelect!),
            this.setLoading.bind(this),
            this.valueFormatterService,
            this.setFilterParams.column
        );
        this.virtualList.setModel(new ModelWrapper(this.valueModel));
        _.setDisplayed(this.getGui().querySelector('#ag-mini-filter') as HTMLElement, !this.setFilterParams.suppressMiniFilter);

        this.eMiniFilter.value = this.valueModel.getMiniFilter() as any;
        this.addDestroyableEventListener(this.eMiniFilter, 'input', this.onMiniFilterInput.bind(this));
        this.addDestroyableEventListener(this.eMiniFilter, 'keypress', this.onMiniFilterKeyPress.bind(this));

        this.updateCheckboxIcon();

        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
        this.updateSelectAll();

        if (this.setFilterParams.suppressSelectAll) {
            _.setDisplayed(this.eSelectAllContainer, false);
        }

        this.virtualList.refresh();
    }

    private createSetListItem(value: any): Component {

        const listItem = new SetFilterListItem(value, this.setFilterParams.column);
        this.getContext().wireBean(listItem);
        listItem.setSelected(this.valueModel.isValueSelected(value));

        listItem.addEventListener(SetFilterListItem.EVENT_SELECTED, () => {
            this.onItemSelected(value, listItem.isSelected());
        });

        return listItem;
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(params: any): void {
        this.virtualList.refresh();
        this.eMiniFilter.focus();
    }

    public applyModel(): boolean {
        const res = super.applyModel();

        // keep the appliedModelValuesMapped in sync with the applied model
        const appliedModel = this.getModel() as SetFilterModel;
        if (appliedModel) {
            this.appliedModelValuesMapped = {};
            appliedModel.values.forEach( value => this.appliedModelValuesMapped![value] = true );
        } else {
            this.appliedModelValuesMapped = undefined;
        }

        return res;
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {

        // should never happen, if filter model not set, then this method should never be called
        if (!this.appliedModelValuesMapped) { return true; }

        let value = this.setFilterParams.valueGetter(params.node);
        if (this.setFilterParams.colDef.keyCreator) {
            value = this.setFilterParams.colDef.keyCreator({value: value});
        }

        value = _.makeNull(value);

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const valueExistsInMap = !!this.appliedModelValuesMapped![value[i]];
                if (valueExistsInMap) {
                    return true;
                }
            }
            return false;
        } else {
            const valueExistsInMap = !!this.appliedModelValuesMapped![value];
            return valueExistsInMap;
        }
    }

    public onNewRowsLoaded(): void {

        const valuesType = this.valueModel.getValuesType();
        const valuesTypeProvided =
            valuesType === SetFilterModelValuesType.PROVIDED_CB
            || valuesType === SetFilterModelValuesType.PROVIDED_LIST;

        // if the user is providing values, and we are keeping the previous selection, then
        // loading new rows into the grid should have no impact.
        const newRowsActionKeep = this.isNewRowsActionKeep();
        if (newRowsActionKeep && valuesTypeProvided) {
            return;
        }

        const everythingSelected = !this.getModel();

        // default is reset
        this.valueModel.refreshAfterNewRowsLoaded(newRowsActionKeep, everythingSelected);
        this.updateSelectAll();
        this.virtualList.refresh();

        this.applyModel();
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
    public setFilterValues(options: string[], selectAll: boolean = false, notify: boolean = true, toSelect ?: string[]): void {
        this.valueModel.onFilterValuesReady(() => {
            const keepSelection = this.setFilterParams && this.setFilterParams.newRowsAction === 'keep';
            this.valueModel.setValuesType(SetFilterModelValuesType.PROVIDED_LIST);
            this.valueModel.refreshValues(options, keepSelection, selectAll);
            this.updateSelectAll();

            const actualToSelect: string[] = toSelect ? toSelect : options;

            actualToSelect.forEach(option => this.valueModel.selectValue(option));
            this.virtualList.refresh();
            if (notify) {
                // this.onUiChangedListener(true);
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
            this.selectAllState = CheckboxState.CHECKED;
        } else if (this.valueModel.isNothingSelected()) {
            this.selectAllState = CheckboxState.UNCHECKED;
        } else {
            this.selectAllState = CheckboxState.INTERMEDIATE;
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
        this.virtualList.refresh();
        this.updateSelectAll();
        this.onUiChanged();
    }

    private onMiniFilterInput() {
        const miniFilterChanged = this.valueModel.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    }

    private onSelectAll(event: Event) {
        event.preventDefault();
        _.addAgGridEventPath(event);
        if (this.selectAllState === CheckboxState.CHECKED) {
            this.selectAllState = CheckboxState.UNCHECKED;
        } else {
            this.selectAllState = CheckboxState.CHECKED;
        }
        this.doSelectAll();
    }

    private doSelectAll(): void {
        const checked = this.selectAllState === CheckboxState.CHECKED;
        if (checked) {
            this.valueModel.selectAllUsingMiniFilter();
        } else {
            this.valueModel.selectNothingUsingMiniFilter();
        }
        this.virtualList.refresh();
        this.onUiChanged();
        this.updateSelectAll();
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
        this.eMiniFilter.value = this.valueModel.getMiniFilter() as any;
    }

    public getMiniFilter() {
        return this.valueModel.getMiniFilter();
    }

    public selectEverything() {
        this.valueModel.selectAllUsingMiniFilter();
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public selectNothing() {
        this.valueModel.selectNothingUsingMiniFilter();
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public unselectValue(value: any) {
        this.valueModel.unselectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public selectValue(value: any) {
        this.valueModel.selectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
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
