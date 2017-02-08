import {IFilterComp, IFilterParams, IDoesFilterPassParams, Utils, ICellRendererComp, ICellRendererFunc, Component, Context, Autowired, PostConstruct, GridOptionsWrapper} from "ag-grid/main";
import {SetFilterModel} from "./setFilterModel";
import {SetFilterListItem} from "./setFilterListItem";
import {VirtualList, VirtualListModel} from "../rendering/virtualList";

interface ISetFilterParams extends IFilterParams {
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    newRowsAction: string;
}

export class SetFilter extends Component implements IFilterComp {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private params: ISetFilterParams;
    private model: SetFilterModel;
    private suppressSorting: boolean;
    private applyActive: boolean;
    private newRowsActionKeep: boolean;

    private eSelectAll: HTMLInputElement;
    private eMiniFilter: HTMLInputElement;
    private eApplyButton: HTMLButtonElement;

    private virtualList: VirtualList;
    
    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {

        this.setTemplate(this.createTemplate());

        this.virtualList = new VirtualList();
        this.context.wireBean(this.virtualList);

        this.getGui().querySelector('#richList').appendChild(this.virtualList.getGui());
    }

    public init(params: IFilterParams): void {
        this.params = <ISetFilterParams> params;
        this.applyActive = this.params.apply === true;
        this.suppressSorting = this.params.suppressSorting === true;
        this.newRowsActionKeep = this.params.newRowsAction === 'keep';

        if (Utils.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }

        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));

        this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter, this.suppressSorting);
        this.virtualList.setModel(new ModelWrapper(this.model));

        this.createGui();
    }

    private createSetListItem(value: any): Component {
        var cellRenderer = this.params.cellRenderer;

        var listItem = new SetFilterListItem(value, cellRenderer);
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
        if (this.model.isEverythingSelected()) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected()) {
            return false;
        }

        var value = this.params.valueGetter(params.node);
        if (this.params.colDef.keyCreator) {
            value = this.params.colDef.keyCreator( {value: value} );
        }
        value = Utils.makeNull(value);

        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
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
        var keepSelection = this.params && this.params.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.updateSelectAll();
        this.virtualList.refresh();
    }

    public onAnyFilterChanged(): void {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    private createTemplate() {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div>
                    <div class="ag-filter-header-container">
                        <input class="ag-filter-filter" type="text" placeholder="${translate('searchOoo', 'Search...')}"/>
                    </div>
                    <div class="ag-filter-header-container">
                        <label>
                            <input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>
                            <span class="ag-filter-value">(${translate('selectAll', 'Select All')})</span>
                        </label>
                    </div>
                    <div id="richList" class="ag-set-filter-list"></div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`;
    }

    private createGui() {

        this.eSelectAll = <HTMLInputElement> this.queryForHtmlElement("#selectAll");
        this.eMiniFilter = <HTMLInputElement> this.queryForHtmlElement(".ag-filter-filter");

        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', () => {
            this.onMiniFilterChanged();
        });

        this.eSelectAll.onclick = this.onSelectAll.bind(this);
        this.updateSelectAll();
        this.setupApply();
        this.virtualList.refresh();
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
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = <HTMLButtonElement> this.queryForHtmlElement('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.params.filterChangedCallback();
            });
        } else {
            Utils.removeElement(this.getGui(), '#applyPanel');
        }
    }

    private filterChanged() {
        this.params.filterModifiedCallback();
        if (!this.applyActive) {
            this.params.filterChangedCallback();
        }
    }

    private onMiniFilterChanged() {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
    }

    private onSelectAll() {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.virtualList.refresh();
        this.filterChanged();
    }

    private onItemSelected(value: any, selected: boolean) {
        if (selected) {
            this.model.selectValue(value);
        } else {
            this.model.unselectValue(value);
        }

        this.updateSelectAll();

        this.filterChanged();
    }

    public setMiniFilter(newMiniFilter: any): void {
        this.model.setMiniFilter(newMiniFilter);
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

    public getModel() {
        return this.model.getModel();
    }

    public setModel(dataModel: any) {
        this.model.setModel(dataModel);
        this.updateSelectAll();
        this.virtualList.refresh();
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
