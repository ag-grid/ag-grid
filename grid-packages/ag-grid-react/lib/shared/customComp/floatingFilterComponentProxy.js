// ag-grid-react v31.0.3
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFilterComponentProxy = exports.updateFloatingFilterParent = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var customComponentWrapper_1 = require("./customComponentWrapper");
function updateFloatingFilterParent(params, model) {
    params.parentFilterInstance(function (instance) {
        (instance.setModel(model) || ag_grid_community_1.AgPromise.resolve()).then(function () {
            setTimeout(function () {
                // ensure prop updates have happened
                params.filterParams.filterChangedCallback();
            });
        });
    });
}
exports.updateFloatingFilterParent = updateFloatingFilterParent;
var FloatingFilterComponentProxy = /** @class */ (function () {
    function FloatingFilterComponentProxy(floatingFilterParams, refreshProps) {
        this.floatingFilterParams = floatingFilterParams;
        this.refreshProps = refreshProps;
        this.model = null;
    }
    FloatingFilterComponentProxy.prototype.getProps = function () {
        var _this = this;
        return __assign(__assign({}, this.floatingFilterParams), { model: this.model, onModelChange: function (model) { return _this.updateModel(model); } });
    };
    FloatingFilterComponentProxy.prototype.onParentModelChanged = function (parentModel) {
        this.model = parentModel;
        this.refreshProps();
    };
    FloatingFilterComponentProxy.prototype.refresh = function (params) {
        this.floatingFilterParams = params;
        this.refreshProps();
    };
    FloatingFilterComponentProxy.prototype.setMethods = function (methods) {
        customComponentWrapper_1.addOptionalMethods(this.getOptionalMethods(), methods, this);
    };
    FloatingFilterComponentProxy.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached'];
    };
    FloatingFilterComponentProxy.prototype.updateModel = function (model) {
        this.model = model;
        this.refreshProps();
        updateFloatingFilterParent(this.floatingFilterParams, model);
    };
    return FloatingFilterComponentProxy;
}());
exports.FloatingFilterComponentProxy = FloatingFilterComponentProxy;
