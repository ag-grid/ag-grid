/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { getInnerHeight, getInnerWidth } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
import { PositionableFeature } from "../rendering/features/positionableFeature";
export class AgPanel extends Component {
    constructor(config) {
        super(AgPanel.getTemplate(config));
        this.closable = true;
        this.config = config;
    }
    static getTemplate(config) {
        const cssIdentifier = (config && config.cssIdentifier) || 'default';
        return /* html */ `<div class="ag-panel ag-${cssIdentifier}-panel" tabindex="-1">
            <div ref="eTitleBar" class="ag-panel-title-bar ag-${cssIdentifier}-panel-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-panel-title-bar-title ag-${cssIdentifier}-panel-title-bar-title"></span>
                <div ref="eTitleBarButtons" class="ag-panel-title-bar-buttons ag-${cssIdentifier}-panel-title-bar-buttons"></div>
            </div>
            <div ref="eContentWrapper" class="ag-panel-content-wrapper ag-${cssIdentifier}-panel-content-wrapper"></div>
        </div>`;
    }
    postConstruct() {
        const { component, closable, hideTitleBar, title, minWidth = 250, width, minHeight = 250, height, centered, popup, x, y } = this.config;
        this.positionableFeature = new PositionableFeature(this.getGui(), {
            minWidth, width, minHeight, height, centered, x, y, popup,
            calculateTopBuffer: () => this.positionableFeature.getHeight() - this.getBodyHeight()
        });
        this.createManagedBean(this.positionableFeature);
        const eGui = this.getGui();
        if (component) {
            this.setBodyComponent(component);
        }
        if (!hideTitleBar) {
            if (title) {
                this.setTitle(title);
            }
            this.setClosable(closable != null ? closable : this.closable);
        }
        else {
            this.eTitleBar.classList.add('ag-hidden');
        }
        this.addManagedListener(this.eTitleBar, 'mousedown', (e) => {
            const eDocument = this.gridOptionsWrapper.getDocument();
            if (eGui.contains(e.relatedTarget) ||
                eGui.contains(eDocument.activeElement) ||
                this.eTitleBarButtons.contains(e.target)) {
                e.preventDefault();
                return;
            }
            const focusEl = this.eContentWrapper.querySelector('button, [href], input, select, textarea, [tabindex]');
            if (focusEl) {
                focusEl.focus();
            }
        });
        if (popup && this.positionableFeature.isPositioned()) {
            return;
        }
        if (this.renderComponent) {
            this.renderComponent();
        }
        this.positionableFeature.initialisePosition();
        this.eContentWrapper.style.height = '0';
    }
    renderComponent() {
        const eGui = this.getGui();
        eGui.focus();
        this.close = () => {
            eGui.parentElement.removeChild(eGui);
            this.destroy();
        };
    }
    getHeight() {
        return this.positionableFeature.getHeight();
    }
    setHeight(height) {
        this.positionableFeature.setHeight(height);
    }
    getWidth() {
        return this.positionableFeature.getWidth();
    }
    setWidth(width) {
        this.positionableFeature.setWidth(width);
    }
    setClosable(closable) {
        if (closable !== this.closable) {
            this.closable = closable;
        }
        if (closable) {
            const closeButtonComp = this.closeButtonComp = new Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().createBean(closeButtonComp);
            const eGui = closeButtonComp.getGui();
            const child = createIconNoSpan('close', this.gridOptionsWrapper);
            child.classList.add('ag-panel-title-bar-button-icon');
            eGui.appendChild(child);
            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addManagedListener(eGui, 'click', this.onBtClose.bind(this));
        }
        else if (this.closeButtonComp) {
            const eGui = this.closeButtonComp.getGui();
            eGui.parentElement.removeChild(eGui);
            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
        }
    }
    setBodyComponent(bodyComponent) {
        bodyComponent.setParentComponent(this);
        this.eContentWrapper.appendChild(bodyComponent.getGui());
    }
    addTitleBarButton(button, position) {
        const eTitleBarButtons = this.eTitleBarButtons;
        const buttons = eTitleBarButtons.children;
        const len = buttons.length;
        if (position == null) {
            position = len;
        }
        position = Math.max(0, Math.min(position, len));
        button.addCssClass('ag-panel-title-bar-button');
        const eGui = button.getGui();
        if (position === 0) {
            eTitleBarButtons.insertAdjacentElement('afterbegin', eGui);
        }
        else if (position === len) {
            eTitleBarButtons.insertAdjacentElement('beforeend', eGui);
        }
        else {
            buttons[position - 1].insertAdjacentElement('afterend', eGui);
        }
        button.setParentComponent(this);
    }
    getBodyHeight() {
        return getInnerHeight(this.eContentWrapper);
    }
    getBodyWidth() {
        return getInnerWidth(this.eContentWrapper);
    }
    setTitle(title) {
        this.eTitle.innerText = title;
    }
    // called when user hits the 'x' in the top right
    onBtClose() {
        this.close();
    }
    destroy() {
        if (this.closeButtonComp) {
            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
        }
        const eGui = this.getGui();
        if (eGui && eGui.offsetParent) {
            this.close();
        }
        super.destroy();
    }
}
AgPanel.CLOSE_BTN_TEMPLATE = `<div class="ag-button"></div>`;
__decorate([
    RefSelector('eContentWrapper')
], AgPanel.prototype, "eContentWrapper", void 0);
__decorate([
    RefSelector('eTitleBar')
], AgPanel.prototype, "eTitleBar", void 0);
__decorate([
    RefSelector('eTitleBarButtons')
], AgPanel.prototype, "eTitleBarButtons", void 0);
__decorate([
    RefSelector('eTitle')
], AgPanel.prototype, "eTitle", void 0);
__decorate([
    PostConstruct
], AgPanel.prototype, "postConstruct", null);
