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
var DragAndDropService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const string_1 = require("../utils/string");
const icon_1 = require("../utils/icon");
const array_1 = require("../utils/array");
const browser_1 = require("../utils/browser");
const dom_1 = require("../utils/dom");
const function_1 = require("../utils/function");
var DragSourceType;
(function (DragSourceType) {
    DragSourceType[DragSourceType["ToolPanel"] = 0] = "ToolPanel";
    DragSourceType[DragSourceType["HeaderCell"] = 1] = "HeaderCell";
    DragSourceType[DragSourceType["RowDrag"] = 2] = "RowDrag";
    DragSourceType[DragSourceType["ChartPanel"] = 3] = "ChartPanel";
})(DragSourceType = exports.DragSourceType || (exports.DragSourceType = {}));
var VerticalDirection;
(function (VerticalDirection) {
    VerticalDirection[VerticalDirection["Up"] = 0] = "Up";
    VerticalDirection[VerticalDirection["Down"] = 1] = "Down";
})(VerticalDirection = exports.VerticalDirection || (exports.VerticalDirection = {}));
var HorizontalDirection;
(function (HorizontalDirection) {
    HorizontalDirection[HorizontalDirection["Left"] = 0] = "Left";
    HorizontalDirection[HorizontalDirection["Right"] = 1] = "Right";
})(HorizontalDirection = exports.HorizontalDirection || (exports.HorizontalDirection = {}));
let DragAndDropService = DragAndDropService_1 = class DragAndDropService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.dragSourceAndParamsList = [];
        this.dropTargets = [];
    }
    init() {
        this.ePinnedIcon = icon_1.createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.eHideIcon = icon_1.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = icon_1.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = icon_1.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = icon_1.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = icon_1.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = icon_1.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = icon_1.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = icon_1.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
    }
    addDragSource(dragSource, allowTouch = false) {
        const params = {
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        };
        this.dragSourceAndParamsList.push({ params: params, dragSource: dragSource });
        this.dragService.addDragSource(params, allowTouch);
    }
    removeDragSource(dragSource) {
        const sourceAndParams = this.dragSourceAndParamsList.find(item => item.dragSource === dragSource);
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            array_1.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    }
    clearDragSourceParamsList() {
        this.dragSourceAndParamsList.forEach(sourceAndParams => this.dragService.removeDragSource(sourceAndParams.params));
        this.dragSourceAndParamsList.length = 0;
    }
    nudge() {
        if (this.dragging) {
            this.onDragging(this.eventLastTime, true);
        }
    }
    onDragStart(dragSource, mouseEvent) {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragItem = this.dragSource.getDragItem();
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        if (this.dragSource.onDragStarted) {
            this.dragSource.onDragStarted();
        }
        this.createGhost();
    }
    onDragStop(mouseEvent) {
        this.eventLastTime = null;
        this.dragging = false;
        if (this.dragSource.onDragStopped) {
            this.dragSource.onDragStopped();
        }
        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            const draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null, null, false);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    }
    onDragging(mouseEvent, fromNudge) {
        var _a, _b, _c, _d;
        const hDirection = this.getHorizontalDirection(mouseEvent);
        const vDirection = this.getVerticalDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        const validDropTargets = this.dropTargets.filter(target => this.isMouseOnDropTarget(mouseEvent, target));
        const dropTarget = this.findCurrentDropTarget(mouseEvent, validDropTargets);
        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            if (this.lastDropTarget !== null && dropTarget === null) {
                (_b = (_a = this.dragSource).onGridExit) === null || _b === void 0 ? void 0 : _b.call(_a, this.dragItem);
            }
            if (this.lastDropTarget === null && dropTarget !== null) {
                (_d = (_c = this.dragSource).onGridEnter) === null || _d === void 0 ? void 0 : _d.call(_c, this.dragItem);
            }
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget && dropTarget.onDragging) {
            const draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    }
    getAllContainersFromDropTarget(dropTarget) {
        const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        const containers = [[dropTarget.getContainer()]];
        return secondaryContainers ? containers.concat(secondaryContainers) : containers;
    }
    allContainersIntersect(mouseEvent, containers) {
        for (const container of containers) {
            const rect = container.getBoundingClientRect();
            // if element is not visible, then width and height are zero
            if (rect.width === 0 || rect.height === 0) {
                return false;
            }
            const horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX < rect.right;
            const verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY < rect.bottom;
            if (!horizontalFit || !verticalFit) {
                return false;
            }
        }
        return true;
    }
    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    isMouseOnDropTarget(mouseEvent, dropTarget) {
        const allContainersFromDropTarget = this.getAllContainersFromDropTarget(dropTarget);
        let mouseOverTarget = false;
        for (const currentContainers of allContainersFromDropTarget) {
            if (this.allContainersIntersect(mouseEvent, currentContainers)) {
                mouseOverTarget = true;
                break;
            }
        }
        if (dropTarget.targetContainsSource && !dropTarget.getContainer().contains(this.dragSource.eElement)) {
            return false;
        }
        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type, this.dragSource.eElement);
    }
    findCurrentDropTarget(mouseEvent, validDropTargets) {
        const len = validDropTargets.length;
        if (len === 0) {
            return null;
        }
        if (len === 1) {
            return validDropTargets[0];
        }
        const eDocument = this.gridOptionsWrapper.getDocument();
        // elementsFromPoint return a list of elements under
        // the mouseEvent sorted from topMost to bottomMost
        const elementStack = eDocument.elementsFromPoint(mouseEvent.clientX, mouseEvent.clientY);
        // loop over the sorted elementStack to find which dropTarget comes first
        for (const el of elementStack) {
            for (const dropTarget of validDropTargets) {
                const containers = array_1.flatten(this.getAllContainersFromDropTarget(dropTarget));
                if (containers.indexOf(el) !== -1) {
                    return dropTarget;
                }
            }
        }
        // we should never hit this point of the code because only
        // valid dropTargets should be provided to this method.
        return null;
    }
    enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge) {
        if (!dropTarget) {
            return;
        }
        if (dropTarget.onDragEnter) {
            const dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragEnter(dragEnterEvent);
        }
        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    }
    leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge) {
        if (!this.lastDropTarget) {
            return;
        }
        if (this.lastDropTarget.onDragLeave) {
            const dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget.onDragLeave(dragLeaveEvent);
        }
        this.setGhostIcon(null);
    }
    addDropTarget(dropTarget) {
        this.dropTargets.push(dropTarget);
    }
    removeDropTarget(dropTarget) {
        this.dropTargets = this.dropTargets.filter(target => target.getContainer() !== dropTarget.getContainer());
    }
    hasExternalDropZones() {
        return this.dropTargets.some(zones => zones.external);
    }
    findExternalZone(params) {
        const externalTargets = this.dropTargets.filter(target => target.external);
        return externalTargets.find(zone => zone.getContainer() === params.getContainer()) || null;
    }
    getHorizontalDirection(event) {
        const clientX = this.eventLastTime && this.eventLastTime.clientX;
        const eClientX = event.clientX;
        if (clientX === eClientX) {
            return null;
        }
        return clientX > eClientX ? HorizontalDirection.Left : HorizontalDirection.Right;
    }
    getVerticalDirection(event) {
        const clientY = this.eventLastTime && this.eventLastTime.clientY;
        const eClientY = event.clientY;
        if (clientY === eClientY) {
            return null;
        }
        return clientY > eClientY ? VerticalDirection.Up : VerticalDirection.Down;
    }
    createDropTargetEvent(dropTarget, event, hDirection, vDirection, fromNudge) {
        // localise x and y to the target
        const dropZoneTarget = dropTarget.getContainer();
        const rect = dropZoneTarget.getBoundingClientRect();
        const { gridApi: api, columnApi, dragItem, dragSource } = this;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { event, x, y, vDirection, hDirection, dragSource, fromNudge, dragItem: dragItem, api, columnApi, dropZoneTarget };
    }
    positionGhost(event) {
        const ghost = this.eGhost;
        if (!ghost) {
            return;
        }
        const ghostRect = ghost.getBoundingClientRect();
        const ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        const browserWidth = browser_1.getBodyWidth() - 2;
        const browserHeight = browser_1.getBodyHeight() - 2;
        let top = event.pageY - (ghostHeight / 2);
        let left = event.pageX - 10;
        const eDocument = this.gridOptionsWrapper.getDocument();
        const win = (eDocument.defaultView || window);
        const windowScrollY = win.pageYOffset || eDocument.documentElement.scrollTop;
        const windowScrollX = win.pageXOffset || eDocument.documentElement.scrollLeft;
        // check ghost is not positioned outside of the browser
        if (browserWidth > 0 && ((left + ghost.clientWidth) > (browserWidth + windowScrollX))) {
            left = browserWidth + windowScrollX - ghost.clientWidth;
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight > 0 && ((top + ghost.clientHeight) > (browserHeight + windowScrollY))) {
            top = browserHeight + windowScrollY - ghost.clientHeight;
        }
        if (top < 0) {
            top = 0;
        }
        ghost.style.left = `${left}px`;
        ghost.style.top = `${top}px`;
    }
    removeGhost() {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }
        this.eGhost = null;
    }
    createGhost() {
        this.eGhost = dom_1.loadTemplate(DragAndDropService_1.GHOST_TEMPLATE);
        this.mouseEventService.stampTopLevelGridCompWithGridInstance(this.eGhost);
        const { theme } = this.environment.getTheme();
        if (theme) {
            this.eGhost.classList.add(theme);
        }
        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon');
        this.setGhostIcon(null);
        const eText = this.eGhost.querySelector('.ag-dnd-ghost-label');
        let dragItemName = this.dragSource.dragItemName;
        if (function_1.isFunction(dragItemName)) {
            dragItemName = dragItemName();
        }
        eText.innerHTML = string_1.escapeString(dragItemName) || '';
        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        const eDocument = this.gridOptionsWrapper.getDocument();
        let targetEl = null;
        try {
            targetEl = eDocument.fullscreenElement;
        }
        catch (e) {
            // some environments like SalesForce will throw errors
            // simply by trying to read the fullscreenElement property
        }
        finally {
            if (!targetEl) {
                targetEl = eDocument.querySelector('body');
            }
        }
        this.eGhostParent = targetEl;
        if (!this.eGhostParent) {
            console.warn('AG Grid: could not find document body, it is needed for dragging columns');
        }
        else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    }
    setGhostIcon(iconName, shake = false) {
        dom_1.clearElement(this.eGhostIcon);
        let eIcon = null;
        if (!iconName) {
            iconName = this.dragSource.defaultIconName || DragAndDropService_1.ICON_NOT_ALLOWED;
        }
        switch (iconName) {
            case DragAndDropService_1.ICON_PINNED:
                eIcon = this.ePinnedIcon;
                break;
            case DragAndDropService_1.ICON_MOVE:
                eIcon = this.eMoveIcon;
                break;
            case DragAndDropService_1.ICON_LEFT:
                eIcon = this.eLeftIcon;
                break;
            case DragAndDropService_1.ICON_RIGHT:
                eIcon = this.eRightIcon;
                break;
            case DragAndDropService_1.ICON_GROUP:
                eIcon = this.eGroupIcon;
                break;
            case DragAndDropService_1.ICON_AGGREGATE:
                eIcon = this.eAggregateIcon;
                break;
            case DragAndDropService_1.ICON_PIVOT:
                eIcon = this.ePivotIcon;
                break;
            case DragAndDropService_1.ICON_NOT_ALLOWED:
                eIcon = this.eDropNotAllowedIcon;
                break;
            case DragAndDropService_1.ICON_HIDE:
                eIcon = this.eHideIcon;
                break;
        }
        this.eGhostIcon.classList.toggle('ag-shake-left-to-right', shake);
        if (eIcon === this.eHideIcon && this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns()) {
            return;
        }
        if (eIcon) {
            this.eGhostIcon.appendChild(eIcon);
        }
    }
};
DragAndDropService.ICON_PINNED = 'pinned';
DragAndDropService.ICON_MOVE = 'move';
DragAndDropService.ICON_LEFT = 'left';
DragAndDropService.ICON_RIGHT = 'right';
DragAndDropService.ICON_GROUP = 'group';
DragAndDropService.ICON_AGGREGATE = 'aggregate';
DragAndDropService.ICON_PIVOT = 'pivot';
DragAndDropService.ICON_NOT_ALLOWED = 'notAllowed';
DragAndDropService.ICON_HIDE = 'hide';
DragAndDropService.GHOST_TEMPLATE = `<div class="ag-dnd-ghost ag-unselectable">
            <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>
            <div class="ag-dnd-ghost-label"></div>
        </div>`;
__decorate([
    context_1.Autowired('dragService')
], DragAndDropService.prototype, "dragService", void 0);
__decorate([
    context_1.Autowired('mouseEventService')
], DragAndDropService.prototype, "mouseEventService", void 0);
__decorate([
    context_1.Autowired('environment')
], DragAndDropService.prototype, "environment", void 0);
__decorate([
    context_1.Autowired('columnApi')
], DragAndDropService.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('gridApi')
], DragAndDropService.prototype, "gridApi", void 0);
__decorate([
    context_1.PostConstruct
], DragAndDropService.prototype, "init", null);
__decorate([
    context_1.PreDestroy
], DragAndDropService.prototype, "clearDragSourceParamsList", null);
DragAndDropService = DragAndDropService_1 = __decorate([
    context_1.Bean('dragAndDropService')
], DragAndDropService);
exports.DragAndDropService = DragAndDropService;
