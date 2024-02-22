// ag-grid-react v31.1.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFilterComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var floatingFilterComponentProxy_1 = require("./floatingFilterComponentProxy");
// floating filter is normally instantiated via react header filter cell comp, but not in the case of multi filter
var FloatingFilterComponentWrapper = /** @class */ (function (_super) {
    __extends(FloatingFilterComponentWrapper, _super);
    function FloatingFilterComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = null;
        _this.onModelChange = function (model) { return _this.updateModel(model); };
        return _this;
    }
    FloatingFilterComponentWrapper.prototype.onParentModelChanged = function (parentModel) {
        this.model = parentModel;
        this.refreshProps();
    };
    FloatingFilterComponentWrapper.prototype.refresh = function (newParams) {
        this.sourceParams = newParams;
        this.refreshProps();
    };
    FloatingFilterComponentWrapper.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached'];
    };
    FloatingFilterComponentWrapper.prototype.updateModel = function (model) {
        this.model = model;
        this.refreshProps();
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        floatingFilterComponentProxy_1.updateFloatingFilterParent(this.sourceParams, model);
    };
    FloatingFilterComponentWrapper.prototype.getProps = function () {
        var props = _super.prototype.getProps.call(this);
        props.model = this.model;
        props.onModelChange = this.onModelChange;
        return props;
    };
    return FloatingFilterComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.FloatingFilterComponentWrapper = FloatingFilterComponentWrapper;
