/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const context_1 = require("../context/context");
const agPanel_1 = require("./agPanel");
const component_1 = require("./component");
const dom_1 = require("../utils/dom");
const icon_1 = require("../utils/icon");
class AgDialog extends agPanel_1.AgPanel {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { popup: true }));
        this.isMaximizable = false;
        this.isMaximized = false;
        this.maximizeListeners = [];
        this.resizeListenerDestroy = null;
        this.lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }
    postConstruct() {
        const eGui = this.getGui();
        const { movable, resizable, maximizable } = this.config;
        this.addCssClass('ag-dialog');
        super.postConstruct();
        this.addManagedListener(eGui, 'focusin', (e) => {
            if (eGui.contains(e.relatedTarget)) {
                return;
            }
            this.popupService.bringPopupToFront(eGui);
        });
        if (movable) {
            this.setMovable(movable);
        }
        if (maximizable) {
            this.setMaximizable(maximizable);
        }
        if (resizable) {
            this.setResizable(resizable);
        }
    }
    renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal, title } = this.config;
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.destroy.bind(this),
            alwaysOnTop,
            ariaLabel: title || translate('ariaLabelDialog', 'Dialog')
        });
        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
    }
    toggleMaximize() {
        const position = this.positionableFeature.getPosition();
        if (this.isMaximized) {
            const { x, y, width, height } = this.lastPosition;
            this.setWidth(width);
            this.setHeight(height);
            this.positionableFeature.offsetElement(x, y);
        }
        else {
            this.lastPosition.width = this.getWidth();
            this.lastPosition.height = this.getHeight();
            this.lastPosition.x = position.x;
            this.lastPosition.y = position.y;
            this.positionableFeature.offsetElement(0, 0);
            this.setHeight('100%');
            this.setWidth('100%');
        }
        this.isMaximized = !this.isMaximized;
        this.refreshMaximizeIcon();
    }
    refreshMaximizeIcon() {
        dom_1.setDisplayed(this.maximizeIcon, !this.isMaximized);
        dom_1.setDisplayed(this.minimizeIcon, this.isMaximized);
    }
    clearMaximizebleListeners() {
        if (this.maximizeListeners.length) {
            this.maximizeListeners.forEach(destroyListener => destroyListener());
            this.maximizeListeners.length = 0;
        }
        if (this.resizeListenerDestroy) {
            this.resizeListenerDestroy();
            this.resizeListenerDestroy = null;
        }
    }
    destroy() {
        this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);
        this.clearMaximizebleListeners();
        super.destroy();
    }
    setResizable(resizable) {
        this.positionableFeature.setResizable(resizable);
    }
    setMovable(movable) {
        this.positionableFeature.setMovable(movable, this.eTitleBar);
    }
    setMaximizable(maximizable) {
        if (!maximizable) {
            this.clearMaximizebleListeners();
            if (this.maximizeButtonComp) {
                this.destroyBean(this.maximizeButtonComp);
                this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
            }
            return;
        }
        const eTitleBar = this.eTitleBar;
        if (!eTitleBar || maximizable === this.isMaximizable) {
            return;
        }
        const maximizeButtonComp = this.maximizeButtonComp =
            this.createBean(new component_1.Component(/* html */ `<div class="ag-dialog-button"></span>`));
        const eGui = maximizeButtonComp.getGui();
        eGui.appendChild(this.maximizeIcon = icon_1.createIconNoSpan('maximize', this.gridOptionsWrapper));
        this.maximizeIcon.classList.add('ag-panel-title-bar-button-icon');
        eGui.appendChild(this.minimizeIcon = icon_1.createIconNoSpan('minimize', this.gridOptionsWrapper));
        this.minimizeIcon.classList.add('ag-panel-title-bar-button-icon', 'ag-hidden');
        maximizeButtonComp.addManagedListener(eGui, 'click', this.toggleMaximize.bind(this));
        this.addTitleBarButton(maximizeButtonComp, 0);
        this.maximizeListeners.push(this.addManagedListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this)));
        this.resizeListenerDestroy = this.addManagedListener(this, 'resize', () => {
            this.isMaximized = false;
            this.refreshMaximizeIcon();
        });
    }
}
__decorate([
    context_1.Autowired('popupService')
], AgDialog.prototype, "popupService", void 0);
exports.AgDialog = AgDialog;
