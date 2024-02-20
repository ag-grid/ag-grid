"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgMenuItemRenderer = void 0;
const component_1 = require("./component");
const icon_1 = require("../utils/icon");
const dom_1 = require("../utils/dom");
const aria_1 = require("../utils/aria");
class AgMenuItemRenderer extends component_1.Component {
    constructor() {
        super();
        this.setTemplate(/* html */ `<div></div>`);
    }
    init(params) {
        var _a;
        this.params = params;
        this.cssClassPrefix = (_a = this.params.cssClassPrefix) !== null && _a !== void 0 ? _a : 'ag-menu-option';
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
    }
    configureDefaults() {
        return true;
    }
    addIcon() {
        if (this.params.isCompact) {
            return;
        }
        const icon = (0, dom_1.loadTemplate)(/* html */ `<span ref="eIcon" class="${this.getClassName('part')} ${this.getClassName('icon')}" role="presentation"></span>`);
        if (this.params.checked) {
            icon.appendChild((0, icon_1.createIconNoSpan)('check', this.gridOptionsService));
        }
        else if (this.params.icon) {
            if ((0, dom_1.isNodeOrElement)(this.params.icon)) {
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
    }
    addName() {
        const name = (0, dom_1.loadTemplate)(/* html */ `<span ref="eName" class="${this.getClassName('part')} ${this.getClassName('text')}">${this.params.name || ''}</span>`);
        this.getGui().appendChild(name);
    }
    addShortcut() {
        if (this.params.isCompact) {
            return;
        }
        const shortcut = (0, dom_1.loadTemplate)(/* html */ `<span ref="eShortcut" class="${this.getClassName('part')} ${this.getClassName('shortcut')}">${this.params.shortcut || ''}</span>`);
        this.getGui().appendChild(shortcut);
    }
    addSubMenu() {
        const pointer = (0, dom_1.loadTemplate)(/* html */ `<span ref="ePopupPointer" class="${this.getClassName('part')} ${this.getClassName('popup-pointer')}"></span>`);
        const eGui = this.getGui();
        if (this.params.subMenu) {
            const iconName = this.gridOptionsService.get('enableRtl') ? 'smallLeft' : 'smallRight';
            (0, aria_1.setAriaExpanded)(eGui, false);
            pointer.appendChild((0, icon_1.createIconNoSpan)(iconName, this.gridOptionsService));
        }
        eGui.appendChild(pointer);
    }
    getClassName(suffix) {
        return `${this.cssClassPrefix}-${suffix}`;
    }
    destroy() {
        super.destroy();
    }
}
exports.AgMenuItemRenderer = AgMenuItemRenderer;
