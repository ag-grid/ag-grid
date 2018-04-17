/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v17.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var component_1 = require("./component");
var context_1 = require("../context/context");
var componentAnnotations_1 = require("./componentAnnotations");
var TestingSandbox = (function (_super) {
    __extends(TestingSandbox, _super);
    function TestingSandbox() {
        var _this = _super.call(this, TestingSandbox.TEMPLATE) || this;
        _this.bag = {
            a: 23, b: 42
        };
        return _this;
    }
    TestingSandbox.prototype.postConstruct = function () {
        this.instantiate(this.context);
        this.smallComponent.doSomething();
    };
    TestingSandbox.prototype.isFilterActive = function () {
        return false;
    };
    TestingSandbox.prototype.doesFilterPass = function (params) {
        return true;
    };
    TestingSandbox.prototype.getModel = function () {
        return null;
    };
    TestingSandbox.prototype.setModel = function (model) {
    };
    TestingSandbox.prototype.init = function (params) {
    };
    TestingSandbox.TEMPLATE = "<div>\n          <ag-checkbox ref=\"eCheckbox\" label=\"Select Me\"></ag-checkbox>\n          <ag-small-component ref=\"eSmallComponent\" [bag]=\"bag\" some-string=\"bananas\"></ag-small-component>\n        </div>";
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], TestingSandbox.prototype, "context", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSmallComponent'),
        __metadata("design:type", SmallComponent)
    ], TestingSandbox.prototype, "smallComponent", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TestingSandbox.prototype, "postConstruct", null);
    return TestingSandbox;
}(component_1.Component));
exports.TestingSandbox = TestingSandbox;
var SmallComponent = (function (_super) {
    __extends(SmallComponent, _super);
    function SmallComponent() {
        return _super.call(this, "<div>\n                    <div>\n                        Small Component\n                    </div>\n                    <div>\n                        <ag-checkbox label=\"My Checkbox\" (change)=\"onMyCheckboxChanged\"/>\n                    </div>\n                    <div>\n                        <button (click)=\"onBtOk\">OK</button>\n                        <button (click)=\"onBtCancel\">Cancel</button>\n                    </div>\n            </div>") || this;
    }
    SmallComponent.prototype.postConstruct = function () {
        this.instantiate(this.context);
    };
    SmallComponent.prototype.onMyCheckboxChanged = function (event) {
        console.log('onMyCheckboxChanged', event);
    };
    SmallComponent.prototype.onBtOk = function (event) {
        console.log('smallComponent.onBtOK', event);
        console.log('props', this.props);
    };
    SmallComponent.prototype.onBtCancel = function (event) {
        console.log('smallComponent.onBtCancel', event);
        console.log('props', this.props);
    };
    SmallComponent.prototype.doSomething = function () {
        console.log('SmallComponent.doSomething()');
        console.log('props', this.props);
    };
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], SmallComponent.prototype, "context", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SmallComponent.prototype, "postConstruct", null);
    return SmallComponent;
}(component_1.Component));
exports.SmallComponent = SmallComponent;
