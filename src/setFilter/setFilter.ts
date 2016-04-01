import {Utils as _, Component, Context, Autowired, PostConstruct, GridOptionsWrapper} from "ag-grid/main";
import {SetFilterModel} from "./setFilterModel";
import {Filter} from "ag-grid/main";
import {RichList, RichListModel} from "../components/virtualListItem";

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
            '<div id="richList"></div>'+
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

    private richList: RichList;
    
    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {

        this.setTemplate(this.createTemplate());

        this.richList = new RichList();
        this.context.wireBean(this.richList);

        this.getGui().querySelector('#richList').appendChild(this.richList.getGui());
    }

    public init(params: any): void {
        this.filterParams = params.filterParams;
        if (this.filterParams && this.filterParams.cellHeight) {
            this.richList.setRowHeight(this.filterParams.cellHeight);
        }
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.filterChangedCallback = params.filterChangedCallback;
        this.filterModifiedCallback = params.filterModifiedCallback;
        this.valueGetter = params.valueGetter;
        this.colDef = params.colDef;

        if (this.filterParams) {
            this.richList.setCellRenderer(this.filterParams.cellRenderer);
        }

        this.model = new SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
        this.richList.setModel(new ModelWrapper(this.model));

        this.richList.addEventListener(RichList.EVENT_SELECTED, this.onItemSelected.bind(this));

        this.createGui();
        this.createApi();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(params: any): void  {
        this.richList.refresh();
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
        this.richList.refresh();
    }

    public onAnyFilterChanged(): void {
        this.model.refreshAfterAnyFilterChanged();
        this.richList.refresh();
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
        this.richList.refresh();
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
            this.richList.refresh();
        }
    }

    private onSelectAll() {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        } else {
            this.model.selectNothing();
        }
        this.richList.refresh();
        this.filterChanged();
    }

    private onItemSelected(event: any) {
        if (event.selected) {
            this.model.selectValue(event.value);
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            } else {
                this.eSelectAll.indeterminate = true;
            }
        } else {
            this.model.unselectValue(event.value);
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
                that.richList.refresh();
            },
            selectValue: function (value: any) {
                model.selectValue(value);
                that.richList.refresh();
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
                that.richList.refresh();
            }
        };
    }
}

class ModelWrapper implements RichListModel {
    constructor(private model: SetFilterModel) {}
    public getRowCount(): number {
        return this.model.getDisplayedValueCount();
    }
    public getRow(index: number): any {
        return this.model.getDisplayedValue(index);
    }
    public isRowSelected(value: any): boolean {
        return this.model.isValueSelected(value);
    }
}
