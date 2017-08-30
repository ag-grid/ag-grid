import {
    _,
    BaseFilter,
    Component,
    IDoesFilterPassParams,
    ISetFilterParams,
    QuerySelector,
    Utils
} from "ag-grid/main";
import {SetFilterModel} from "./setFilterModel";
import {SetFilterListItem} from "./setFilterListItem";
import {VirtualList, VirtualListModel} from "../rendering/virtualList";

export class SetFilter extends BaseFilter <string, ISetFilterParams, string[]> {
    private model: SetFilterModel;
    private suppressSorting: boolean;

    @QuerySelector('#selectAll')
    private eSelectAll: HTMLInputElement;
    @QuerySelector('#selectAllContainer')
    private eSelectAllContainer: HTMLElement;
    @QuerySelector('.ag-filter-filter')
    private eMiniFilter: HTMLInputElement;


    private virtualList: VirtualList;
    private debounceFilterChanged:()=>void;

    private eCheckedIcon: HTMLElement;
    private eUncheckedIcon: HTMLElement;
    private eIndeterminateCheckedIcon: HTMLElement;

    private selected: boolean = true;
    
    constructor() {
        super();
    }

    public customInit ():void{
        let changeFilter:()=>void= ()=>{
            this.onFilterChanged();
        };
        let debounceMs: number = this.filterParams && this.filterParams.debounceMs != null ? this.filterParams.debounceMs : 0;
        this.debounceFilterChanged = _.debounce(changeFilter, debounceMs);


        this.eCheckedIcon = _.createIconNoSpan('checkboxChecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eUncheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.filterParams.column);
        this.eIndeterminateCheckedIcon = _.createIconNoSpan('checkboxUnchecked', this.gridOptionsWrapper, this.filterParams.column);

    }

    private updateCheckboxIcon (){
        if (this.eSelectAll.children){
            for (let i=0; i<this.eSelectAll.children.length; i++){
                this.eSelectAll.removeChild(this.eSelectAll.children.item(i));
            }
        }

        if (this.eSelectAll.indeterminate){
            this.eSelectAll.appendChild(this.eIndeterminateCheckedIcon);
        }else if (this.eSelectAll.checked){
            this.eSelectAll.appendChild(this.eCheckedIcon);
        }else{
            this.eSelectAll.appendChild(this.eUncheckedIcon);
        }
    }


    public initialiseFilterBodyUi(): void {
        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);
        this.getHtmlElement().querySelector('#richList').appendChild(this.virtualList.getHtmlElement());
        if (Utils.exists(this.filterParams.cellHeight)) {
            this.virtualList.setRowHeight(this.filterParams.cellHeight);
        }

        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));

        this.model = new SetFilterModel(this.filterParams.colDef, this.filterParams.rowModel, this.filterParams.valueGetter, this.filterParams.doesRowPassOtherFilter, this.filterParams.suppressSorting);
        this.virtualList.setModel(new ModelWrapper(this.model));
        _.setVisible(<HTMLElement>this.getHtmlElement().querySelector('#ag-mini-filter'), !this.filterParams.suppressMiniFilter);

        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', () => this.onMiniFilterChanged());

        this.updateCheckboxIcon();

        this.eSelectAllContainer.onclick = this.onSelectAll.bind(this);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    modelFromFloatingFilter(from: string): string[] {
        return [from];
    }

    public refreshFilterBodyUi ():void{

    }

    private createSetListItem(value: any): Component {

        let listItem = new SetFilterListItem(value, this.filterParams.column);
        this.context.wireBean(listItem);
        listItem.setSelected(this.model.isValueSelected(value));

        listItem.addEventListener(SetFilterListItem.EVENT_SELECTED, ()=> {
            this.onItemSelected(value, listItem.isSelected())
        });

        return listItem;
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(params: any): void  {
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
            value = this.filterParams.colDef.keyCreator( {value: value} );
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
        let isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
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
     */
    public setFilterValues (options:string[]): void{
        let keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        let isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;

        this.model.setUsingProvidedSet(true);
        this.model.refreshValues(options, keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Public method provided so the user can reset the values of the filter once that it has started
     * @param options The options to use.
     */
    public resetFilterValues (): void{
        this.model.setUsingProvidedSet (false);
        this.onNewRowsLoaded();
    }

    public onAnyFilterChanged(): void {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    public bodyTemplate() {
        let translate = this.translate.bind(this);

        return `<div>
                    <div class="ag-filter-header-container" id="ag-mini-filter">
                        <input class="ag-filter-filter" type="text" placeholder="${translate('searchOoo')}"/>
                    </div>
                    <div class="ag-filter-header-container">
                        <label id="selectAllContainer">
                            <div id="selectAll" class="ag-filter-checkbox"></div>
                            <span class="ag-filter-value">(${translate('selectAll')})</span>
                        </label>
                    </div>
                    <div id="richList" class="ag-set-filter-list"></div>                    
                </div>`;
    }

    private updateSelectAll(): void {
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        } else {
            this.eSelectAll.indeterminate = true;
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

    private onSelectAll() {
        this.eSelectAll.checked = !this.eSelectAll.checked;
        let checked = this.eSelectAll.checked;
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

    public serialize():string[] {
        return this.model.getModel();
    }

    public parse(dataModel: string[]) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public resetState (){
        this.setMiniFilter(null);
        this.model.setModel(null, true);
        this.selectEverything();
    }

}

class ModelWrapper implements VirtualListModel {
    constructor(private model: SetFilterModel) {}
    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }
    public getRow(index: number): any {
        return this.model.getDisplayedValue(index);
    }
}
