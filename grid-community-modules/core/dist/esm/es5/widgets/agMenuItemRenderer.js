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
import { Component } from './component';
import { createIconNoSpan } from '../utils/icon';
import { isNodeOrElement, loadTemplate } from '../utils/dom';
import { setAriaExpanded } from '../utils/aria';
var AgMenuItemRenderer = /** @class */ (function (_super) {
    __extends(AgMenuItemRenderer, _super);
    function AgMenuItemRenderer() {
        var _this = _super.call(this) || this;
        _this.setTemplate(/* html */ "<div></div>");
        return _this;
    }
    AgMenuItemRenderer.prototype.init = function (params) {
        var _a;
        this.params = params;
        this.cssClassPrefix = (_a = this.params.cssClassPrefix) !== null && _a !== void 0 ? _a : 'ag-menu-option';
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
    };
    AgMenuItemRenderer.prototype.configureDefaults = function () {
        return true;
    };
    AgMenuItemRenderer.prototype.addIcon = function () {
        if (this.params.isCompact) {
            return;
        }
        var icon = loadTemplate(/* html */ "<span ref=\"eIcon\" class=\"".concat(this.getClassName('part'), " ").concat(this.getClassName('icon'), "\" role=\"presentation\"></span>"));
        if (this.params.checked) {
            icon.appendChild(createIconNoSpan('check', this.gridOptionsService));
        }
        else if (this.params.icon) {
            if (isNodeOrElement(this.params.icon)) {
                icon.appendChild(this.params.icon);
            }
            else if (typeof this.params.icon === 'string') {
                icon.innerHTML = this.params.icon;
            }
            else {
                console.warn('AG Grid: menu item icon must be DOM node or string');
            }
        }
        this.getGui().appendChild(icon);
    };
    AgMenuItemRenderer.prototype.addName = function () {
        var name = loadTemplate(/* html */ "<span ref=\"eName\" class=\"".concat(this.getClassName('part'), " ").concat(this.getClassName('text'), "\">").concat(this.params.name || '', "</span>"));
        this.getGui().appendChild(name);
    };
    AgMenuItemRenderer.prototype.addShortcut = function () {
        if (this.params.isCompact) {
            return;
        }
        var shortcut = loadTemplate(/* html */ "<span ref=\"eShortcut\" class=\"".concat(this.getClassName('part'), " ").concat(this.getClassName('shortcut'), "\">").concat(this.params.shortcut || '', "</span>"));
        this.getGui().appendChild(shortcut);
    };
    AgMenuItemRenderer.prototype.addSubMenu = function () {
        var pointer = loadTemplate(/* html */ "<span ref=\"ePopupPointer\" class=\"".concat(this.getClassName('part'), " ").concat(this.getClassName('popup-pointer'), "\"></span>"));
        var eGui = this.getGui();
        if (this.params.subMenu) {
            var iconName = this.gridOptionsService.get('enableRtl') ? 'smallLeft' : 'smallRight';
            setAriaExpanded(eGui, false);
            pointer.appendChild(createIconNoSpan(iconName, this.gridOptionsService));
        }
        eGui.appendChild(pointer);
    };
    AgMenuItemRenderer.prototype.getClassName = function (suffix) {
        return "".concat(this.cssClassPrefix, "-").concat(suffix);
    };
    AgMenuItemRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return AgMenuItemRenderer;
}(Component));
export { AgMenuItemRenderer };
