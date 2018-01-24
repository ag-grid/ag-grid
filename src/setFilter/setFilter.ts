import {
    _,
    BaseFilter,
    Component,
    IDoesFilterPassParams,
    ISetFilterParams,
    QuerySelector,
    Utils,
    RefSelector
} from "ag-grid/main";
import {SetFilterModel, SetFilterModelValuesType} from "./setFilterModel";
import {SetFilterListItem} from "./setFilterListItem";
import {VirtualList, VirtualListModel} from "../rendering/virtualList";

enum CheckboxState {CHECKED, UNCHECKED, INTERMEDIATE};

export class SetFilter extends BaseFilter <string, ISetFilterParams, string[]> {

    private model: SetFilterModel;

    @QuerySelector('#selectAll')
    private eSelectAll: HTMLInputElement;
    @QuerySelector('#selectAllContainer')
    private eSelectAllContainer: HTMLElement;
    @QuerySelector('.ag-filter-filter')
    private eMiniFilter: HTMLInputElement;
    @RefSelector('ag-filter-loading')
    private eFilterLoading: HTMLInputElement;

    private selectAllState: CheckboxState;

    private virtualList: VirtualList;
    private debounceFilterChanged: () => void;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateCheckedIcon: HTMLElement;

    constructor() {
        super();
    }

    public customInit(): void {
        let changeFilter: () => void = () => {
            this.onFilterChanged();
        };
        let debounceMs: number = this.filterParams && this.filterParams.debounceMs != null ? this.filterParams.debounceMs : 0;
        this.debounceFilterChanged = _.debounce(changeFilter, debounceMs);


        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eIndeterminateCheckedIcon = _.createIconNoSpan('checkboxIndeterminate', this.gridOptionsWrapper, this.filterParams.column);

    }

    private updateCheckboxIcon() {
        _.removeAllChildren(this.eSelectAll);

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

    public setLoading(loading:boolean):void{
        _.setVisible(this.eFilterLoading, loading);
    }

    public initialiseFilterBodyUi(): void {
        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);
        this.getGui().querySelector('#richList').appendChild(this.virtualList.getGui());
        if (Utils.exists(this.filterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.filterParams.cellHeight);
        }

        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));

        this.model = new SetFilterModel(
            this.filterParams.colDef,
            this.filterParams.rowModel,
            this.filterParams.valueGetter,
            this.filterParams.doesRowPassOtherFilter,
            this.filterParams.suppressSorting,
            (values:string[])=>this.setFilterValues(values, true, false),
            this.setLoading.bind(this)
        );
        this.virtualList.setModel(new ModelWrapper(this.model));
        _.setVisible(<HTMLElement>this.getGui().querySelector('#ag-mini-filter'), !this.filterParams.suppressMiniFilter);

        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', () => this.onMiniFilterChanged());

        this.updateCheckboxIcon();

        this.addDestroyableEventListener(this.eSelectAllContainer, 'click', this.onSelectAll.bind(this));
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    modelFromFloatingFilter(from: string): string[] {
        return [from];
    }

    public refreshFilterBodyUi(): void {

    }

    private createSetListItem(value: any): Component {

        let listItem = new SetFilterListItem(value, this.filterParams.column);
        this.context.wireBean(listItem);
        listItem.setSelected(this.model.isValueSelected(value));

        listItem.addEventListener(SetFilterListItem.EVENT_SELECTED, () => {
            this.onItemSelected(value, listItem.isSelected())
        });

        return listItem;
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(params: any): void {
        this.virtualList.refresh();
        this.eMiniFilter.focus();
    }

    public isFilterActive(): boolean {
        return this.model.isFilterActive();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {

        // if no filter, always pass
        if (this.model.isEverythingSelected() && !this.filterParams.selectAllOnMiniFilter) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected() && !this.filterParams.selectAllOnMiniFilter) {
            return false;
        }

        let value = this.filterParams.valueGetter(params.node);
        if (this.filterParams.colDef.keyCreator) {
            value = this.filterParams.colDef.keyCreator({value: value});
        }
        value = Utils.makeNull(value);

        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                if (this.model.isValueSelected(value[i])) {
                    return true
                }
            }
            return false
        } else {
            return this.model.isValueSelected(value);
        }
    }

    public onNewRowsLoaded(): void {
        let keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        let isSelectAll = this.selectAllState===CheckboxState.CHECKED;

        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param options The options to use.
     * @param selectAll If by default all the values should be selected.
     * @param notify If we should let know the model that the values of the filter have changed
     */
    public setFilterValues(options: string[], selectAll:boolean = false, notify:boolean = true): void {
        this.model.onFilterValuesReady (()=>{
            let keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
            let isSelectAll = selectAll  || (this.selectAllState===CheckboxState.CHECKED);

            this.model.setValuesType(SetFilterModelValuesType.PROVIDED_LIST);
            this.model.refreshValues(options, keepSelection, isSelectAll);
            this.updateSelectAll();
            options.forEach(option=>this.model.selectValue(option));
            this.virtualList.refresh();
            if (notify){
                this.debounceFilterChanged();
            }
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    public resetFilterValues(): void {
        this.model.setValuesType(SetFilterModelValuesType.NOT_PROVIDED);
        this.onNewRowsLoaded();
    }

    public onAnyFilterChanged(): void {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    public bodyTemplate() {
        let translate = this.translate.bind(this);

        return `<div ref="ag-filter-loading" class="loading-filter ag-hidden">${translate('loadingOoo')}</div>
                <div>
                    <div class="ag-filter-header-container" id="ag-mini-filter">
                        <input class="ag-filter-filter" type="text" placeholder="${translate('searchOoo')}"/>
                    </div>
                    <div class="ag-filter-header-container">
                        <label id="selectAllContainer">
                            <div id="selectAll" class="ag-filter-checkbox"></div><span class="ag-filter-value">(${translate('selectAll')})</span>
                        </label>
                    </div>
                    <div id="richList" class="ag-set-filter-list"></div>                    
                </div>`;
    }

    private updateSelectAll(): void {
        if (this.model.isEverythingSelected()) {
            this.selectAllState = CheckboxState.CHECKED;
        } else if (this.model.isNothingSelected()) {
            this.selectAllState = CheckboxState.UNCHECKED;
        } else {
            this.selectAllState = CheckboxState.INTERMEDIATE;
        }
        this.updateCheckboxIcon();
    }

    private onMiniFilterChanged() {
        let miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
        this.updateSelectAll();
    }

    private onSelectAll(event: Event) {
        _.addAgGridEventPath(event);
        if (this.selectAllState === CheckboxState.CHECKED) {
            this.selectAllState = CheckboxState.UNCHECKED;
        } else {
            this.selectAllState = CheckboxState.CHECKED;
        }
        this.doSelectAll();
    }

    private doSelectAll(): void {
        let checked = this.selectAllState === CheckboxState.CHECKED;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.virtualList.refresh();
        this.debounceFilterChanged();
        this.updateSelectAll();
    }

    private onItemSelected(value: any, selected: boolean) {
        if (selected) {
            this.model.selectValue(value);
        } else {
            this.model.unselectValue(value);
        }

        this.updateSelectAll();

        this.debounceFilterChanged();
    }

    public setMiniFilter(newMiniFilter: any): void {
        this.model.setMiniFilter(newMiniFilter);
        this.eMiniFilter.value = this.model.getMiniFilter();
    }

    public getMiniFilter() {
        return this.model.getMiniFilter();
    }

    public selectEverything() {
        this.model.selectEverything();
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public selectNothing() {
        this.model.selectNothing();
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public unselectValue(value: any) {
        this.model.unselectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public selectValue(value: any) {
        this.model.selectValue(value);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public isValueSelected(value: any) {
        return this.model.isValueSelected(value);
    }

    public isEverythingSelected() {
        return this.model.isEverythingSelected();
    }

    public isNothingSelected() {
        return this.model.isNothingSelected();
    }

    public getUniqueValueCount() {
        return this.model.getUniqueValueCount();
    }

    public getUniqueValue(index: any) {
        return this.model.getUniqueValue(index);
    }

    public serialize(): string[] {
        return this.model.getModel();
    }

    public parse(dataModel: string[]) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public resetState() {
        this.setMiniFilter(null);
        this.model.setModel(null, true);
        this.selectEverything();
    }

}

class ModelWrapper implements VirtualListModel {
    constructor(private model: SetFilterModel) {
    }

    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }

    public getRow(index: number): any {
        return this.model.getDisplayedValue(index);
    }
}
