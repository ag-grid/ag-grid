/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var component_1 = require("./component");
var positionable_1 = require("../rendering/mixins/positionable");
var utils_1 = require("../utils");
var AgPanel = /** @class */ (function (_super) {
    __extends(AgPanel, _super);
    function AgPanel(config) {
        var _this = _super.call(this, AgPanel.TEMPLATE) || this;
        _this.closable = true;
        _this.config = config;
        return _this;
    }
    AgPanel.prototype.postConstruct = function () {
        var _this = this;
        var _a = this.config, component = _a.component, closable = _a.closable, hideTitleBar = _a.hideTitleBar, title = _a.title;
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
            utils_1._.addCssClass(this.eTitleBar, 'ag-hidden');
        }
        this.addDestroyableEventListener(this.eTitleBar, 'mousedown', function (e) {
            if (eGui.contains(e.relatedTarget) ||
                eGui.contains(document.activeElement) ||
                _this.eTitleBarButtons.contains(e.target)) {
                e.preventDefault();
                return;
            }
            var focusEl = _this.eContentWrapper.querySelector('button, [href], input, select, textarea, [tabindex]');
            if (focusEl) {
                focusEl.focus();
            }
        });
        _super.prototype.postConstruct.call(this);
        this.eContentWrapper.style.height = '0';
    };
    //  used by the Positionable Mixin
    AgPanel.prototype.renderComponent = function () {
        var _this = this;
        var eGui = this.getGui();
        eGui.focus();
        this.close = function () {
            eGui.parentElement.removeChild(eGui);
            _this.destroy();
        };
    };
    AgPanel.prototype.setClosable = function (closable) {
        if (closable !== this.closable) {
            this.closable = closable;
        }
        if (closable) {
            var closeButtonComp = this.closeButtonComp = new component_1.Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().wireBean(closeButtonComp);
            var eGui = closeButtonComp.getGui();
            eGui.appendChild(utils_1._.createIconNoSpan('close', this.gridOptionsWrapper));
            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addDestroyableEventListener(eGui, 'click', this.onBtClose.bind(this));
        }
        else if (this.closeButtonComp) {
            var eGui = this.closeButtonComp.getGui();
            eGui.parentElement.removeChild(eGui);
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
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
        var eGui = button.getGui();
        utils_1._.addCssClass(eGui, 'ag-button');
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
        return utils_1._.getInnerHeight(this.eContentWrapper);
    };
    AgPanel.prototype.getBodyWidth = function () {
        return utils_1._.getInnerWidth(this.eContentWrapper);
    };
    AgPanel.prototype.setTitle = function (title) {
        this.eTitle.innerText = title;
    };
    // called when user hits the 'x' in the top right
    AgPanel.prototype.onBtClose = function () {
        this.close();
    };
    AgPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.closeButtonComp) {
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
        }
        var eGui = this.getGui();
        if (eGui && eGui.offsetParent) {
            this.close();
        }
    };
    AgPanel.TEMPLATE = "<div class=\"ag-panel\" tabindex=\"-1\">\n            <div ref=\"eTitleBar\" class=\"ag-title-bar ag-unselectable\">\n                <span ref=\"eTitle\" class=\"ag-title-bar-title\"></span>\n                <div ref=\"eTitleBarButtons\" class=\"ag-title-bar-buttons\"></div>\n            </div>\n            <div ref=\"eContentWrapper\" class=\"ag-panel-content-wrapper\"></div>\n        </div>";
    AgPanel.CLOSE_BTN_TEMPLATE = "<div class=\"ag-button\"></div>";
    __decorate([
        componentAnnotations_1.RefSelector('eContentWrapper'),
        __metadata("design:type", HTMLElement)
    ], AgPanel.prototype, "eContentWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitleBar'),
        __metadata("design:type", HTMLElement)
    ], AgPanel.prototype, "eTitleBar", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitleBarButtons'),
        __metadata("design:type", HTMLElement)
    ], AgPanel.prototype, "eTitleBarButtons", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitle'),
        __metadata("design:type", HTMLElement)
    ], AgPanel.prototype, "eTitle", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgPanel.prototype, "postConstruct", null);
    return AgPanel;
}(positionable_1.Positionable(component_1.Component)));
exports.AgPanel = AgPanel;
