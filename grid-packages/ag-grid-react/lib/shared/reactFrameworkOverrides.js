// ag-grid-react v29.3.5
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactFrameworkOverrides = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var groupCellRenderer_1 = __importDefault(require("../reactUi/cellRenderer/groupCellRenderer"));
var detailCellRenderer_1 = __importDefault(require("../reactUi/cellRenderer/detailCellRenderer"));
var ReactFrameworkOverrides = /** @class */ (function (_super) {
    __extends(ReactFrameworkOverrides, _super);
    function ReactFrameworkOverrides(reactUi) {
        var _this = _super.call(this) || this;
        _this.frameworkComponents = {
            agGroupCellRenderer: groupCellRenderer_1.default,
            agGroupRowRenderer: groupCellRenderer_1.default,
            agDetailCellRenderer: detailCellRenderer_1.default
        };
        _this.reactUi = reactUi;
        return _this;
    }
    ReactFrameworkOverrides.prototype.frameworkComponent = function (name) {
        if (!this.reactUi) {
            return;
        }
        return this.frameworkComponents[name];
    };
    ReactFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
        if (!comp) {
            return false;
        }
        var prototype = comp.prototype;
        var isJsComp = prototype && 'getGui' in prototype;
        return !isJsComp;
    };
    return ReactFrameworkOverrides;
}(ag_grid_community_1.VanillaFrameworkOverrides));
exports.ReactFrameworkOverrides = ReactFrameworkOverrides;
