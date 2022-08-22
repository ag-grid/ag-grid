/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("./component");
const componentAnnotations_1 = require("./componentAnnotations");
const context_1 = require("../context/context");
const icon_1 = require("../utils/icon");
const dom_1 = require("../utils/dom");
const keyCode_1 = require("../constants/keyCode");
const aria_1 = require("../utils/aria");
class AgGroupComponent extends component_1.Component {
    constructor(params = {}) {
        super(AgGroupComponent.getTemplate(params));
        this.suppressEnabledCheckbox = true;
        this.suppressOpenCloseIcons = false;
        const { title, enabled, items, suppressEnabledCheckbox, suppressOpenCloseIcons } = params;
        this.title = title;
        this.cssIdentifier = params.cssIdentifier || 'default';
        this.enabled = enabled != null ? enabled : true;
        this.items = items || [];
        this.alignItems = params.alignItems || 'center';
        if (suppressEnabledCheckbox != null) {
            this.suppressEnabledCheckbox = suppressEnabledCheckbox;
        }
        if (suppressOpenCloseIcons != null) {
            this.suppressOpenCloseIcons = suppressOpenCloseIcons;
        }
    }
    static getTemplate(params) {
        const cssIdentifier = params.cssIdentifier || 'default';
        const direction = params.direction || 'vertical';
        return /* html */ `<div class="ag-group ag-${cssIdentifier}-group" role="presentation">
            <div class="ag-group-title-bar ag-${cssIdentifier}-group-title-bar ag-unselectable" ref="eTitleBar" role="button">
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupOpenedIcon" role="presentation"></span>
                <span class="ag-group-title-bar-icon ag-${cssIdentifier}-group-title-bar-icon" ref="eGroupClosedIcon" role="presentation"></span>
                <span ref="eTitle" class="ag-group-title ag-${cssIdentifier}-group-title"></span>
            </div>
            <div ref="eToolbar" class="ag-group-toolbar ag-${cssIdentifier}-group-toolbar">
                <ag-checkbox ref="cbGroupEnabled"></ag-checkbox>
            </div>
            <div ref="eContainer" class="ag-group-container ag-group-container-${direction} ag-${cssIdentifier}-group-container"></div>
        </div>`;
    }
    postConstruct() {
        if (this.items.length) {
            const initialItems = this.items;
            this.items = [];
            this.addItems(initialItems);
        }
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.cbGroupEnabled.setLabel(localeTextFunc('enabled', 'Enabled'));
        if (this.title) {
            this.setTitle(this.title);
        }
        if (this.enabled) {
            this.setEnabled(this.enabled);
        }
        this.setAlignItems(this.alignItems);
        this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        this.hideOpenCloseIcons(this.suppressOpenCloseIcons);
        this.setupExpandContract();
        this.refreshAriaStatus();
        this.refreshChildDisplay();
    }
    setupExpandContract() {
        this.eGroupClosedIcon.appendChild(icon_1.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(icon_1.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addManagedListener(this.eTitleBar, 'click', () => this.toggleGroupExpand());
        this.addManagedListener(this.eTitleBar, 'keydown', (e) => {
            switch (e.key) {
                case keyCode_1.KeyCode.ENTER:
                case keyCode_1.KeyCode.SPACE:
                    e.preventDefault();
                    this.toggleGroupExpand();
                    break;
                case keyCode_1.KeyCode.RIGHT:
                case keyCode_1.KeyCode.LEFT:
                    e.preventDefault();
                    this.toggleGroupExpand(e.key === keyCode_1.KeyCode.RIGHT);
                    break;
            }
        });
    }
    refreshAriaStatus() {
        if (!this.suppressOpenCloseIcons) {
            aria_1.setAriaExpanded(this.eTitleBar, this.expanded);
        }
    }
    refreshChildDisplay() {
        const showIcon = !this.suppressOpenCloseIcons;
        dom_1.setDisplayed(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
        dom_1.setDisplayed(this.eGroupOpenedIcon, showIcon && this.expanded);
        dom_1.setDisplayed(this.eGroupClosedIcon, showIcon && !this.expanded);
    }
    isExpanded() {
        return this.expanded;
    }
    setAlignItems(alignment) {
        if (this.alignItems !== alignment) {
            this.removeCssClass(`ag-group-item-alignment-${this.alignItems}`);
        }
        this.alignItems = alignment;
        const newCls = `ag-group-item-alignment-${this.alignItems}`;
        this.addCssClass(newCls);
        return this;
    }
    toggleGroupExpand(expanded) {
        if (this.suppressOpenCloseIcons) {
            this.expanded = true;
            this.refreshChildDisplay();
            dom_1.setDisplayed(this.eContainer, true);
            return this;
        }
        expanded = expanded != null ? expanded : !this.expanded;
        if (this.expanded === expanded) {
            return this;
        }
        this.expanded = expanded;
        this.refreshAriaStatus();
        this.refreshChildDisplay();
        dom_1.setDisplayed(this.eContainer, expanded);
        this.dispatchEvent({ type: this.expanded ? AgGroupComponent.EVENT_EXPANDED : AgGroupComponent.EVENT_COLLAPSED });
        return this;
    }
    addItems(items) {
        items.forEach(item => this.addItem(item));
    }
    addItem(item) {
        const container = this.eContainer;
        const el = item instanceof component_1.Component ? item.getGui() : item;
        el.classList.add('ag-group-item', `ag-${this.cssIdentifier}-group-item`);
        container.appendChild(el);
        this.items.push(el);
    }
    hideItem(hide, index) {
        const itemToHide = this.items[index];
        itemToHide.classList.toggle('ag-hidden', hide);
    }
    setTitle(title) {
        this.eTitle.innerText = title;
        return this;
    }
    addCssClassToTitleBar(cssClass) {
        this.eTitleBar.classList.add(cssClass);
    }
    setEnabled(enabled, skipToggle) {
        this.enabled = enabled;
        this.refreshDisabledStyles();
        this.toggleGroupExpand(enabled);
        if (!skipToggle) {
            this.cbGroupEnabled.setValue(enabled);
        }
        return this;
    }
    isEnabled() {
        return this.enabled;
    }
    onEnableChange(callbackFn) {
        this.cbGroupEnabled.onValueChange((newSelection) => {
            this.setEnabled(newSelection, true);
            callbackFn(newSelection);
        });
        return this;
    }
    hideEnabledCheckbox(hide) {
        this.suppressEnabledCheckbox = hide;
        this.refreshChildDisplay();
        this.refreshDisabledStyles();
        return this;
    }
    hideOpenCloseIcons(hide) {
        this.suppressOpenCloseIcons = hide;
        if (hide) {
            this.toggleGroupExpand(true);
        }
        return this;
    }
    refreshDisabledStyles() {
        this.addOrRemoveCssClass('ag-disabled', !this.enabled);
        if (this.suppressEnabledCheckbox && !this.enabled) {
            this.eTitleBar.classList.add('ag-disabled-group-title-bar');
            this.eTitleBar.removeAttribute('tabindex');
        }
        else {
            this.eTitleBar.classList.remove('ag-disabled-group-title-bar');
            this.eTitleBar.setAttribute('tabindex', '0');
        }
        this.eContainer.classList.toggle('ag-disabled-group-container', !this.enabled);
    }
}
AgGroupComponent.EVENT_EXPANDED = 'expanded';
AgGroupComponent.EVENT_COLLAPSED = 'collapsed';
__decorate([
    componentAnnotations_1.RefSelector('eTitleBar')
], AgGroupComponent.prototype, "eTitleBar", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eGroupOpenedIcon')
], AgGroupComponent.prototype, "eGroupOpenedIcon", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eGroupClosedIcon')
], AgGroupComponent.prototype, "eGroupClosedIcon", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eToolbar')
], AgGroupComponent.prototype, "eToolbar", void 0);
__decorate([
    componentAnnotations_1.RefSelector('cbGroupEnabled')
], AgGroupComponent.prototype, "cbGroupEnabled", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eTitle')
], AgGroupComponent.prototype, "eTitle", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eContainer')
], AgGroupComponent.prototype, "eContainer", void 0);
__decorate([
    context_1.PostConstruct
], AgGroupComponent.prototype, "postConstruct", null);
exports.AgGroupComponent = AgGroupComponent;
