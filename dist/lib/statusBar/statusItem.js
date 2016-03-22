// ag-grid-enterprise v4.0.7
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
var main_1 = require('ag-grid/main');
var StatusItem = (function (_super) {
    __extends(StatusItem, _super);
    function StatusItem(label) {
        _super.call(this, StatusItem.TEMPLATE);
        this.queryForHtmlElement('#_label').innerHTML = label;
    }
    StatusItem.prototype.init = function () {
        this.lbValue = this.queryForHtmlElement('#_value');
    };
    StatusItem.prototype.setValue = function (value) {
        this.lbValue.innerHTML = main_1.Utils.formatNumberTwoDecimalPlacesAndCommas(value);
    };
    StatusItem.TEMPLATE = '<span class="ag-status-bar-item">' +
        '  <span id="_label"></span>' +
        '  <span id="_value"></span>' +
        '</span>';
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], StatusItem.prototype, "init", null);
    return StatusItem;
})(main_1.Component);
exports.StatusItem = StatusItem;
