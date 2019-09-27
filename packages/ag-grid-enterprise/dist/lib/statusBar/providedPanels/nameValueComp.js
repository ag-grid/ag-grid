// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var NameValueComp = /** @class */ (function (_super) {
    __extends(NameValueComp, _super);
    function NameValueComp() {
        return _super.call(this, NameValueComp.TEMPLATE) || this;
    }
    NameValueComp.prototype.setLabel = function (key, defaultValue) {
        // we want to hide until the first value comes in
        this.setDisplayed(false);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    };
    NameValueComp.prototype.setValue = function (value) {
        this.eValue.innerHTML = value;
    };
    NameValueComp.TEMPLATE = "<div class=\"ag-name-value\">  \n            <span ref=\"eLabel\"></span>:&nbsp;\n            <span ref=\"eValue\" class=\"ag-name-value-value\"></span>\n        </div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], NameValueComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eLabel'),
        __metadata("design:type", HTMLElement)
    ], NameValueComp.prototype, "eLabel", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eValue'),
        __metadata("design:type", HTMLElement)
    ], NameValueComp.prototype, "eValue", void 0);
    return NameValueComp;
}(ag_grid_community_1.Component));
exports.NameValueComp = NameValueComp;
