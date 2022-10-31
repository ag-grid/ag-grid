/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { RefSelector } from "./componentAnnotations";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { getInnerHeight, getInnerWidth } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
import { PositionableFeature } from "../rendering/features/positionableFeature";
var AgPanel = /** @class */ (function (_super) {
    __extends(AgPanel, _super);
    function AgPanel(config) {
        var _this = _super.call(this, AgPanel.getTemplate(config)) || this;
        _this.closable = true;
        _this.config = config;
        return _this;
    }
    AgPanel.getTemplate = function (config) {
        var cssIdentifier = (config && config.cssIdentifier) || 'default';
        return /* html */ "<div class=\"ag-panel ag-" + cssIdentifier + "-panel\" tabindex=\"-1\">\n            <div ref=\"eTitleBar\" class=\"ag-panel-title-bar ag-" + cssIdentifier + "-panel-title-bar ag-unselectable\">\n                <span ref=\"eTitle\" class=\"ag-panel-title-bar-title ag-" + cssIdentifier + "-panel-title-bar-title\"></span>\n                <div ref=\"eTitleBarButtons\" class=\"ag-panel-title-bar-buttons ag-" + cssIdentifier + "-panel-title-bar-buttons\"></div>\n            </div>\n            <div ref=\"eContentWrapper\" class=\"ag-panel-content-wrapper ag-" + cssIdentifier + "-panel-content-wrapper\"></div>\n        </div>";
    };
    AgPanel.prototype.postConstruct = function () {
        var _this = this;
        var _a = this.config, component = _a.component, closable = _a.closable, hideTitleBar = _a.hideTitleBar, title = _a.title, _b = _a.minWidth, minWidth = _b === void 0 ? 250 : _b, width = _a.width, _c = _a.minHeight, minHeight = _c === void 0 ? 250 : _c, height = _a.height, centered = _a.centered, popup = _a.popup, x = _a.x, y = _a.y;
        this.positionableFeature = new PositionableFeature(this.getGui(), {
            minWidth: minWidth, width: width, minHeight: minHeight, height: height, centered: centered, x: x, y: y, popup: popup,
            calculateTopBuffer: function () { return _this.positionableFeature.getHeight() - _this.getBodyHeight(); }
        });
        this.createManagedBean(this.positionableFeature);
        var eGui = this.getGui();
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
        this.addManagedListener(this.eTitleBar, 'mousedown', function (e) {
            var eDocument = _this.gridOptionsWrapper.getDocument();
            if (eGui.contains(e.relatedTarget) ||
                eGui.contains(eDocument.activeElement) ||
                _this.eTitleBarButtons.contains(e.target)) {
                e.preventDefault();
                return;
            }
            var focusEl = _this.eContentWrapper.querySelector('button, [href], input, select, textarea, [tabindex]');
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
    };
    AgPanel.prototype.renderComponent = function () {
        var _this = this;
        var eGui = this.getGui();
        eGui.focus();
        this.close = function () {
            eGui.parentElement.removeChild(eGui);
            _this.destroy();
        };
    };
    AgPanel.prototype.getHeight = function () {
        return this.positionableFeature.getHeight();
    };
    AgPanel.prototype.setHeight = function (height) {
        this.positionableFeature.setHeight(height);
    };
    AgPanel.prototype.getWidth = function () {
        return this.positionableFeature.getWidth();
    };
    AgPanel.prototype.setWidth = function (width) {
        this.positionableFeature.setWidth(width);
    };
    AgPanel.prototype.setClosable = function (closable) {
        if (closable !== this.closable) {
            this.closable = closable;
        }
        if (closable) {
            var closeButtonComp = this.closeButtonComp = new Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().createBean(closeButtonComp);
            var eGui = closeButtonComp.getGui();
            var child = createIconNoSpan('close', this.gridOptionsWrapper);
            child.classList.add('ag-panel-title-bar-button-icon');
            eGui.appendChild(child);
            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addManagedListener(eGui, 'click', this.onBtClose.bind(this));
        }
        else if (this.closeButtonComp) {
            var eGui = this.closeButtonComp.getGui();
            eGui.parentElement.removeChild(eGui);
            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
        }
    };
    AgPanel.prototype.setBodyComponent = function (bodyComponent) {
        bodyComponent.setParentComponent(this);
        this.eContentWrapper.appendChild(bodyComponent.getGui());
    };
    AgPanel.prototype.addTitleBarButton = function (button, position) {
        var eTitleBarButtons = this.eTitleBarButtons;
        var buttons = eTitleBarButtons.children;
        var len = buttons.length;
        if (position == null) {
            position = len;
        }
        position = Math.max(0, Math.min(position, len));
        button.addCssClass('ag-panel-title-bar-button');
        var eGui = button.getGui();
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
    };
    AgPanel.prototype.getBodyHeight = function () {
        return getInnerHeight(this.eContentWrapper);
    };
    AgPanel.prototype.getBodyWidth = function () {
        return getInnerWidth(this.eContentWrapper);
    };
    AgPanel.prototype.setTitle = function (title) {
        this.eTitle.innerText = title;
    };
    // called when user hits the 'x' in the top right
    AgPanel.prototype.onBtClose = function () {
        this.close();
    };
    AgPanel.prototype.destroy = function () {
        if (this.closeButtonComp) {
            this.closeButtonComp = this.destroyBean(this.closeButtonComp);
        }
        var eGui = this.getGui();
        if (eGui && eGui.offsetParent) {
            this.close();
        }
        _super.prototype.destroy.call(this);
    };
    AgPanel.CLOSE_BTN_TEMPLATE = "<div class=\"ag-button\"></div>";
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
    return AgPanel;
}(Component));
export { AgPanel };
