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
import { VanillaFrameworkOverrides } from 'ag-grid-community';
import { VueComponentFactory } from './VueComponentFactory';
var VueFrameworkOverrides = /** @class */ (function (_super) {
    __extends(VueFrameworkOverrides, _super);
    function VueFrameworkOverrides(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to determine
     * if a given component is within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    VueFrameworkOverrides.prototype.frameworkComponent = function (name, components) {
        var foundInstance = !!VueComponentFactory.searchForComponentInstance(this.parent, name, 10, true);
        var result = foundInstance ? name : null;
        if (!result && components && components[name]) {
            var indirectName = components[name];
            foundInstance = !!VueComponentFactory.searchForComponentInstance(this.parent, indirectName, 10, true);
            result = foundInstance ? indirectName : null;
        }
        return result;
    };
    VueFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
        return typeof comp === 'object';
    };
    return VueFrameworkOverrides;
}(VanillaFrameworkOverrides));
export { VueFrameworkOverrides };
