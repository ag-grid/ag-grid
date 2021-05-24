/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
import { PostConstruct, Autowired } from "../context/context";
import { Component } from "./component";
import { addCssClass, setFixedHeight, getAbsoluteHeight, setFixedWidth, getAbsoluteWidth, getInnerHeight, getInnerWidth } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
var AgPanel = /** @class */ (function (_super) {
    __extends(AgPanel, _super);
    function AgPanel(config) {
        var _this = _super.call(this, AgPanel.getTemplate(config)) || this;
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
    AgPanel.getTemplate = function (config) {
        var cssIdentifier = (config && config.cssIdentifier) || 'default';
        return /* html */ "<div class=\"ag-panel ag-" + cssIdentifier + "-panel\" tabindex=\"-1\">\n            <div ref=\"eTitleBar\" class=\"ag-panel-title-bar ag-" + cssIdentifier + "-panel-title-bar ag-unselectable\">\n                <span ref=\"eTitle\" class=\"ag-panel-title-bar-title ag-" + cssIdentifier + "-panel-title-bar-title\"></span>\n                <div ref=\"eTitleBarButtons\" class=\"ag-panel-title-bar-buttons ag-" + cssIdentifier + "-panel-title-bar-buttons\"></div>\n            </div>\n            <div ref=\"eContentWrapper\" class=\"ag-panel-content-wrapper ag-" + cssIdentifier + "-panel-content-wrapper\"></div>\n        </div>";
    };
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
            addCssClass(this.eTitleBar, 'ag-hidden');
        }
        this.addManagedListener(this.eTitleBar, 'mousedown', function (e) {
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
            setFixedHeight(eGui, height);
            height = getAbsoluteHeight(eGui);
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
            setFixedHeight(eGui, height);
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
            setFixedWidth(eGui, width);
            width = getAbsoluteWidth(eGui);
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
            setFixedWidth(eGui, width);
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
            var closeButtonComp = this.closeButtonComp = new Component(AgPanel.CLOSE_BTN_TEMPLATE);
            this.getContext().createBean(closeButtonComp);
            var eGui = closeButtonComp.getGui();
            eGui.appendChild(addCssClass(createIconNoSpan('close', this.gridOptionsWrapper), 'ag-panel-title-bar-button-icon'));
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
        var eGui = button.getGui();
        addCssClass(eGui, 'ag-panel-title-bar-button');
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
        Autowired('popupService')
    ], AgPanel.prototype, "popupService", void 0);
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
