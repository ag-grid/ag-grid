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
exports.MenuItemComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var MenuItemComponentWrapper = /** @class */ (function (_super) {
    __extends(MenuItemComponentWrapper, _super);
    function MenuItemComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.active = false;
        _this.expanded = false;
        _this.onActiveChange = function (active) { return _this.updateActive(active); };
        return _this;
    }
    MenuItemComponentWrapper.prototype.setActive = function (active) {
        this.awaitSetActive(active);
    };
    MenuItemComponentWrapper.prototype.setExpanded = function (expanded) {
        this.expanded = expanded;
        this.refreshProps();
    };
    MenuItemComponentWrapper.prototype.getOptionalMethods = function () {
        return ['select', 'configureDefaults'];
    };
    MenuItemComponentWrapper.prototype.awaitSetActive = function (active) {
        this.active = active;
        return this.refreshProps();
    };
    MenuItemComponentWrapper.prototype.updateActive = function (active) {
        var _this = this;
        var result = this.awaitSetActive(active);
        if (active) {
            result.then(function () { return _this.sourceParams.onItemActivated(); });
        }
    };
    MenuItemComponentWrapper.prototype.getProps = function () {
        var props = _super.prototype.getProps.call(this);
        props.active = this.active;
        props.expanded = this.expanded;
        props.onActiveChange = this.onActiveChange;
        // remove props in IMenuItemParams but not CustomMenuItemProps
        delete props.onItemActivated;
        return props;
    };
    return MenuItemComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.MenuItemComponentWrapper = MenuItemComponentWrapper;
