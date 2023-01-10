/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgComponentUtils = void 0;
var context_1 = require("../../context/context");
var beanStub_1 = require("../../context/beanStub");
var dom_1 = require("../../utils/dom");
var AgComponentUtils = /** @class */ (function (_super) {
    __extends(AgComponentUtils, _super);
    function AgComponentUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AgComponentUtils.prototype.adaptFunction = function (propertyName, jsCompFunc) {
        var metadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return metadata.functionAdapter(jsCompFunc);
        }
        return null;
    };
    AgComponentUtils.prototype.adaptCellRendererFunction = function (callback) {
        var Adapter = /** @class */ (function () {
            function Adapter() {
            }
            Adapter.prototype.refresh = function (params) {
                return false;
            };
            Adapter.prototype.getGui = function () {
                return this.eGui;
            };
            Adapter.prototype.init = function (params) {
                var callbackResult = callback(params);
                var type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    this.eGui = dom_1.loadTemplate('<span>' + callbackResult + '</span>');
                    return;
                }
                if (callbackResult == null) {
                    this.eGui = dom_1.loadTemplate('<span></span>');
                    return;
                }
                this.eGui = callbackResult;
            };
            return Adapter;
        }());
        return Adapter;
    };
    AgComponentUtils.prototype.doesImplementIComponent = function (candidate) {
        if (!candidate) {
            return false;
        }
        return candidate.prototype && 'getGui' in candidate.prototype;
    };
    __decorate([
        context_1.Autowired("componentMetadataProvider")
    ], AgComponentUtils.prototype, "componentMetadataProvider", void 0);
    AgComponentUtils = __decorate([
        context_1.Bean("agComponentUtils")
    ], AgComponentUtils);
    return AgComponentUtils;
}(beanStub_1.BeanStub));
exports.AgComponentUtils = AgComponentUtils;
