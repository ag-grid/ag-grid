import {Utils as _, ICellRenderer, ICellRendererFunc, Component, Context, Autowired, PostConstruct, GridOptionsWrapper} from "ag-grid/main";
import {SetFilterModel} from "./setFilterModel";
import {Filter} from "ag-grid/main";
import {SetFilterListItem} from "./setFilterListItem";
import {VirtualList, VirtualListModel} from "../rendering/virtualList";

export class SetFilter extends Component implements Filter {

    private static TEMPLATE =
        '<div>'+
            '<div class="ag-filter-header-container">'+
                '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>'+
            '</div>'+
            '<div class="ag-filter-header-container">'+
                '<label>'+
                    '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>'+
                    '([SELECT ALL])'+
                '</label>'+
            '</div>'+
            '<div id="richList" class="ag-set-filter-list"></div>'+
            '<div class="ag-filter-apply-panel" id="applyPanel">'+
                '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
            '</div>'+
        '</div>';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    private filterParams: any;
    private model: SetFilterModel;
    private filterChangedCallback: any;
    private filterModifiedCallback: any;
    private valueGetter: any;
    private colDef: any;

    private eSelectAll: any;
    private eMiniFilter: any;
    private api: any;
    private applyActive: any;
    private eApplyButton: any;

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

    public init(params: any): void {
        this.filterParams = params.filterParams;
        if (this.filterParams && this.filterParams.cellHeight) {
            this.virtualList.setRowHeight(this.filterParams.cellHeight);
        }
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.filterChangedCallback = params.filterChangedCallback;
        this.filterModifiedCallback = params.filterModifiedCallback;
        this.valueGetter = params.valueGetter;
        this.colDef = params.colDef;

        this.virtualList.setComponentCreator(this.createSetListItem.bind(this));

        this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
        this.virtualList.setModel(new ModelWrapper(this.model));

        this.createGui();
        this.createApi();
    }

    private createSetListItem(value: any): Component {
        var cellRenderer: {new(): ICellRenderer} | ICellRendererFunc | string;
        if (this.filterParams) {
            cellRenderer = this.filterParams.cellRenderer;
        }

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
    }

    public getApi() {
        return this.api;
    }

    public isFilterActive(): boolean {
        return this.model.isFilterActive();
    }

    public doesFilterPass(node: any): boolean {

        // if no filter, always pass
        if (this.model.isEverythingSelected()) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected()) {
            return false;
        }

        var value = this.valueGetter(node);
        value = _.makeNull(value);

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
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.virtualList.refresh();
    }

    public onAnyFilterChanged(): void {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    }

    private createTemplate() {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return SetFilter.TEMPLATE
            .replace('[SELECT ALL]', localeTextFunc('selectAll', 'Select All'))
            .replace('[SEARCH...]', localeTextFunc('searchOoo', 'Search...'))
            .replace('[APPLY FILTER]', localeTextFunc('applyFilter', 'Apply Filter'));
    }

    private createGui() {

        this.eSelectAll = this.queryForHtmlElement("#selectAll");
        this.eMiniFilter = this.queryForHtmlElement(".ag-filter-filter");

        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', () => {
            this.onMiniFilterChanged();
        });

        this.eSelectAll.onclick = this.onSelectAll.bind(this);

        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        } else if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        } else {
            this.eSelectAll.indeterminate = true;
        }

        this.setupApply();
        this.virtualList.refresh();
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = this.queryForHtmlElement('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.filterChangedCallback();
            });
        } else {
            _.removeElement(this.getGui(), '#applyPanel');
        }
    }

    private filterChanged() {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
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
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        } else {
            this.model.unselectValue(value);
            //if set is empty, nothing is selected
            if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        }

        this.filterChanged();
    }

    private createApi() {
        var model = this.model;
        var that = this;
        this.api = {
            setMiniFilter: function (newMiniFilter: any) {
                model.setMiniFilter(newMiniFilter);
            },
            getMiniFilter: function () {
                return model.getMiniFilter();
            },
            selectEverything: function () {
                that.eSelectAll.indeterminate = false;
                that.eSelectAll.checked = true;
                // not sure if we need to call this, as checking the checkout above might
                // fire events.
                model.selectEverything();
            },
            isFilterActive: function () {
                return model.isFilterActive();
            },
            selectNothing: function () {
                that.eSelectAll.indeterminate = false;
                that.eSelectAll.checked = false;
                // not sure if we need to call this, as checking the checkout above might
                // fire events.
                model.selectNothing();
            },
            unselectValue: function (value: any) {
                model.unselectValue(value);
                that.virtualList.refresh();
            },
            selectValue: function (value: any) {
                model.selectValue(value);
                that.virtualList.refresh();
            },
            isValueSelected: function (value: any) {
                return model.isValueSelected(value);
            },
            isEverythingSelected: function () {
                return model.isEverythingSelected();
            },
            isNothingSelected: function () {
                return model.isNothingSelected();
            },
            getUniqueValueCount: function () {
                return model.getUniqueValueCount();
            },
            getUniqueValue: function (index: any) {
                return model.getUniqueValue(index);
            },
            getModel: function () {
                return model.getModel();
            },
            setModel: function (dataModel: any) {
                model.setModel(dataModel);
                that.virtualList.refresh();
            }
        };
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
