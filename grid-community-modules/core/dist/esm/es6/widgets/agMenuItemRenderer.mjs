import { Component } from './component.mjs';
import { createIconNoSpan } from '../utils/icon.mjs';
import { isNodeOrElement, loadTemplate } from '../utils/dom.mjs';
import { setAriaExpanded } from '../utils/aria.mjs';
export class AgMenuItemRenderer extends Component {
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
        const icon = loadTemplate(/* html */ `<span ref="eIcon" class="${this.getClassName('part')} ${this.getClassName('icon')}" role="presentation"></span>`);
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
    }
    addName() {
        const name = loadTemplate(/* html */ `<span ref="eName" class="${this.getClassName('part')} ${this.getClassName('text')}">${this.params.name || ''}</span>`);
        this.getGui().appendChild(name);
    }
    addShortcut() {
        if (this.params.isCompact) {
            return;
        }
        const shortcut = loadTemplate(/* html */ `<span ref="eShortcut" class="${this.getClassName('part')} ${this.getClassName('shortcut')}">${this.params.shortcut || ''}</span>`);
        this.getGui().appendChild(shortcut);
    }
    addSubMenu() {
        const pointer = loadTemplate(/* html */ `<span ref="ePopupPointer" class="${this.getClassName('part')} ${this.getClassName('popup-pointer')}"></span>`);
        const eGui = this.getGui();
        if (this.params.subMenu) {
            const iconName = this.gridOptionsService.get('enableRtl') ? 'smallLeft' : 'smallRight';
            setAriaExpanded(eGui, false);
            pointer.appendChild(createIconNoSpan(iconName, this.gridOptionsService));
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
