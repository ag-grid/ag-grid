/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var popupService_1 = require("./popupService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var AgPanel = /** @class */ (function (_super) {
    __extends(AgPanel, _super);
    function AgPanel(config) {
        var _this = _super.call(this, AgPanel.TEMPLATE) || this;
        _this.closable = true;
        _this.positioned = false;
        _this.dragStartPosition = {
            x: 0,
            y: 0
        };
        _this.position = {
            x: 0,
            y: 0
        };
        _this.size = {
            width: undefined,
            height: undefined
        };
        _this.config = config;
        return _this;
    }
    AgPanel.prototype.postConstruct = function () {
        var _this = this;
        var _a = this.config, component = _a.component, closable = _a.closable, hideTitleBar = _a.hideTitleBar, title = _a.title, minWidth = _a.minWidth, width = _a.width, minHeight = _a.minHeight, height = _a.height, centered = _a.centered, x = _a.x, y = _a.y;
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
        if (this.positioned) {
            return;
        }
        this.minHeight = minHeight != null ? minHeight : 250;
        this.minWidth = minWidth != null ? minWidth : 250;
        this.popupParent = this.popupService.getPopupParent();
        if (width) {
            this.setWidth(width);
        }
        if (height) {
            this.setHeight(height);
        }
        if (this.renderComponent) {
            this.renderComponent();
        }
        if (!width || !height) {
            this.refreshSize();
        }
        if (centered) {
            this.center();
        }
        else if (x || y) {
            this.offsetElement(x, y);
        }
        this.positioned = true;
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
    AgPanel.prototype.updateDragStartPosition = function (x, y) {
        this.dragStartPosition = { x: x, y: y };
    };
    AgPanel.prototype.calculateMouseMovement = function (params) {
        var parentRect = this.popupParent.getBoundingClientRect();
        var e = params.e, isLeft = params.isLeft, isTop = params.isTop, anywhereWithin = params.anywhereWithin, topBuffer = params.topBuffer;
        var movementX = e.clientX - this.dragStartPosition.x;
        var movementY = e.clientY - this.dragStartPosition.y;
        var width = this.getWidth();
        var height = this.getHeight();
        // skip if cursor is outside of popupParent horizontally
        var skipX = (parentRect.left >= e.clientX && this.position.x <= 0 ||
            parentRect.right <= e.clientX && parentRect.right <= this.position.x + parentRect.left + width);
        if (!skipX) {
            if (isLeft) {
                skipX = (
                // skip if we are moving to the left and the cursor
                // is positioned to the right of the left side anchor
                (movementX < 0 && e.clientX > this.position.x + parentRect.left) ||
                    // skip if we are moving to the right and the cursor
                    // is positioned to the left of the dialog
                    (movementX > 0 && e.clientX < this.position.x + parentRect.left));
            }
            else {
                if (anywhereWithin) {
                    // if anywhereWithin is true, we allow to move
                    // as long as the cursor is within the dialog
                    skipX = ((movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left));
                }
                else {
                    skipX = (
                    // if the movement is bound to the right side of the dialog
                    // we skip if we are moving to the left and the cursor
                    // is to the right of the dialog
                    (movementX < 0 && e.clientX > this.position.x + parentRect.left + width) ||
                        // or skip if we are moving to the right and the cursor
                        // is to the left of the right side anchor
                        (movementX > 0 && e.clientX < this.position.x + parentRect.left + width));
                }
            }
        }
        movementX = skipX ? 0 : movementX;
        var skipY = (
        // skip if cursor is outside of popupParent vertically
        parentRect.top >= e.clientY && this.position.y <= 0 ||
            parentRect.bottom <= e.clientY && parentRect.bottom <= this.position.y + parentRect.top + height ||
            isTop && (
            // skip if we are moving to towards top and the cursor is
            // below the top anchor + topBuffer
            // note: topBuffer is used when moving the dialog using the title bar
            (movementY < 0 && e.clientY > this.position.y + parentRect.top + (topBuffer || 0)) ||
                // skip if we are moving to the bottom and the cursor is
                // above the top anchor
                (movementY > 0 && e.clientY < this.position.y + parentRect.top)) ||
            // we are anchored to the bottom of the dialog
            !isTop && (
            // skip if we are moving towards the top and the cursor
            // is below the bottom anchor
            (movementY < 0 && e.clientY > this.position.y + parentRect.top + height) ||
                // skip if we are moving towards the bottom and the cursor
                // is above the bottom anchor
                (movementY > 0 && e.clientY < this.position.y + parentRect.top + height)));
        movementY = skipY ? 0 : movementY;
        return { movementX: movementX, movementY: movementY };
    };
    AgPanel.prototype.refreshSize = function () {
        var _a = this.size, width = _a.width, height = _a.height;
        if (!width) {
            this.setWidth(this.getGui().offsetWidth);
        }
        if (!height) {
            this.setHeight(this.getGui().offsetHeight);
        }
    };
    AgPanel.prototype.offsetElement = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var ePopup = this.getGui();
        this.popupService.positionPopup({
            ePopup: ePopup,
            x: x,
            y: y,
            minWidth: this.minWidth,
            minHeight: this.minHeight,
            keepWithinBounds: true
        });
        this.position.x = parseInt(ePopup.style.left, 10);
        this.position.y = parseInt(ePopup.style.top, 10);
    };
    AgPanel.prototype.getHeight = function () {
        return this.size.height;
    };
    AgPanel.prototype.setHeight = function (height) {
        var eGui = this.getGui();
        var isPercent = false;
        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            utils_1._.setFixedHeight(eGui, height);
            height = utils_1._.getAbsoluteHeight(eGui);
            isPercent = true;
        }
        else {
            height = Math.max(this.minHeight, height);
            var offsetParent = eGui.offsetParent;
            if (offsetParent && offsetParent.clientHeight && (height + this.position.y > offsetParent.clientHeight)) {
                height = offsetParent.clientHeight - this.position.y;
            }
        }
        if (this.size.height === height) {
            return;
        }
        this.size.height = height;
        if (!isPercent) {
            utils_1._.setFixedHeight(eGui, height);
        }
        else {
            eGui.style.maxHeight = 'unset';
            eGui.style.minHeight = 'unset';
        }
    };
    AgPanel.prototype.getWidth = function () {
        return this.size.width;
    };
    AgPanel.prototype.setWidth = function (width) {
        var eGui = this.getGui();
        var isPercent = false;
        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            utils_1._.setFixedWidth(eGui, width);
            width = utils_1._.getAbsoluteWidth(eGui);
            isPercent = true;
        }
        else {
            width = Math.max(this.minWidth, width);
            var offsetParent = eGui.offsetParent;
            if (offsetParent && offsetParent.clientWidth && (width + this.position.x > offsetParent.clientWidth)) {
                width = offsetParent.clientWidth - this.position.x;
            }
        }
        if (this.size.width === width) {
            return;
        }
        this.size.width = width;
        if (!isPercent) {
            utils_1._.setFixedWidth(eGui, width);
        }
        else {
            eGui.style.maxWidth = 'unset';
            eGui.style.minWidth = 'unset';
        }
    };
    AgPanel.prototype.center = function () {
        var eGui = this.getGui();
        var x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
        var y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);
        this.offsetElement(x, y);
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
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], AgPanel.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AgPanel.prototype, "gridOptionsWrapper", void 0);
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
}(component_1.Component));
exports.AgPanel = AgPanel;
