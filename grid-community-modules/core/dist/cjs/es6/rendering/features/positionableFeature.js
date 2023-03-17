/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.PositionableFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const dom_1 = require("../../utils/dom");
const RESIZE_CONTAINER_STYLE = 'ag-resizer-wrapper';
const RESIZE_TEMPLATE = /* html */ `<div class="${RESIZE_CONTAINER_STYLE}">
        <div ref="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
        <div ref="eTopResizer" class="ag-resizer ag-resizer-top"></div>
        <div ref="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
        <div ref="eRightResizer" class="ag-resizer ag-resizer-right"></div>
        <div ref="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
        <div ref="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
        <div ref="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
        <div ref="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
    </div>`;
class PositionableFeature extends beanStub_1.BeanStub {
    constructor(element, config) {
        super();
        this.element = element;
        this.dragStartPosition = {
            x: 0,
            y: 0
        };
        this.position = {
            x: 0,
            y: 0
        };
        this.lastSize = {
            width: -1,
            height: -1
        };
        this.positioned = false;
        this.resizersAdded = false;
        this.resizeListeners = [];
        this.boundaryEl = null;
        this.isResizing = false;
        this.isMoving = false;
        this.resizable = {};
        this.movable = false;
        this.currentResizer = null;
        this.config = Object.assign({}, { popup: false }, config);
    }
    center() {
        const { clientHeight, clientWidth } = this.offsetParent;
        const x = (clientWidth / 2) - (this.getWidth() / 2);
        const y = (clientHeight / 2) - (this.getHeight() / 2);
        this.offsetElement(x, y);
    }
    initialisePosition() {
        const { centered, forcePopupParentAsOffsetParent, minWidth, width, minHeight, height, x, y } = this.config;
        if (!this.offsetParent) {
            this.setOffsetParent();
        }
        let computedMinHeight = 0;
        let computedMinWidth = 0;
        // here we don't use the main offset parent but the element's offsetParent
        // in order to calculated the minWidth and minHeight correctly
        const isVisible = !!this.element.offsetParent;
        if (isVisible) {
            const boundaryEl = this.findBoundaryElement();
            const offsetParentComputedStyles = window.getComputedStyle(boundaryEl);
            if (offsetParentComputedStyles.minWidth != null) {
                const paddingWidth = boundaryEl.offsetWidth - this.element.offsetWidth;
                computedMinWidth = parseInt(offsetParentComputedStyles.minWidth, 10) - paddingWidth;
            }
            if (offsetParentComputedStyles.minHeight != null) {
                const paddingHeight = boundaryEl.offsetHeight - this.element.offsetHeight;
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
            const top = parseFloat(this.boundaryEl.style.top);
            const left = parseFloat(this.boundaryEl.style.left);
            this.offsetElement(isNaN(left) ? 0 : left, isNaN(top) ? 0 : top);
        }
        this.positioned = !!this.offsetParent;
    }
    isPositioned() {
        return this.positioned;
    }
    getPosition() {
        return this.position;
    }
    setMovable(movable, moveElement) {
        if (!this.config.popup || movable === this.movable) {
            return;
        }
        this.movable = movable;
        const params = this.moveElementDragListener || {
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
    }
    setResizable(resizable) {
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
        Object.keys(resizable).forEach((side) => {
            const resizableStructure = resizable;
            const isSideResizable = !!resizableStructure[side];
            const resizerEl = this.getResizerElement(side);
            const params = {
                dragStartPixels: 0,
                eElement: resizerEl,
                onDragStart: (e) => this.onResizeStart(e, side),
                onDragging: this.onResize.bind(this),
                onDragStop: (e) => this.onResizeEnd(e, side),
            };
            if (isSideResizable || (!this.isAlive() && !isSideResizable)) {
                if (isSideResizable) {
                    this.dragService.addDragSource(params);
                    this.resizeListeners.push(params);
                    resizerEl.style.pointerEvents = 'all';
                }
                else {
                    resizerEl.style.pointerEvents = 'none';
                }
                this.resizable[side] = isSideResizable;
            }
        });
    }
    removeSizeFromEl() {
        this.element.style.removeProperty('height');
        this.element.style.removeProperty('width');
        this.element.style.removeProperty('flex');
    }
    restoreLastSize() {
        this.element.style.flex = '0 0 auto';
        const { height, width } = this.lastSize;
        if (width !== -1) {
            this.element.style.width = `${width}px`;
        }
        if (height !== -1) {
            this.element.style.height = `${height}px`;
        }
    }
    getHeight() {
        return this.element.offsetHeight;
    }
    setHeight(height) {
        const { popup, forcePopupParentAsOffsetParent } = this.config;
        const eGui = this.element;
        let isPercent = false;
        if (typeof height === 'string' && height.indexOf('%') !== -1) {
            dom_1.setFixedHeight(eGui, height);
            height = dom_1.getAbsoluteHeight(eGui);
            isPercent = true;
        }
        else if (this.positioned) {
            const elRect = this.element.getBoundingClientRect();
            const parentRect = this.offsetParent.getBoundingClientRect();
            height = Math.max(this.minHeight, height);
            const { clientHeight } = this.offsetParent;
            if (clientHeight) {
                const yPosition = popup ? this.position.y : elRect.top;
                const parentTop = popup ? 0 : parentRect.top;
                // When `forcePopupParentAsOffsetParent`, there may be elements that appear after the resizable element, but aren't included in the height.
                // Take these into account here
                let additionalHeight = 0;
                if (forcePopupParentAsOffsetParent && this.boundaryEl) {
                    const { bottom } = this.boundaryEl.getBoundingClientRect();
                    additionalHeight = bottom - elRect.bottom;
                }
                const availableHeight = clientHeight + parentTop - yPosition - additionalHeight;
                if (height > availableHeight) {
                    height = availableHeight;
                }
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
                eGui.style.height = `${height}px`;
                eGui.style.flex = '0 0 auto';
                this.lastSize.height = typeof height === 'number' ? height : parseFloat(height);
            }
        }
        else {
            eGui.style.maxHeight = 'unset';
            eGui.style.minHeight = 'unset';
        }
    }
    getWidth() {
        return this.element.offsetWidth;
    }
    setWidth(width) {
        const eGui = this.element;
        const { popup } = this.config;
        let isPercent = false;
        if (typeof width === 'string' && width.indexOf('%') !== -1) {
            dom_1.setFixedWidth(eGui, width);
            width = dom_1.getAbsoluteWidth(eGui);
            isPercent = true;
        }
        else if (this.positioned) {
            width = Math.max(this.minWidth, width);
            const { clientWidth } = this.offsetParent;
            const xPosition = popup ? this.position.x : this.element.getBoundingClientRect().left;
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
                eGui.style.width = `${width}px`;
                eGui.style.flex = ' unset';
                this.lastSize.width = typeof width === 'number' ? width : parseFloat(width);
            }
        }
        else {
            eGui.style.maxWidth = 'unset';
            eGui.style.minWidth = 'unset';
        }
    }
    offsetElement(x = 0, y = 0) {
        const ePopup = this.config.forcePopupParentAsOffsetParent ? this.boundaryEl : this.element;
        this.popupService.positionPopup({
            ePopup,
            keepWithinBounds: true,
            skipObserver: this.movable || this.isResizable(),
            updatePosition: () => ({ x, y })
        });
        this.setPosition(parseFloat(ePopup.style.left), parseFloat(ePopup.style.top));
    }
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
    updateDragStartPosition(x, y) {
        this.dragStartPosition = { x, y };
    }
    calculateMouseMovement(params) {
        const { e, isLeft, isTop, anywhereWithin, topBuffer } = params;
        const xDiff = e.clientX - this.dragStartPosition.x;
        const yDiff = e.clientY - this.dragStartPosition.y;
        const movementX = this.shouldSkipX(e, !!isLeft, !!anywhereWithin, xDiff) ? 0 : xDiff;
        const movementY = this.shouldSkipY(e, !!isTop, topBuffer, yDiff) ? 0 : yDiff;
        return { movementX, movementY };
    }
    shouldSkipX(e, isLeft, anywhereWithin, diff) {
        const elRect = this.element.getBoundingClientRect();
        const parentRect = this.offsetParent.getBoundingClientRect();
        const boundaryElRect = this.boundaryEl.getBoundingClientRect();
        const xPosition = this.config.popup ? this.position.x : elRect.left;
        // skip if cursor is outside of popupParent horizontally
        let skipX = ((xPosition <= 0 && parentRect.left >= e.clientX) ||
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
    }
    shouldSkipY(e, isTop, topBuffer = 0, diff) {
        const elRect = this.element.getBoundingClientRect();
        const parentRect = this.offsetParent.getBoundingClientRect();
        const boundaryElRect = this.boundaryEl.getBoundingClientRect();
        const yPosition = this.config.popup ? this.position.y : elRect.top;
        // skip if cursor is outside of popupParent vertically
        let skipY = ((yPosition <= 0 && parentRect.top >= e.clientY) ||
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
    }
    createResizeMap() {
        const eGui = this.element;
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
    }
    addResizers() {
        if (this.resizersAdded) {
            return;
        }
        const eGui = this.element;
        if (!eGui) {
            return;
        }
        const parser = new DOMParser();
        const resizers = parser.parseFromString(RESIZE_TEMPLATE, 'text/html').body;
        eGui.appendChild(resizers.firstChild);
        this.createResizeMap();
        this.resizersAdded = true;
    }
    removeResizers() {
        this.resizerMap = undefined;
        const resizerEl = this.element.querySelector(`.${RESIZE_CONTAINER_STYLE}`);
        if (resizerEl) {
            this.element.removeChild(resizerEl);
        }
        this.resizersAdded = false;
    }
    getResizerElement(side) {
        return this.resizerMap[side].element;
    }
    onResizeStart(e, side) {
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
        const { popup, forcePopupParentAsOffsetParent } = this.config;
        if (!popup && !forcePopupParentAsOffsetParent) {
            this.applySizeToSiblings(this.currentResizer.isBottom || this.currentResizer.isTop);
        }
        this.isResizing = true;
        this.updateDragStartPosition(e.clientX, e.clientY);
    }
    getSiblings() {
        const element = this.element;
        const parent = element.parentElement;
        if (!parent) {
            return null;
        }
        return Array.prototype.slice.call(parent.children).filter((el) => !el.classList.contains('ag-hidden'));
    }
    getMinSizeOfSiblings() {
        const siblings = this.getSiblings() || [];
        let height = 0;
        let width = 0;
        for (let i = 0; i < siblings.length; i++) {
            const currentEl = siblings[i];
            const isFlex = !!currentEl.style.flex && currentEl.style.flex !== '0 0 auto';
            if (currentEl === this.element) {
                continue;
            }
            let nextHeight = this.minHeight || 0;
            let nextWidth = this.minWidth || 0;
            if (isFlex) {
                const computedStyle = window.getComputedStyle(currentEl);
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
        return { height, width };
    }
    applySizeToSiblings(vertical) {
        let containerToFlex = null;
        const siblings = this.getSiblings();
        if (!siblings) {
            return;
        }
        for (let i = 0; i < siblings.length; i++) {
            const el = siblings[i];
            if (el === containerToFlex) {
                continue;
            }
            if (vertical) {
                el.style.height = `${el.offsetHeight}px`;
            }
            else {
                el.style.width = `${el.offsetWidth}px`;
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
    }
    isResizable() {
        return Object.values(this.resizable).some(value => value);
    }
    onResize(e) {
        if (!this.isResizing || !this.currentResizer) {
            return;
        }
        const { popup, forcePopupParentAsOffsetParent } = this.config;
        const { isTop, isRight, isBottom, isLeft } = this.currentResizer;
        const isHorizontal = isRight || isLeft;
        const isVertical = isBottom || isTop;
        const { movementX, movementY } = this.calculateMouseMovement({ e, isLeft, isTop });
        const xPosition = this.position.x;
        const yPosition = this.position.y;
        let offsetLeft = 0;
        let offsetTop = 0;
        if (isHorizontal && movementX) {
            const direction = isLeft ? -1 : 1;
            const oldWidth = this.getWidth();
            const newWidth = oldWidth + (movementX * direction);
            let skipWidth = false;
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
            const direction = isTop ? -1 : 1;
            const oldHeight = this.getHeight();
            const newHeight = oldHeight + (movementY * direction);
            let skipHeight = false;
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
    }
    onResizeEnd(e, side) {
        this.isResizing = false;
        this.currentResizer = null;
        this.boundaryEl = null;
        const params = {
            type: 'resize',
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi
        };
        this.element.classList.remove('ag-resizing');
        this.resizerMap[side].element.classList.remove('ag-active');
        this.dispatchEvent(params);
    }
    refreshSize() {
        const eGui = this.element;
        if (this.config.popup) {
            if (!this.config.width) {
                this.setWidth(eGui.offsetWidth);
            }
            if (!this.config.height) {
                this.setHeight(eGui.offsetHeight);
            }
        }
    }
    onMoveStart(e) {
        this.boundaryEl = this.findBoundaryElement();
        if (!this.positioned) {
            this.initialisePosition();
        }
        this.isMoving = true;
        this.element.classList.add('ag-moving');
        this.updateDragStartPosition(e.clientX, e.clientY);
    }
    onMove(e) {
        if (!this.isMoving) {
            return;
        }
        const { x, y } = this.position;
        let topBuffer;
        if (this.config.calculateTopBuffer) {
            topBuffer = this.config.calculateTopBuffer();
        }
        const { movementX, movementY } = this.calculateMouseMovement({
            e,
            isTop: true,
            anywhereWithin: true,
            topBuffer
        });
        this.offsetElement(x + movementX, y + movementY);
        this.updateDragStartPosition(e.clientX, e.clientY);
    }
    onMoveEnd() {
        this.isMoving = false;
        this.boundaryEl = null;
        this.element.classList.remove('ag-moving');
    }
    setOffsetParent() {
        if (this.config.forcePopupParentAsOffsetParent) {
            this.offsetParent = this.popupService.getPopupParent();
        }
        else {
            this.offsetParent = this.element.offsetParent;
        }
    }
    findBoundaryElement() {
        let el = this.element;
        while (el) {
            if (window.getComputedStyle(el).position !== 'static') {
                return el;
            }
            el = el.parentElement;
        }
        return this.element;
    }
    clearResizeListeners() {
        while (this.resizeListeners.length) {
            const params = this.resizeListeners.pop();
            this.dragService.removeDragSource(params);
        }
    }
    destroy() {
        super.destroy();
        if (this.moveElementDragListener) {
            this.dragService.removeDragSource(this.moveElementDragListener);
        }
        this.clearResizeListeners();
        this.removeResizers();
    }
}
__decorate([
    context_1.Autowired('popupService')
], PositionableFeature.prototype, "popupService", void 0);
__decorate([
    context_1.Autowired('dragService')
], PositionableFeature.prototype, "dragService", void 0);
exports.PositionableFeature = PositionableFeature;
