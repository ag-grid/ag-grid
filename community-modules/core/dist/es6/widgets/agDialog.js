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
import { Autowired } from "../context/context";
import { AgPanel } from "./agPanel";
import { Component } from "./component";
import { addCssClass, setDisplayed } from "../utils/dom";
import { createIconNoSpan } from "../utils/icon";
var AgDialog = /** @class */ (function (_super) {
    __extends(AgDialog, _super);
    function AgDialog(config) {
        var _this = _super.call(this, config) || this;
        _this.RESIZE_TEMPLATE = "<div class=\"ag-resizer-wrapper\">\n            <div ref=\"eTopLeftResizer\" class=\"ag-resizer ag-resizer-topLeft\"></div>\n            <div ref=\"eTopResizer\" class=\"ag-resizer ag-resizer-top\"></div>\n            <div ref=\"eTopRightResizer\" class=\"ag-resizer ag-resizer-topRight\"></div>\n            <div ref=\"eRightResizer\" class=\"ag-resizer ag-resizer-right\"></div>\n            <div ref=\"eBottomRightResizer\" class=\"ag-resizer ag-resizer-bottomRight\"></div>\n            <div ref=\"eBottomResizer\" class=\"ag-resizer ag-resizer-bottom\"></div>\n            <div ref=\"eBottomLeftResizer\" class=\"ag-resizer ag-resizer-bottomLeft\"></div>\n            <div ref=\"eLeftResizer\" class=\"ag-resizer ag-resizer-left\"></div>\n        </div>";
        _this.resizable = {};
        _this.movable = false;
        _this.isMoving = false;
        _this.isMaximizable = false;
        _this.isMaximized = false;
        _this.maximizeListeners = [];
        _this.resizeListenerDestroy = null;
        _this.isResizing = false;
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
        addCssClass(eGui, 'ag-dialog');
        this.moveElement = this.eTitleBar;
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
        this.addResizers();
        if (resizable) {
            this.setResizable(resizable);
        }
    };
    AgDialog.prototype.renderComponent = function () {
        var eGui = this.getGui();
        var _a = this.config, alwaysOnTop = _a.alwaysOnTop, modal = _a.modal;
        var addPopupRes = this.popupService.addPopup({
            modal: modal,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: this.destroy.bind(this),
            alwaysOnTop: alwaysOnTop
        });
        if (addPopupRes) {
            this.close = addPopupRes.hideFunc;
        }
    };
    AgDialog.prototype.addResizers = function () {
        var eGui = this.getGui();
        if (!eGui) {
            return;
        }
        var parser = new DOMParser();
        var resizers = parser.parseFromString(this.RESIZE_TEMPLATE, 'text/html').body;
        eGui.appendChild(resizers.firstChild);
        this.createMap();
    };
    AgDialog.prototype.createMap = function () {
        var eGui = this.getGui();
        this.resizerMap = {
            topLeft: { element: eGui.querySelector('[ref=eTopLeftResizer]') },
            top: { element: eGui.querySelector('[ref=eTopResizer]') },
            topRight: { element: eGui.querySelector('[ref=eTopRightResizer]') },
            right: { element: eGui.querySelector('[ref=eRightResizer]') },
            bottomRight: { element: eGui.querySelector('[ref=eBottomRightResizer]') },
            bottom: { element: eGui.querySelector('[ref=eBottomResizer]') },
            bottomLeft: { element: eGui.querySelector('[ref=eBottomLeftResizer]') },
            left: { element: eGui.querySelector('[ref=eLeftResizer]') }
        };
    };
    AgDialog.prototype.getResizerElement = function (side) {
        return this.resizerMap[side].element;
    };
    AgDialog.prototype.onResizeStart = function (e) {
        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    AgDialog.prototype.onResize = function (e, side) {
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
            this.offsetElement(this.position.x + offsetLeft, this.position.y + offsetTop);
        }
    };
    AgDialog.prototype.onResizeEnd = function () {
        this.isResizing = false;
        var params = {
            type: 'resize',
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        this.dispatchEvent(params);
    };
    AgDialog.prototype.onMoveStart = function (e) {
        this.isMoving = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    AgDialog.prototype.onMove = function (e) {
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
        this.offsetElement(x + movementX, y + movementY);
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    AgDialog.prototype.onMoveEnd = function () {
        this.isMoving = false;
    };
    AgDialog.prototype.toggleMaximize = function () {
        if (this.isMaximized) {
            var _a = this.lastPosition, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
            this.setWidth(width);
            this.setHeight(height);
            this.offsetElement(x, y);
        }
        else {
            this.lastPosition.width = this.getWidth();
            this.lastPosition.height = this.getHeight();
            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            this.offsetElement(0, 0);
            this.setHeight('100%');
            this.setWidth('100%');
        }
        this.isMaximized = !this.isMaximized;
        this.refreshMaximizeIcon();
    };
    AgDialog.prototype.refreshMaximizeIcon = function () {
        setDisplayed(this.maximizeIcon, !this.isMaximized);
        setDisplayed(this.minimizeIcon, this.isMaximized);
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
        this.setResizable(false);
        this.setMovable(false);
        this.maximizeButtonComp = this.destroyBean(this.maximizeButtonComp);
        this.clearMaximizebleListeners();
        _super.prototype.destroy.call(this);
    };
    AgDialog.prototype.setResizable = function (resizable) {
        var _this = this;
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
            var params = _this.resizerMap[s].dragSource || {
                eElement: el,
                onDragStart: _this.onResizeStart.bind(_this),
                onDragging: function (e) { return _this.onResize(e, s); },
                onDragStop: _this.onResizeEnd.bind(_this),
            };
            if (!!_this.resizable[s] !== val || (!_this.isAlive() && !val)) {
                if (val) {
                    _this.dragService.addDragSource(params);
                    el.style.pointerEvents = 'all';
                }
                else {
                    _this.dragService.removeDragSource(params);
                    el.style.pointerEvents = 'none';
                }
                _this.resizerMap[s].dragSource = val ? params : undefined;
            }
        });
    };
    AgDialog.prototype.setMovable = function (movable) {
        if (movable === this.movable) {
            return;
        }
        this.movable = movable;
        var params = this.moveElementDragListener || {
            eElement: this.moveElement,
            onDragStart: this.onMoveStart.bind(this),
            onDragging: this.onMove.bind(this),
            onDragStop: this.onMoveEnd.bind(this)
        };
        if (movable) {
            this.dragService.addDragSource(params);
            this.moveElementDragListener = params;
        }
        else {
            this.dragService.removeDragSource(params);
            this.moveElementDragListener = undefined;
        }
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
        var maximizeButtonComp = this.maximizeButtonComp =
            this.createBean(new Component(/* html */ "<div class=\"ag-dialog-button\"></span>"));
        var eGui = maximizeButtonComp.getGui();
        eGui.appendChild(this.maximizeIcon = createIconNoSpan('maximize', this.gridOptionsWrapper));
        addCssClass(this.maximizeIcon, 'ag-panel-title-bar-button-icon');
        eGui.appendChild(this.minimizeIcon = createIconNoSpan('minimize', this.gridOptionsWrapper));
        addCssClass(this.minimizeIcon, 'ag-panel-title-bar-button-icon');
        addCssClass(this.minimizeIcon, 'ag-hidden');
        maximizeButtonComp.addManagedListener(eGui, 'click', this.toggleMaximize.bind(this));
        this.addTitleBarButton(maximizeButtonComp, 0);
        this.maximizeListeners.push(this.addManagedListener(eTitleBar, 'dblclick', this.toggleMaximize.bind(this)));
        this.resizeListenerDestroy = this.addManagedListener(this, 'resize', function () {
            _this.isMaximized = false;
            _this.refreshMaximizeIcon();
        });
    };
    __decorate([
        Autowired('dragService')
    ], AgDialog.prototype, "dragService", void 0);
    return AgDialog;
}(AgPanel));
export { AgDialog };
