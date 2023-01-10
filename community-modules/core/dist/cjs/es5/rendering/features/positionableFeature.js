/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionableFeature = void 0;
var beanStub_1 = require("../../context/beanStub");
var context_1 = require("../../context/context");
var dom_1 = require("../../utils/dom");
var RESIZE_CONTAINER_STYLE = 'ag-resizer-wrapper';
var RESIZE_TEMPLATE = /* html */ "<div class=\"" + RESIZE_CONTAINER_STYLE + "\">\n        <div ref=\"eTopLeftResizer\" class=\"ag-resizer ag-resizer-topLeft\"></div>\n        <div ref=\"eTopResizer\" class=\"ag-resizer ag-resizer-top\"></div>\n        <div ref=\"eTopRightResizer\" class=\"ag-resizer ag-resizer-topRight\"></div>\n        <div ref=\"eRightResizer\" class=\"ag-resizer ag-resizer-right\"></div>\n        <div ref=\"eBottomRightResizer\" class=\"ag-resizer ag-resizer-bottomRight\"></div>\n        <div ref=\"eBottomResizer\" class=\"ag-resizer ag-resizer-bottom\"></div>\n        <div ref=\"eBottomLeftResizer\" class=\"ag-resizer ag-resizer-bottomLeft\"></div>\n        <div ref=\"eLeftResizer\" class=\"ag-resizer ag-resizer-left\"></div>\n    </div>";
var PositionableFeature = /** @class */ (function (_super) {
    __extends(PositionableFeature, _super);
    function PositionableFeature(element, config) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.dragStartPosition = {
            x: 0,
            y: 0
        };
        _this.position = {
            x: 0,
            y: 0
        };
        _this.lastSize = {
            width: -1,
            height: -1
        };
        _this.positioned = false;
        _this.resizersAdded = false;
        _this.resizeListeners = [];
        _this.boundaryEl = null;
        _this.isResizing = false;
        _this.isMoving = false;
        _this.resizable = {};
        _this.movable = false;
        _this.currentResizer = null;
        _this.config = Object.assign({}, { popup: false }, config);
        return _this;
    }
    PositionableFeature.prototype.center = function () {
        var _a = this.offsetParent, clientHeight = _a.clientHeight, clientWidth = _a.clientWidth;
        var x = (clientWidth / 2) - (this.getWidth() / 2);
        var y = (clientHeight / 2) - (this.getHeight() / 2);
        this.offsetElement(x, y);
    };
    PositionableFeature.prototype.initialisePosition = function () {
        var _a = this.config, centered = _a.centered, forcePopupParentAsOffsetParent = _a.forcePopupParentAsOffsetParent, minWidth = _a.minWidth, width = _a.width, minHeight = _a.minHeight, height = _a.height, x = _a.x, y = _a.y;
        if (!this.offsetParent) {
            this.setOffsetParent();
        }
        var computedMinHeight = 0;
        var computedMinWidth = 0;
        // here we don't use the main offset parent but the element's offsetParent
        // in order to calculated the minWidth and minHeight correctly
        var isVisible = !!this.element.offsetParent;
        if (isVisible) {
            var boundaryEl = this.findBoundaryElement();
            var offsetParentComputedStyles = window.getComputedStyle(boundaryEl);
            if (offsetParentComputedStyles.minWidth != null) {
                var paddingWidth = boundaryEl.offsetWidth - this.element.offsetWidth;
                computedMinWidth = parseInt(offsetParentComputedStyles.minWidth, 10) - paddingWidth;
            }
            if (offsetParentComputedStyles.minHeight != null) {
                var paddingHeight = boundaryEl.offsetHeight - this.element.offsetHeight;
                computedMinHeight = parseInt(offsetParentComputedStyles.minHeight, 10) - paddingHeight;
            }
        }
        this.minHeight = minHeight || computedMinHeight;
        this.minWidth = minWidth || computedMinWidth;
        if (width) {
            this.setWidth(width);
        }
        if (height) {
            this.setHeight(height);
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
        else if (isVisible && forcePopupParentAsOffsetParent && this.boundaryEl) {
            var top_1 = parseFloat(this.boundaryEl.style.top);
            var left = parseFloat(this.boundaryEl.style.left);
            this.offsetElement(isNaN(left) ? 0 : left, isNaN(top_1) ? 0 : top_1);
        }
        this.positioned = !!this.offsetParent;
    };
    PositionableFeature.prototype.isPositioned = function () {
        return this.positioned;
    };
    PositionableFeature.prototype.getPosition = function () {
        return this.position;
    };
    PositionableFeature.prototype.setMovable = function (movable, moveElement) {
        if (!this.config.popup || movable === this.movable) {
            return;
        }
        this.movable = movable;
        var params = this.moveElementDragListener || {
            eElement: moveElement,
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
    PositionableFeature.prototype.setResizable = function (resizable) {
        var _this = this;
        this.clearResizeListeners();
        if (resizable) {
            this.addResizers();
        }
        else {
            this.removeResizers();
        }
        if (typeof resizable === 'boolean') {
            if (resizable === false) {
                return;
            }
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
            var resizableStructure = resizable;
            var isSideResizable = !!resizableStructure[side];
            var resizerEl = _this.getResizerElement(side);
            var params = {
                dragStartPixels: 0,
                eElement: resizerEl,
                onDragStart: function (e) { return _this.onResizeStart(e, side); },
                onDragging: _this.onResize.bind(_this),
                onDragStop: function (e) { return _this.onResizeEnd(e, side); },
            };
            if (isSideResizable || (!_this.isAlive() && !isSideResizable)) {
                if (isSideResizable) {
                    _this.dragService.addDragSource(params);
                    _this.resizeListeners.push(params);
                    resizerEl.style.pointerEvents = 'all';
                }
                else {
                    resizerEl.style.pointerEvents = 'none';
                }
                _this.resizable[side] = isSideResizable;
            }
        });
    };
    PositionableFeature.prototype.removeSizeFromEl = function () {
        this.element.style.removeProperty('height');
        this.element.style.removeProperty('width');
        this.element.style.removeProperty('flex');
    };
    PositionableFeature.prototype.restoreLastSize = function () {
        this.element.style.flex = '0 0 auto';
        var _a = this.lastSize, height = _a.height, width = _a.width;
        if (width !== -1) {
            this.element.style.width = width + "px";
        }
        if (height !== -1) {
            this.element.style.height = height + "px";
        }
    };
    PositionableFeature.prototype.getHeight = function () {
        return this.element.offsetHeight;
    };
    PositionableFeature.prototype.setHeight = function (height) {
        var popup = this.config.popup;
        var eGui = this.element;
        var isPercent = false;
        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            dom_1.setFixedHeight(eGui, height);
            height = dom_1.getAbsoluteHeight(eGui);
            isPercent = true;
        }
        else if (this.positioned) {
            var elRect = this.element.getBoundingClientRect();
            var parentRect = this.offsetParent.getBoundingClientRect();
            height = Math.max(this.minHeight, height);
            var clientHeight = this.offsetParent.clientHeight;
            var yPosition = popup ? this.position.y : elRect.top;
            var parentTop = popup ? 0 : parentRect.top;
            if (clientHeight && (height + yPosition > clientHeight + parentTop)) {
                height = clientHeight - yPosition;
            }
        }
        if (this.getHeight() === height) {
            return;
        }
        if (!isPercent) {
            if (popup) {
                dom_1.setFixedHeight(eGui, height);
            }
            else {
                eGui.style.height = height + "px";
                eGui.style.flex = '0 0 auto';
                this.lastSize.height = typeof height === 'number' ? height : parseFloat(height);
            }
        }
        else {
            eGui.style.maxHeight = 'unset';
            eGui.style.minHeight = 'unset';
        }
    };
    PositionableFeature.prototype.getWidth = function () {
        return this.element.offsetWidth;
    };
    PositionableFeature.prototype.setWidth = function (width) {
        var eGui = this.element;
        var popup = this.config.popup;
        var isPercent = false;
        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            dom_1.setFixedWidth(eGui, width);
            width = dom_1.getAbsoluteWidth(eGui);
            isPercent = true;
        }
        else if (this.positioned) {
            width = Math.max(this.minWidth, width);
            var clientWidth = this.offsetParent.clientWidth;
            var xPosition = popup ? this.position.x : this.element.getBoundingClientRect().left;
            if (clientWidth && (width + xPosition > clientWidth)) {
                width = clientWidth - xPosition;
            }
        }
        if (this.getWidth() === width) {
            return;
        }
        if (!isPercent) {
            if (this.config.popup) {
                dom_1.setFixedWidth(eGui, width);
            }
            else {
                eGui.style.width = width + "px";
                eGui.style.flex = ' unset';
                this.lastSize.width = typeof width === 'number' ? width : parseFloat(width);
            }
        }
        else {
            eGui.style.maxWidth = 'unset';
            eGui.style.minWidth = 'unset';
        }
    };
    PositionableFeature.prototype.offsetElement = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        var ePopup = this.config.forcePopupParentAsOffsetParent ? this.boundaryEl : this.element;
        this.popupService.positionPopup({
            ePopup: ePopup,
            keepWithinBounds: true,
            skipObserver: this.movable || this.isResizable(),
            updatePosition: function () { return ({ x: x, y: y }); }
        });
        this.setPosition(parseFloat(ePopup.style.left), parseFloat(ePopup.style.top));
    };
    PositionableFeature.prototype.setPosition = function (x, y) {
        this.position.x = x;
        this.position.y = y;
    };
    PositionableFeature.prototype.updateDragStartPosition = function (x, y) {
        this.dragStartPosition = { x: x, y: y };
    };
    PositionableFeature.prototype.calculateMouseMovement = function (params) {
        var e = params.e, isLeft = params.isLeft, isTop = params.isTop, anywhereWithin = params.anywhereWithin, topBuffer = params.topBuffer;
        var xDiff = e.clientX - this.dragStartPosition.x;
        var yDiff = e.clientY - this.dragStartPosition.y;
        var movementX = this.shouldSkipX(e, !!isLeft, !!anywhereWithin, xDiff) ? 0 : xDiff;
        var movementY = this.shouldSkipY(e, !!isTop, topBuffer, yDiff) ? 0 : yDiff;
        return { movementX: movementX, movementY: movementY };
    };
    PositionableFeature.prototype.shouldSkipX = function (e, isLeft, anywhereWithin, diff) {
        var elRect = this.element.getBoundingClientRect();
        var parentRect = this.offsetParent.getBoundingClientRect();
        var boundaryElRect = this.boundaryEl.getBoundingClientRect();
        var xPosition = this.config.popup ? this.position.x : elRect.left;
        // skip if cursor is outside of popupParent horizontally
        var skipX = ((xPosition <= 0 && parentRect.left >= e.clientX) ||
            (parentRect.right <= e.clientX && parentRect.right <= boundaryElRect.right));
        if (skipX) {
            return true;
        }
        if (isLeft) {
            skipX = (
            // skip if we are moving to the left and the cursor
            // is positioned to the right of the left side anchor
            (diff < 0 && e.clientX > xPosition + parentRect.left) ||
                // skip if we are moving to the right and the cursor
                // is positioned to the left of the dialog
                (diff > 0 && e.clientX < xPosition + parentRect.left));
        }
        else {
            if (anywhereWithin) {
                // if anywhereWithin is true, we allow to move
                // as long as the cursor is within the dialog
                skipX = ((diff < 0 && e.clientX > boundaryElRect.right) ||
                    (diff > 0 && e.clientX < xPosition + parentRect.left));
            }
            else {
                skipX = (
                // if the movement is bound to the right side of the dialog
                // we skip if we are moving to the left and the cursor
                // is to the right of the dialog
                (diff < 0 && e.clientX > boundaryElRect.right) ||
                    // or skip if we are moving to the right and the cursor
                    // is to the left of the right side anchor
                    (diff > 0 && e.clientX < boundaryElRect.right));
            }
        }
        return skipX;
    };
    PositionableFeature.prototype.shouldSkipY = function (e, isTop, topBuffer, diff) {
        if (topBuffer === void 0) { topBuffer = 0; }
        var elRect = this.element.getBoundingClientRect();
        var parentRect = this.offsetParent.getBoundingClientRect();
        var boundaryElRect = this.boundaryEl.getBoundingClientRect();
        var yPosition = this.config.popup ? this.position.y : elRect.top;
        // skip if cursor is outside of popupParent vertically
        var skipY = ((yPosition <= 0 && parentRect.top >= e.clientY) ||
            (parentRect.bottom <= e.clientY && parentRect.bottom <= boundaryElRect.bottom));
        if (skipY) {
            return true;
        }
        if (isTop) {
            skipY = (
            // skip if we are moving to towards top and the cursor is
            // below the top anchor + topBuffer
            // note: topBuffer is used when moving the dialog using the title bar
            (diff < 0 && e.clientY > yPosition + parentRect.top + topBuffer) ||
                // skip if we are moving to the bottom and the cursor is
                // above the top anchor
                (diff > 0 && e.clientY < yPosition + parentRect.top));
        }
        else {
            skipY = (
            // skip if we are moving towards the top and the cursor
            // is below the bottom anchor
            (diff < 0 && e.clientY > boundaryElRect.bottom) ||
                // skip if we are moving towards the bottom and the cursor
                // is above the bottom anchor
                (diff > 0 && e.clientY < boundaryElRect.bottom));
        }
        return skipY;
    };
    PositionableFeature.prototype.createResizeMap = function () {
        var eGui = this.element;
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
    PositionableFeature.prototype.addResizers = function () {
        if (this.resizersAdded) {
            return;
        }
        var eGui = this.element;
        if (!eGui) {
            return;
        }
        var parser = new DOMParser();
        var resizers = parser.parseFromString(RESIZE_TEMPLATE, 'text/html').body;
        eGui.appendChild(resizers.firstChild);
        this.createResizeMap();
        this.resizersAdded = true;
    };
    PositionableFeature.prototype.removeResizers = function () {
        this.resizerMap = undefined;
        var resizerEl = this.element.querySelector("." + RESIZE_CONTAINER_STYLE);
        if (resizerEl) {
            this.element.removeChild(resizerEl);
        }
        this.resizersAdded = false;
    };
    PositionableFeature.prototype.getResizerElement = function (side) {
        return this.resizerMap[side].element;
    };
    PositionableFeature.prototype.onResizeStart = function (e, side) {
        this.boundaryEl = this.findBoundaryElement();
        if (!this.positioned) {
            this.initialisePosition();
        }
        this.currentResizer = {
            isTop: !!side.match(/top/i),
            isRight: !!side.match(/right/i),
            isBottom: !!side.match(/bottom/i),
            isLeft: !!side.match(/left/i),
        };
        this.element.classList.add('ag-resizing');
        this.resizerMap[side].element.classList.add('ag-active');
        var _a = this.config, popup = _a.popup, forcePopupParentAsOffsetParent = _a.forcePopupParentAsOffsetParent;
        if (!popup && !forcePopupParentAsOffsetParent) {
            this.applySizeToSiblings(this.currentResizer.isBottom || this.currentResizer.isTop);
        }
        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    PositionableFeature.prototype.getSiblings = function () {
        var element = this.element;
        var parent = element.parentElement;
        if (!parent) {
            return null;
        }
        return Array.prototype.slice.call(parent.children).filter(function (el) { return !el.classList.contains('ag-hidden'); });
    };
    PositionableFeature.prototype.getMinSizeOfSiblings = function () {
        var siblings = this.getSiblings() || [];
        var height = 0;
        var width = 0;
        for (var i = 0; i < siblings.length; i++) {
            var currentEl = siblings[i];
            var isFlex = !!currentEl.style.flex && currentEl.style.flex !== '0 0 auto';
            if (currentEl === this.element) {
                continue;
            }
            var nextHeight = this.minHeight || 0;
            var nextWidth = this.minWidth || 0;
            if (isFlex) {
                var computedStyle = window.getComputedStyle(currentEl);
                if (computedStyle.minHeight) {
                    nextHeight = parseInt(computedStyle.minHeight, 10);
                }
                if (computedStyle.minWidth) {
                    nextWidth = parseInt(computedStyle.minWidth, 10);
                }
            }
            else {
                nextHeight = currentEl.offsetHeight;
                nextWidth = currentEl.offsetWidth;
            }
            height += nextHeight;
            width += nextWidth;
        }
        return { height: height, width: width };
    };
    PositionableFeature.prototype.applySizeToSiblings = function (vertical) {
        var containerToFlex = null;
        var siblings = this.getSiblings();
        if (!siblings) {
            return;
        }
        for (var i = 0; i < siblings.length; i++) {
            var el = siblings[i];
            if (el === containerToFlex) {
                continue;
            }
            if (vertical) {
                el.style.height = el.offsetHeight + "px";
            }
            else {
                el.style.width = el.offsetWidth + "px";
            }
            el.style.flex = '0 0 auto';
            if (el === this.element) {
                containerToFlex = siblings[i + 1];
            }
        }
        if (containerToFlex) {
            containerToFlex.style.removeProperty('height');
            containerToFlex.style.removeProperty('min-height');
            containerToFlex.style.removeProperty('max-height');
            containerToFlex.style.flex = '1 1 auto';
        }
    };
    PositionableFeature.prototype.isResizable = function () {
        return Object.values(this.resizable).some(function (value) { return value; });
    };
    PositionableFeature.prototype.onResize = function (e) {
        if (!this.isResizing || !this.currentResizer) {
            return;
        }
        var _a = this.config, popup = _a.popup, forcePopupParentAsOffsetParent = _a.forcePopupParentAsOffsetParent;
        var _b = this.currentResizer, isTop = _b.isTop, isRight = _b.isRight, isBottom = _b.isBottom, isLeft = _b.isLeft;
        var isHorizontal = isRight || isLeft;
        var isVertical = isBottom || isTop;
        var _c = this.calculateMouseMovement({ e: e, isLeft: isLeft, isTop: isTop }), movementX = _c.movementX, movementY = _c.movementY;
        var xPosition = this.position.x;
        var yPosition = this.position.y;
        var offsetLeft = 0;
        var offsetTop = 0;
        if (isHorizontal && movementX) {
            var direction = isLeft ? -1 : 1;
            var oldWidth = this.getWidth();
            var newWidth = oldWidth + (movementX * direction);
            var skipWidth = false;
            if (isLeft) {
                offsetLeft = oldWidth - newWidth;
                if (xPosition + offsetLeft <= 0 || newWidth <= this.minWidth) {
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
                if (yPosition + offsetTop <= 0 || newHeight <= this.minHeight) {
                    skipHeight = true;
                    offsetTop = 0;
                }
            }
            else {
                // do not let the size of all siblings be higher than the parent container
                if (!this.config.popup &&
                    !this.config.forcePopupParentAsOffsetParent &&
                    oldHeight < newHeight &&
                    (this.getMinSizeOfSiblings().height + newHeight) > this.element.parentElement.offsetHeight) {
                    skipHeight = true;
                }
            }
            if (!skipHeight) {
                this.setHeight(newHeight);
            }
        }
        this.updateDragStartPosition(e.clientX, e.clientY);
        if ((popup || forcePopupParentAsOffsetParent) && offsetLeft || offsetTop) {
            this.offsetElement(xPosition + offsetLeft, yPosition + offsetTop);
        }
    };
    PositionableFeature.prototype.onResizeEnd = function (e, side) {
        this.isResizing = false;
        this.currentResizer = null;
        this.boundaryEl = null;
        var params = {
            type: 'resize',
            api: this.gridOptionsService.get('api'),
            columnApi: this.gridOptionsService.get('columnApi')
        };
        this.element.classList.remove('ag-resizing');
        this.resizerMap[side].element.classList.remove('ag-active');
        this.dispatchEvent(params);
    };
    PositionableFeature.prototype.refreshSize = function () {
        var eGui = this.element;
        if (this.config.popup) {
            if (!this.config.width) {
                this.setWidth(eGui.offsetWidth);
            }
            if (!this.config.height) {
                this.setHeight(eGui.offsetHeight);
            }
        }
    };
    PositionableFeature.prototype.onMoveStart = function (e) {
        this.boundaryEl = this.findBoundaryElement();
        if (!this.positioned) {
            this.initialisePosition();
        }
        this.isMoving = true;
        this.element.classList.add('ag-moving');
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    PositionableFeature.prototype.onMove = function (e) {
        if (!this.isMoving) {
            return;
        }
        var _a = this.position, x = _a.x, y = _a.y;
        var topBuffer;
        if (this.config.calculateTopBuffer) {
            topBuffer = this.config.calculateTopBuffer();
        }
        var _b = this.calculateMouseMovement({
            e: e,
            isTop: true,
            anywhereWithin: true,
            topBuffer: topBuffer
        }), movementX = _b.movementX, movementY = _b.movementY;
        this.offsetElement(x + movementX, y + movementY);
        this.updateDragStartPosition(e.clientX, e.clientY);
    };
    PositionableFeature.prototype.onMoveEnd = function () {
        this.isMoving = false;
        this.boundaryEl = null;
        this.element.classList.remove('ag-moving');
    };
    PositionableFeature.prototype.setOffsetParent = function () {
        if (this.config.forcePopupParentAsOffsetParent) {
            this.offsetParent = this.popupService.getPopupParent();
        }
        else {
            this.offsetParent = this.element.offsetParent;
        }
    };
    PositionableFeature.prototype.findBoundaryElement = function () {
        var el = this.element;
        while (el) {
            if (window.getComputedStyle(el).position !== 'static') {
                return el;
            }
            el = el.parentElement;
        }
        return this.element;
    };
    PositionableFeature.prototype.clearResizeListeners = function () {
        while (this.resizeListeners.length) {
            var params = this.resizeListeners.pop();
            this.dragService.removeDragSource(params);
        }
    };
    PositionableFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.moveElementDragListener) {
            this.dragService.removeDragSource(this.moveElementDragListener);
        }
        this.clearResizeListeners();
        this.removeResizers();
    };
    __decorate([
        context_1.Autowired('popupService')
    ], PositionableFeature.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('dragService')
    ], PositionableFeature.prototype, "dragService", void 0);
    return PositionableFeature;
}(beanStub_1.BeanStub));
exports.PositionableFeature = PositionableFeature;
