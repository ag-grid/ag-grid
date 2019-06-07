/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.0.1
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
var dragService_1 = require("../dragAndDrop/dragService");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var popupService_1 = require("./popupService");
var popupComponent_1 = require("./popupComponent");
var utils_1 = require("../utils");
var component_1 = require("./component");
var Dialog = /** @class */ (function (_super) {
    __extends(Dialog, _super);
    function Dialog(config) {
        var _this = _super.call(this, Dialog.TEMPLATE) || this;
        _this.resizable = {};
        _this.isResizable = false;
        _this.isMaximizable = false;
        _this.isMaximized = false;
        _this.maximizeListeners = [];
        _this.movable = false;
        _this.closable = true;
        _this.isMoving = false;
        _this.isResizing = false;
        _this.dragStartPosition = {
            x: 0,
            y: 0
        };
        _this.position = {
            x: 0,
            y: 0
        };
        _this.size = {
            width: 0,
            height: 0
        };
        _this.lastPosition = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        _this.config = config;
        return _this;
    }
    Dialog.prototype.postConstruct = function () {
        var _this = this;
        var _a = this.config, alwaysOnTop = _a.alwaysOnTop, component = _a.component, centered = _a.centered, resizable = _a.resizable, movable = _a.movable, maximizable = _a.maximizable, closable = _a.closable, title = _a.title, minWidth = _a.minWidth, width = _a.width, minHeight = _a.minHeight, height = _a.height;
        var _b = this.config, x = _b.x, y = _b.y;
        var eGui = this.getGui();
        this.popupParent = this.popupService.getPopupParent();
        this.minHeight = minHeight != null ? minHeight : 250;
        this.minWidth = minWidth != null ? minWidth : 250;
        if (component) {
            this.setBodyComponent(component);
        }
        if (resizable) {
            this.setResizable(resizable);
        }
        if (title) {
            this.setTitle(title);
        }
        if (this.isResizable && maximizable) {
            this.setMaximizable(maximizable);
        }
        this.setMovable(!!movable);
        this.setClosable(closable != null ? closable : this.closable);
        if (width) {
            utils_1._.setFixedWidth(eGui, width);
            this.size.width = width;
        }
        if (height) {
            utils_1._.setFixedHeight(eGui, height);
            this.size.height = height;
        }
        this.close = this.popupService.addPopup(false, eGui, true, this.destroy.bind(this));
        if (alwaysOnTop) {
            eGui.style.zIndex = '6';
        }
        this.refreshSize();
        eGui.focus();
        if (centered) {
            x = (eGui.offsetParent.clientWidth / 2) - (this.getWidth() / 2);
            y = (eGui.offsetParent.clientHeight / 2) - (this.getHeight() / 2);
        }
        if (x || y) {
            this.offsetDialog(x, y);
        }
        this.addDestroyableEventListener(this.eTitleBar, 'mousedown', function (e) {
            if (eGui.contains(e.relatedTarget) || eGui.contains(document.activeElement)) {
                return;
            }
            var focusEl = _this.eContentWrapper.querySelector('button, [href], input, select, textarea, [tabindex]');
            if (focusEl) {
                focusEl.focus();
            }
        });
        this.addDestroyableEventListener(eGui, 'focusin', function (e) {
            if (eGui.contains(e.relatedTarget)) {
                return;
            }
            _this.popupService.bringPopupToFront(eGui);
        });
    };
    Dialog.prototype.updateDragStartPosition = function (x, y) {
        this.dragStartPosition = { x: x, y: y };
    };
    Dialog.prototype.getResizerElement = function (side) {
        var map = {
            topLeft: this.eTopLeftResizer,
            top: this.eTopResizer,
            topRight: this.eTopRightResizer,
            right: this.eRightResizer,
            bottomRight: this.eBottomRightResizer,
            bottom: this.eBottomResizer,
            bottomLeft: this.eBottomLeftResizer,
            left: this.eLeftResizer
        };
        return map[side];
    };
    Dialog.prototype.setResizable = function (resizable) {
        var _this = this;
        var isResizable = false;
        if (typeof resizable === 'boolean') {
            resizable = {
                topLeft: resizable,
                top: resizable,
                topRight: resizable,
                right: resizable,
                bottomRight: resizable,
                bottom: resizable,
                bottomLeft: resizable,
                left: resizable
            };
        }
        Object.keys(resizable).forEach(function (side) {
            var r = resizable;
            var s = side;
            var val = !!r[s];
            var el = _this.getResizerElement(s);
            var params = {
                eElement: el,
                onDragStart: _this.onDialogResizeStart.bind(_this),
                onDragging: function (e) { return _this.onDialogResize(e, s); },
                onDragStop: _this.onDialogResizeEnd.bind(_this),
            };
            if (!!_this.resizable[s] !== val) {
                if (val) {
                    _this.dragService.addDragSource(params);
                    el.style.pointerEvents = 'all';
                    isResizable = true;
                }
                else {
                    _this.dragService.removeDragSource(params);
                    el.style.pointerEvents = 'none';
                }
            }
        });
        this.isResizable = isResizable;
    };
    Dialog.prototype.onDialogResizeStart = function (e) {
        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    Dialog.prototype.calculateMouseMovement = function (params) {
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
    Dialog.prototype.onDialogResize = function (e, side) {
        if (!this.isResizing) {
            return;
        }
        var isLeft = !!side.match(/left/i);
        var isRight = !!side.match(/right/i);
        var isTop = !!side.match(/top/i);
        var isBottom = !!side.match(/bottom/i);
        var isHorizontal = isLeft || isRight;
        var isVertical = isTop || isBottom;
        var _a = this.calculateMouseMovement({ e: e, isLeft: isLeft, isTop: isTop }), movementX = _a.movementX, movementY = _a.movementY;
        var offsetLeft = 0;
        var offsetTop = 0;
        if (isHorizontal && movementX) {
            var direction = isLeft ? -1 : 1;
            var oldWidth = this.getWidth();
            var newWidth = oldWidth + (movementX * direction);
            var skipWidth = false;
            if (isLeft) {
                offsetLeft = oldWidth - newWidth;
                if (this.position.x + offsetLeft <= 0 || newWidth <= this.minWidth) {
                    skipWidth = true;
                    offsetLeft = 0;
                }
            }
            if (!skipWidth) {
                this.setWidth(newWidth);
            }
        }
        if (isVertical && movementY) {
            var direction = isTop ? -1 : 1;
            var oldHeight = this.getHeight();
            var newHeight = oldHeight + (movementY * direction);
            var skipHeight = false;
            if (isTop) {
                offsetTop = oldHeight - newHeight;
                if (this.position.y + offsetTop <= 0 || newHeight <= this.minHeight) {
                    skipHeight = true;
                    offsetTop = 0;
                }
            }
            if (!skipHeight) {
                this.setHeight(newHeight);
            }
        }
        this.updateDragStartPosition(e.clientX, e.clientY);
        if (offsetLeft || offsetTop) {
            this.offsetDialog(this.position.x + offsetLeft, this.position.y + offsetTop);
        }
        this.isMaximized = false;
    };
    Dialog.prototype.onDialogResizeEnd = function () {
        this.isResizing = false;
    };
    Dialog.prototype.refreshSize = function () {
        var _a = this.size, width = _a.width, height = _a.height;
        if (!width) {
            this.setWidth(this.getGui().offsetWidth);
        }
        if (!height) {
            this.setHeight(this.getGui().offsetHeight);
        }
    };
    Dialog.prototype.setMovable = function (movable) {
        if (movable !== this.movable) {
            this.movable = movable;
            var params = {
                eElement: this.eTitleBar,
                onDragStart: this.onDialogMoveStart.bind(this),
                onDragging: this.onDialogMove.bind(this),
                onDragStop: this.onDialogMoveEnd.bind(this)
            };
            this.dragService[movable ? 'addDragSource' : 'removeDragSource'](params);
        }
    };
    Dialog.prototype.onDialogMoveStart = function (e) {
        this.isMoving = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    Dialog.prototype.onDialogMove = function (e) {
        if (!this.isMoving) {
            return;
        }
        var _a = this.position, x = _a.x, y = _a.y;
        var _b = this.calculateMouseMovement({
            e: e,
            isTop: true,
            anywhereWithin: true,
            topBuffer: this.getHeight() - this.getBodyHeight()
        }), movementX = _b.movementX, movementY = _b.movementY;
        this.offsetDialog(x + movementX, y + movementY);
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    Dialog.prototype.offsetDialog = function (x, y) {
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
    Dialog.prototype.onDialogMoveEnd = function () {
        this.isMoving = false;
    };
    Dialog.prototype.setClosable = function (closable) {
        if (closable !== this.closable) {
            this.closable = closable;
        }
        if (closable) {
            var closeButtonComp = this.closeButtonComp = new component_1.Component(Dialog.CLOSE_BTN_TEMPLATE);
            this.addTitleBarButton(closeButtonComp);
            closeButtonComp.addDestroyableEventListener(closeButtonComp.getGui(), 'click', this.onBtClose.bind(this));
        }
        else if (this.closeButtonComp) {
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
        }
    };
    Dialog.prototype.setMaximizable = function (maximizable) {
        if (maximizable === false) {
            this.clearMaximizebleListeners();
            if (this.maximizeButtonComp) {
                this.maximizeButtonComp.destroy();
                this.maximizeButtonComp = undefined;
            }
            return;
        }
        var eTitleBar = this.eTitleBar;
        if (!this.isResizable || !eTitleBar || maximizable === this.isMaximizable) {
            return;
        }
        var maximizeButtonComp = this.maximizeButtonComp = new component_1.Component(Dialog.MAXIMIZE_BTN_TEMPLATE);
        maximizeButtonComp.addDestroyableEventListener(maximizeButtonComp.getGui(), 'click', this.toggleMaximize.bind(this));
        this.addTitleBarButton(maximizeButtonComp, 0);
        this.maximizeListeners.push(this.addDestroyableEventListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this)));
    };
    Dialog.prototype.toggleMaximize = function () {
        var maximizeButton = this.maximizeButtonComp.getGui();
        var maximizeEl = maximizeButton.querySelector('.ag-icon-maximize');
        var minimizeEl = maximizeButton.querySelector('.ag-icon-minimize');
        if (this.isMaximized) {
            var _a = this.lastPosition, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
            this.setWidth(width);
            this.setHeight(height);
            this.offsetDialog(x, y);
        }
        else {
            this.lastPosition.width = this.getWidth();
            this.lastPosition.height = this.getHeight();
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            this.offsetDialog(0, 0);
            this.setHeight(Infinity);
            this.setWidth(Infinity);
        }
        this.isMaximized = !this.isMaximized;
        utils_1._.addOrRemoveCssClass(maximizeEl, 'ag-hidden', this.isMaximized);
        utils_1._.addOrRemoveCssClass(minimizeEl, 'ag-hidden', !this.isMaximized);
    };
    Dialog.prototype.clearMaximizebleListeners = function () {
        if (this.maximizeListeners.length) {
            this.maximizeListeners.forEach(function (destroyListener) { return destroyListener(); });
            this.maximizeListeners.length = 0;
        }
    };
    Dialog.prototype.setBodyComponent = function (bodyComponent) {
        bodyComponent.setParentComponent(this);
        this.eContentWrapper.appendChild(bodyComponent.getGui());
    };
    Dialog.prototype.addTitleBarButton = function (button, position) {
        var eTitleBarButtons = this.eTitleBarButtons;
        var buttons = eTitleBarButtons.children;
        var len = buttons.length;
        if (position == null) {
            position = len;
        }
        position = Math.max(0, Math.min(position, len));
        var eGui = button.getGui();
        utils_1._.addCssClass(eGui, 'ag-dialog-button');
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
    Dialog.prototype.getBodyHeight = function () {
        return utils_1._.getInnerHeight(this.eContentWrapper);
    };
    Dialog.prototype.getBodyWidth = function () {
        return utils_1._.getInnerWidth(this.eContentWrapper);
    };
    Dialog.prototype.setTitle = function (title) {
        this.eTitle.innerText = title;
    };
    Dialog.prototype.getHeight = function () {
        return this.size.height;
    };
    Dialog.prototype.setHeight = function (height) {
        var newHeight = Math.max(this.minHeight, height);
        var eGui = this.getGui();
        if (newHeight + this.position.y > eGui.offsetParent.clientHeight) {
            newHeight = eGui.offsetParent.clientHeight - this.position.y;
        }
        if (this.size.height === newHeight) {
            return;
        }
        this.size.height = newHeight;
        utils_1._.setFixedHeight(eGui, newHeight);
        utils_1._.setFixedHeight(this.eContentWrapper, eGui.clientHeight - this.eTitleBar.offsetHeight);
    };
    Dialog.prototype.getWidth = function () {
        return this.size.width;
    };
    Dialog.prototype.setWidth = function (width) {
        var newWidth = Math.max(this.minWidth, width);
        var eGui = this.getGui();
        if (newWidth + this.position.x > eGui.offsetParent.clientWidth) {
            newWidth = eGui.offsetParent.clientWidth - this.position.x;
        }
        if (this.size.width === newWidth) {
            return;
        }
        this.size.width = newWidth;
        utils_1._.setFixedWidth(eGui, newWidth);
    };
    // called when user hits the 'x' in the top right
    Dialog.prototype.onBtClose = function () {
        this.close();
    };
    Dialog.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.closeButtonComp) {
            this.closeButtonComp.destroy();
            this.closeButtonComp = undefined;
        }
        if (this.maximizeButtonComp) {
            this.maximizeButtonComp.destroy();
            this.maximizeButtonComp = undefined;
        }
        this.clearMaximizebleListeners();
        var eGui = this.getGui();
        if (eGui && eGui.offsetParent) {
            this.close();
        }
    };
    Dialog.TEMPLATE = "<div class=\"ag-dialog\" tabindex=\"-1\">\n            <div class=\"ag-resizer-wrapper\">\n                <div ref=\"eTopLeftResizer\" class=\"ag-resizer ag-resizer-topLeft\"></div>\n                <div ref=\"eTopResizer\" class=\"ag-resizer ag-resizer-top\"></div>\n                <div ref=\"eTopRightResizer\" class=\"ag-resizer ag-resizer-topRight\"></div>\n                <div ref=\"eRightResizer\" class=\"ag-resizer ag-resizer-right\"></div>\n                <div ref=\"eBottomRightResizer\" class=\"ag-resizer ag-resizer-bottomRight\"></div>\n                <div ref=\"eBottomResizer\" class=\"ag-resizer ag-resizer-bottom\"></div>\n                <div ref=\"eBottomLeftResizer\" class=\"ag-resizer ag-resizer-bottomLeft\"></div>\n                <div ref=\"eLeftResizer\" class=\"ag-resizer ag-resizer-left\"></div>\n            </div>\n            <div ref=\"eTitleBar\" class=\"ag-dialog-title-bar ag-unselectable\">\n                <span ref=\"eTitle\" class=\"ag-dialog-title-bar-title\"></span>\n                <div ref=\"eTitleBarButtons\" class=\"ag-dialog-title-bar-buttons\"></div>\n            </div>\n            <div ref=\"eContentWrapper\" class=\"ag-dialog-content-wrapper\"></div>\n        </div>";
    Dialog.CLOSE_BTN_TEMPLATE = "<div class=\"ag-dialog-button\">\n            <span class=\"ag-icon ag-icon-cross\"></span>\n        </div>\n        ";
    Dialog.MAXIMIZE_BTN_TEMPLATE = "<div class=\"ag-dialog-button\">\n            <span class=\"ag-icon ag-icon-maximize\"></span>\n            <span class=\"ag-icon ag-icon-minimize ag-hidden\"></span>\n        </span>\n        ";
    __decorate([
        context_1.Autowired('dragService'),
        __metadata("design:type", dragService_1.DragService)
    ], Dialog.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], Dialog.prototype, "popupService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContentWrapper'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eContentWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitleBar'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTitleBar", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitleBarButtons'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTitleBarButtons", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitle'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTitle", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopLeftResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTopLeftResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTopResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTopRightResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eTopRightResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eRightResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eRightResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomRightResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eBottomRightResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eBottomResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottomLeftResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eBottomLeftResizer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLeftResizer'),
        __metadata("design:type", HTMLElement)
    ], Dialog.prototype, "eLeftResizer", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Dialog.prototype, "postConstruct", null);
    return Dialog;
}(popupComponent_1.PopupComponent));
exports.Dialog = Dialog;
