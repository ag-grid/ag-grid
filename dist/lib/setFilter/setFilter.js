// ag-grid-enterprise v4.1.4
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var setFilterModel_1 = require("./setFilterModel");
var setFilterListItem_1 = require("./setFilterListItem");
var virtualList_1 = require("../rendering/virtualList");
var SetFilter = (function (_super) {
    __extends(SetFilter, _super);
    function SetFilter() {
        _super.call(this);
    }
    SetFilter.prototype.postConstruct = function () {
        this.setTemplate(this.createTemplate());
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.getGui().querySelector('#richList').appendChild(this.virtualList.getGui());
    };
    SetFilter.prototype.init = function (params) {
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
        this.model = new setFilterModel_1.SetFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
        this.virtualList.setModel(new ModelWrapper(this.model));
        this.createGui();
        this.createApi();
    };
    SetFilter.prototype.createSetListItem = function (value) {
        var _this = this;
        var cellRenderer;
        if (this.filterParams) {
            cellRenderer = this.filterParams.cellRenderer;
        }
        var listItem = new setFilterListItem_1.SetFilterListItem(value, cellRenderer);
        this.context.wireBean(listItem);
        listItem.setSelected(this.model.isValueSelected(value));
        listItem.addEventListener(setFilterListItem_1.SetFilterListItem.EVENT_SELECTED, function () {
            _this.onItemSelected(value, listItem.isSelected());
        });
        return listItem;
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    SetFilter.prototype.afterGuiAttached = function (params) {
        this.virtualList.refresh();
    };
    SetFilter.prototype.getApi = function () {
        return this.api;
    };
    SetFilter.prototype.isFilterActive = function () {
        return this.model.isFilterActive();
    };
    SetFilter.prototype.doesFilterPass = function (node) {
        // if no filter, always pass
        if (this.model.isEverythingSelected()) {
            return true;
        }
        // if nothing selected in filter, always fail
        if (this.model.isNothingSelected()) {
            return false;
        }
        var value = this.valueGetter(node);
        value = main_1.Utils.makeNull(value);
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                if (this.model.isValueSelected(value[i])) {
                    return true;
                }
            }
            return false;
        }
        else {
            return this.model.isValueSelected(value);
        }
    };
    SetFilter.prototype.onNewRowsLoaded = function () {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        var isSelectAll = this.eSelectAll && this.eSelectAll.checked && !this.eSelectAll.indeterminate;
        // default is reset
        this.model.refreshAfterNewRowsLoaded(keepSelection, isSelectAll);
        this.virtualList.refresh();
    };
    SetFilter.prototype.onAnyFilterChanged = function () {
        this.model.refreshAfterAnyFilterChanged();
        this.virtualList.refresh();
    };
    SetFilter.prototype.createTemplate = function () {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        return SetFilter.TEMPLATE
            .replace('[SELECT ALL]', localeTextFunc('selectAll', 'Select All'))
            .replace('[SEARCH...]', localeTextFunc('searchOoo', 'Search...'))
            .replace('[APPLY FILTER]', localeTextFunc('applyFilter', 'Apply Filter'));
    };
    SetFilter.prototype.createGui = function () {
        var _this = this;
        this.eSelectAll = this.queryForHtmlElement("#selectAll");
        this.eMiniFilter = this.queryForHtmlElement(".ag-filter-filter");
        this.eMiniFilter.value = this.model.getMiniFilter();
        this.addDestroyableEventListener(this.eMiniFilter, 'input', function () {
            _this.onMiniFilterChanged();
        });
        this.eSelectAll.onclick = this.onSelectAll.bind(this);
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = true;
        }
        else if (this.model.isNothingSelected()) {
            this.eSelectAll.indeterminate = false;
            this.eSelectAll.checked = false;
        }
        else {
            this.eSelectAll.indeterminate = true;
        }
        this.setupApply();
        this.virtualList.refresh();
    };
    SetFilter.prototype.setupApply = function () {
        var _this = this;
        if (this.applyActive) {
            this.eApplyButton = this.queryForHtmlElement('#applyButton');
            this.eApplyButton.addEventListener('click', function () {
                _this.filterChangedCallback();
            });
        }
        else {
            main_1.Utils.removeElement(this.getGui(), '#applyPanel');
        }
    };
    SetFilter.prototype.filterChanged = function () {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
        }
    };
    SetFilter.prototype.onMiniFilterChanged = function () {
        var miniFilterChanged = this.model.setMiniFilter(this.eMiniFilter.value);
        if (miniFilterChanged) {
            this.virtualList.refresh();
        }
    };
    SetFilter.prototype.onSelectAll = function () {
        var checked = this.eSelectAll.checked;
        if (checked) {
            this.model.selectEverything();
        }
        else {
            this.model.selectNothing();
        }
        this.virtualList.refresh();
        this.filterChanged();
    };
    SetFilter.prototype.onItemSelected = function (value, selected) {
        if (selected) {
            this.model.selectValue(value);
            if (this.model.isEverythingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = true;
            }
            else {
                this.eSelectAll.indeterminate = true;
            }
        }
        else {
            this.model.unselectValue(value);
            //if set is empty, nothing is selected
            if (this.model.isNothingSelected()) {
                this.eSelectAll.indeterminate = false;
                this.eSelectAll.checked = false;
            }
            else {
                this.eSelectAll.indeterminate = true;
            }
        }
        this.filterChanged();
    };
    SetFilter.prototype.createApi = function () {
        var model = this.model;
        var that = this;
        this.api = {
            setMiniFilter: function (newMiniFilter) {
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
            unselectValue: function (value) {
                model.unselectValue(value);
                that.virtualList.refresh();
            },
            selectValue: function (value) {
                model.selectValue(value);
                that.virtualList.refresh();
            },
            isValueSelected: function (value) {
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
            getUniqueValue: function (index) {
                return model.getUniqueValue(index);
            },
            getModel: function () {
                return model.getModel();
            },
            setModel: function (dataModel) {
                model.setModel(dataModel);
                that.virtualList.refresh();
            }
        };
    };
    SetFilter.TEMPLATE = '<div>' +
        '<div class="ag-filter-header-container">' +
        '<input class="ag-filter-filter" type="text" placeholder="[SEARCH...]"/>' +
        '</div>' +
        '<div class="ag-filter-header-container">' +
        '<label>' +
        '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
        '([SELECT ALL])' +
        '</label>' +
        '</div>' +
        '<div id="richList" class="ag-set-filter-list"></div>' +
        '<div class="ag-filter-apply-panel" id="applyPanel">' +
        '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
        '</div>' +
        '</div>';
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], SetFilter.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], SetFilter.prototype, "context", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SetFilter.prototype, "postConstruct", null);
    return SetFilter;
})(main_1.Component);
exports.SetFilter = SetFilter;
var ModelWrapper = (function () {
    function ModelWrapper(model) {
        this.model = model;
    }
    ModelWrapper.prototype.getRowCount = function () {
        return this.model.getDisplayedValueCount();
    };
    ModelWrapper.prototype.getRow = function (index) {
        return this.model.getDisplayedValue(index);
    };
    return ModelWrapper;
})();
