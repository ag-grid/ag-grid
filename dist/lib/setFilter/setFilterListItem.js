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
var SetFilterListItem = (function (_super) {
    __extends(SetFilterListItem, _super);
    function SetFilterListItem(value, cellRenderer) {
        _super.call(this, SetFilterListItem.TEMPLATE);
        this.value = value;
        this.cellRenderer = cellRenderer;
    }
    SetFilterListItem.prototype.init = function () {
        var _this = this;
        this.render();
        this.eCheckbox = this.queryForHtmlInputElement("input");
        this.addDestroyableEventListener(this.eCheckbox, 'click', function () { return _this.dispatchEvent(SetFilterListItem.EVENT_SELECTED); });
    };
    SetFilterListItem.prototype.isSelected = function () {
        return this.eCheckbox.checked;
    };
    SetFilterListItem.prototype.setSelected = function (selected) {
        this.eCheckbox.checked = selected;
    };
    SetFilterListItem.prototype.render = function () {
        var valueElement = this.queryForHtmlElement(".ag-filter-value");
        // var valueElement = eFilterValue.querySelector(".ag-filter-value");
        if (this.cellRenderer) {
            var component = this.cellRendererService.useCellRenderer(this.cellRenderer, valueElement, { value: this.value });
            if (component && component.destroy) {
                this.addDestroyFunc(component.destroy.bind(component));
            }
        }
        else {
            // otherwise display as a string
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var blanksText = '(' + localeTextFunc('blanks', 'Blanks') + ')';
            var displayNameOfValue = this.value === null ? blanksText : this.value;
            valueElement.innerHTML = displayNameOfValue;
        }
    };
    SetFilterListItem.EVENT_SELECTED = 'selected';
    SetFilterListItem.TEMPLATE = '<label class="ag-set-filter-item">' +
        '<input type="checkbox" class="ag-filter-checkbox"/>' +
        '<span class="ag-filter-value"></span>' +
        '</label>';
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], SetFilterListItem.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('cellRendererService'), 
        __metadata('design:type', main_1.CellRendererService)
    ], SetFilterListItem.prototype, "cellRendererService", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SetFilterListItem.prototype, "init", null);
    return SetFilterListItem;
})(main_1.Component);
exports.SetFilterListItem = SetFilterListItem;
