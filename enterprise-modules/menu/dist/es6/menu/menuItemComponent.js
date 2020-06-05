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
import { Autowired, Component, Constants, PostConstruct, RefSelector, TooltipFeature, _ } from "@ag-grid-community/core";
var MenuItemComponent = /** @class */ (function (_super) {
    __extends(MenuItemComponent, _super);
    function MenuItemComponent(params) {
        var _this = _super.call(this, MenuItemComponent.TEMPLATE) || this;
        _this.params = params;
        return _this;
    }
    MenuItemComponent.prototype.init = function () {
        var _this = this;
        if (this.params.checked) {
            this.eIcon.appendChild(_.createIconNoSpan('check', this.gridOptionsWrapper));
        }
        else if (this.params.icon) {
            if (_.isNodeOrElement(this.params.icon)) {
                this.eIcon.appendChild(this.params.icon);
            }
            else if (typeof this.params.icon === 'string') {
                this.eIcon.innerHTML = this.params.icon;
            }
            else {
                console.warn('ag-Grid: menu item icon must be DOM node or string');
            }
        }
        else {
            // if i didn't put space here, the alignment was messed up, probably
            // fixable with CSS but i was spending to much time trying to figure
            // it out.
            this.eIcon.innerHTML = '&nbsp;';
        }
        if (this.params.tooltip) {
            this.tooltip = this.params.tooltip;
            if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
                this.getGui().setAttribute('title', this.tooltip);
            }
            else {
                this.createManagedBean(new TooltipFeature(this, 'menu'));
            }
        }
        if (this.params.shortcut) {
            this.eShortcut.innerHTML = this.params.shortcut;
        }
        if (this.params.subMenu) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                // for RTL, we show arrow going left
                this.ePopupPointer.appendChild(_.createIconNoSpan('smallLeft', this.gridOptionsWrapper));
            }
            else {
                // for normal, we show arrow going right
                this.ePopupPointer.appendChild(_.createIconNoSpan('smallRight', this.gridOptionsWrapper));
            }
        }
        else {
            this.ePopupPointer.innerHTML = '&nbsp;';
        }
        this.eName.innerHTML = this.params.name;
        if (this.params.disabled) {
            _.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        }
        else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
            this.addGuiEventListener('keydown', function (e) {
                if (e.keyCode === Constants.KEY_ENTER || e.keyCode === Constants.KEY_SPACE) {
                    _this.onOptionSelected(e);
                }
            });
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(function (it) { return _.addCssClass(_this.getGui(), it); });
        }
    };
    MenuItemComponent.prototype.getTooltipText = function () {
        return this.tooltip;
    };
    MenuItemComponent.prototype.getComponentHolder = function () {
        return undefined;
    };
    MenuItemComponent.prototype.onOptionSelected = function (event) {
        var e = {
            type: MenuItemComponent.EVENT_ITEM_SELECTED,
            action: this.params.action,
            checked: this.params.checked,
            cssClasses: this.params.cssClasses,
            disabled: this.params.disabled,
            icon: this.params.icon,
            name: this.params.name,
            shortcut: this.params.shortcut,
            subMenu: this.params.subMenu,
            tooltip: this.params.tooltip,
            event: event
        };
        this.dispatchEvent(e);
        if (this.params.action) {
            this.params.action();
        }
    };
    MenuItemComponent.prototype.destroy = function () {
        // console.log('MenuItemComponent->destroy() ' + this.instance);
        _super.prototype.destroy.call(this);
    };
    // private instance = Math.random();
    MenuItemComponent.TEMPLATE = "<div class=\"ag-menu-option\" tabindex=\"-1\">\n            <span ref=\"eIcon\" class=\"ag-menu-option-icon ag-menu-option-part\"></span>\n            <span ref=\"eName\" class=\"ag-menu-option-text ag-menu-option-part\"></span>\n            <span ref=\"eShortcut\" class=\"ag-menu-option-shortcut ag-menu-option-part\"></span>\n            <span ref=\"ePopupPointer\" class=\"ag-menu-option-popup-pointer ag-menu-option-part\"></span>\n        </div>";
    MenuItemComponent.EVENT_ITEM_SELECTED = 'itemSelected';
    __decorate([
        Autowired('gridOptionsWrapper')
    ], MenuItemComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        RefSelector('eIcon')
    ], MenuItemComponent.prototype, "eIcon", void 0);
    __decorate([
        RefSelector('eName')
    ], MenuItemComponent.prototype, "eName", void 0);
    __decorate([
        RefSelector('eShortcut')
    ], MenuItemComponent.prototype, "eShortcut", void 0);
    __decorate([
        RefSelector('ePopupPointer')
    ], MenuItemComponent.prototype, "ePopupPointer", void 0);
    __decorate([
        PostConstruct
    ], MenuItemComponent.prototype, "init", null);
    return MenuItemComponent;
}(Component));
export { MenuItemComponent };
