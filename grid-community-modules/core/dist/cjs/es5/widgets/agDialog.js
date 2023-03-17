/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgDialog = void 0;
var context_1 = require("../context/context");
var agPanel_1 = require("./agPanel");
var component_1 = require("./component");
var dom_1 = require("../utils/dom");
var icon_1 = require("../utils/icon");
var AgDialog = /** @class */ (function (_super) {
    __extends(AgDialog, _super);
    function AgDialog(config) {
        var _this = _super.call(this, __assign(__assign({}, config), { popup: true })) || this;
        _this.isMaximizable = false;
        _this.isMaximized = false;
        _this.maximizeListeners = [];
        _this.resizeListenerDestroy = null;
        _this.lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        return _this;
    }
    AgDialog.prototype.postConstruct = function () {
        var _this = this;
        var eGui = this.getGui();
        var _a = this.config, movable = _a.movable, resizable = _a.resizable, maximizable = _a.maximizable;
        this.addCssClass('ag-dialog');
        _super.prototype.postConstruct.call(this);
        this.addManagedListener(eGui, 'focusin', function (e) {
            if (eGui.contains(e.relatedTarget)) {
                return;
            }
            _this.popupService.bringPopupToFront(eGui);
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
    };
    AgDialog.prototype.renderComponent = function () {
        var eGui = this.getGui();
        var _a = this.config, alwaysOnTop = _a.alwaysOnTop, modal = _a.modal, title = _a.title;
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.destroy.bind(this),
            alwaysOnTop: alwaysOnTop,
            ariaLabel: title || translate('ariaLabelDialog', 'Dialog')
        });
        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
    };
    AgDialog.prototype.toggleMaximize = function () {
        var position = this.positionableFeature.getPosition();
        if (this.isMaximized) {
            var _a = this.lastPosition, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
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
    };
    AgDialog.prototype.refreshMaximizeIcon = function () {
        dom_1.setDisplayed(this.maximizeIcon, !this.isMaximized);
        dom_1.setDisplayed(this.minimizeIcon, this.isMaximized);
    };
    AgDialog.prototype.clearMaximizebleListeners = function () {
        if (this.maximizeListeners.length) {
            this.maximizeListeners.forEach(function (destroyListener) { return destroyListener(); });
            this.maximizeListeners.length = 0;
        }
        if (this.resizeListenerDestroy) {
            this.resizeListenerDestroy();
            this.resizeListenerDestroy = null;
        }
    };
    AgDialog.prototype.destroy = function () {
        this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);
        this.clearMaximizebleListeners();
        _super.prototype.destroy.call(this);
    };
    AgDialog.prototype.setResizable = function (resizable) {
        this.positionableFeature.setResizable(resizable);
    };
    AgDialog.prototype.setMovable = function (movable) {
        this.positionableFeature.setMovable(movable, this.eTitleBar);
    };
    AgDialog.prototype.setMaximizable = function (maximizable) {
        var _this = this;
        if (!maximizable) {
            this.clearMaximizebleListeners();
            if (this.maximizeButtonComp) {
                this.destroyBean(this.maximizeButtonComp);
                this.maximizeButtonComp = this.maximizeIcon = this.minimizeIcon = undefined;
            }
            return;
        }
        var eTitleBar = this.eTitleBar;
        if (!eTitleBar || maximizable === this.isMaximizable) {
            return;
        }
        var maximizeButtonComp = this.buildMaximizeAndMinimizeElements();
        this.refreshMaximizeIcon();
        maximizeButtonComp.addManagedListener(maximizeButtonComp.getGui(), 'click', this.toggleMaximize.bind(this));
        this.addTitleBarButton(maximizeButtonComp, 0);
        this.maximizeListeners.push(this.addManagedListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this)));
        this.resizeListenerDestroy = this.addManagedListener(this, 'resize', function () {
            _this.isMaximized = false;
            _this.refreshMaximizeIcon();
        });
    };
    AgDialog.prototype.buildMaximizeAndMinimizeElements = function () {
        var maximizeButtonComp = this.maximizeButtonComp =
            this.createBean(new component_1.Component(/* html */ "<div class=\"ag-dialog-button\"></span>"));
        var eGui = maximizeButtonComp.getGui();
        this.maximizeIcon = icon_1.createIconNoSpan('maximize', this.gridOptionsService);
        eGui.appendChild(this.maximizeIcon);
        this.maximizeIcon.classList.add('ag-panel-title-bar-button-icon');
        this.minimizeIcon = icon_1.createIconNoSpan('minimize', this.gridOptionsService);
        eGui.appendChild(this.minimizeIcon);
        this.minimizeIcon.classList.add('ag-panel-title-bar-button-icon');
        return maximizeButtonComp;
    };
    __decorate([
        context_1.Autowired('popupService')
    ], AgDialog.prototype, "popupService", void 0);
    return AgDialog;
}(agPanel_1.AgPanel));
exports.AgDialog = AgDialog;
