/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../../context/context";
import { _ } from "../../utils";
var AgComponentUtils = /** @class */ (function () {
    function AgComponentUtils() {
    }
    AgComponentUtils.prototype.adaptFunction = function (propertyName, hardcodedJsFunction, componentFromFramework, source) {
        if (hardcodedJsFunction == null) {
            return {
                component: null,
                componentFromFramework: componentFromFramework,
                source: source,
                paramsFromSelector: null
            };
        }
        var metadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return {
                componentFromFramework: componentFromFramework,
                component: metadata.functionAdapter(hardcodedJsFunction),
                source: source,
                paramsFromSelector: null
            };
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
                var callbackResult = callback(this.params);
                var type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    return _.loadTemplate('<span>' + callbackResult + '</span>');
                }
                else {
                    return callbackResult;
                }
            };
            Adapter.prototype.init = function (params) {
                this.params = params;
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
        Autowired("componentMetadataProvider")
    ], AgComponentUtils.prototype, "componentMetadataProvider", void 0);
    AgComponentUtils = __decorate([
        Bean("agComponentUtils")
    ], AgComponentUtils);
    return AgComponentUtils;
}());
export { AgComponentUtils };
