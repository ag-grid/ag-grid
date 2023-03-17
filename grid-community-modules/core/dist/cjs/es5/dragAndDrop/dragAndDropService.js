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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragAndDropService = exports.HorizontalDirection = exports.VerticalDirection = exports.DragSourceType = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var string_1 = require("../utils/string");
var icon_1 = require("../utils/icon");
var array_1 = require("../utils/array");
var browser_1 = require("../utils/browser");
var dom_1 = require("../utils/dom");
var function_1 = require("../utils/function");
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
var DragAndDropService = /** @class */ (function (_super) {
    __extends(DragAndDropService, _super);
    function DragAndDropService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragSourceAndParamsList = [];
        _this.dropTargets = [];
        return _this;
    }
    DragAndDropService_1 = DragAndDropService;
    DragAndDropService.prototype.init = function () {
        this.ePinnedIcon = icon_1.createIcon('columnMovePin', this.gridOptionsService, null);
        this.eHideIcon = icon_1.createIcon('columnMoveHide', this.gridOptionsService, null);
        this.eMoveIcon = icon_1.createIcon('columnMoveMove', this.gridOptionsService, null);
        this.eLeftIcon = icon_1.createIcon('columnMoveLeft', this.gridOptionsService, null);
        this.eRightIcon = icon_1.createIcon('columnMoveRight', this.gridOptionsService, null);
        this.eGroupIcon = icon_1.createIcon('columnMoveGroup', this.gridOptionsService, null);
        this.eAggregateIcon = icon_1.createIcon('columnMoveValue', this.gridOptionsService, null);
        this.ePivotIcon = icon_1.createIcon('columnMovePivot', this.gridOptionsService, null);
        this.eDropNotAllowedIcon = icon_1.createIcon('dropNotAllowed', this.gridOptionsService, null);
    };
    DragAndDropService.prototype.addDragSource = function (dragSource, allowTouch) {
        if (allowTouch === void 0) { allowTouch = false; }
        var params = {
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        };
        this.dragSourceAndParamsList.push({ params: params, dragSource: dragSource });
        this.dragService.addDragSource(params, allowTouch);
    };
    DragAndDropService.prototype.removeDragSource = function (dragSource) {
        var sourceAndParams = this.dragSourceAndParamsList.find(function (item) { return item.dragSource === dragSource; });
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            array_1.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    };
    DragAndDropService.prototype.clearDragSourceParamsList = function () {
        var _this = this;
        this.dragSourceAndParamsList.forEach(function (sourceAndParams) { return _this.dragService.removeDragSource(sourceAndParams.params); });
        this.dragSourceAndParamsList.length = 0;
        this.dropTargets.length = 0;
    };
    DragAndDropService.prototype.nudge = function () {
        if (this.dragging) {
            this.onDragging(this.eventLastTime, true);
        }
    };
    DragAndDropService.prototype.onDragStart = function (dragSource, mouseEvent) {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragItem = this.dragSource.getDragItem();
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        if (this.dragSource.onDragStarted) {
            this.dragSource.onDragStarted();
        }
        this.createGhost();
    };
    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
        this.eventLastTime = null;
        this.dragging = false;
        if (this.dragSource.onDragStopped) {
            this.dragSource.onDragStopped();
        }
        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null, null, false);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    };
    DragAndDropService.prototype.onDragging = function (mouseEvent, fromNudge) {
        var _this = this;
        var _a, _b, _c, _d;
        var hDirection = this.getHorizontalDirection(mouseEvent);
        var vDirection = this.getVerticalDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        var validDropTargets = this.dropTargets.filter(function (target) { return _this.isMouseOnDropTarget(mouseEvent, target); });
        var dropTarget = this.findCurrentDropTarget(mouseEvent, validDropTargets);
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
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    };
    DragAndDropService.prototype.getAllContainersFromDropTarget = function (dropTarget) {
        var secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        var containers = [[dropTarget.getContainer()]];
        return secondaryContainers ? containers.concat(secondaryContainers) : containers;
    };
    DragAndDropService.prototype.allContainersIntersect = function (mouseEvent, containers) {
        var e_1, _a;
        try {
            for (var containers_1 = __values(containers), containers_1_1 = containers_1.next(); !containers_1_1.done; containers_1_1 = containers_1.next()) {
                var container = containers_1_1.value;
                var rect = container.getBoundingClientRect();
                // if element is not visible, then width and height are zero
                if (rect.width === 0 || rect.height === 0) {
                    return false;
                }
                var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX < rect.right;
                var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY < rect.bottom;
                if (!horizontalFit || !verticalFit) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (containers_1_1 && !containers_1_1.done && (_a = containers_1.return)) _a.call(containers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    DragAndDropService.prototype.isMouseOnDropTarget = function (mouseEvent, dropTarget) {
        var e_2, _a;
        var allContainersFromDropTarget = this.getAllContainersFromDropTarget(dropTarget);
        var mouseOverTarget = false;
        try {
            for (var allContainersFromDropTarget_1 = __values(allContainersFromDropTarget), allContainersFromDropTarget_1_1 = allContainersFromDropTarget_1.next(); !allContainersFromDropTarget_1_1.done; allContainersFromDropTarget_1_1 = allContainersFromDropTarget_1.next()) {
                var currentContainers = allContainersFromDropTarget_1_1.value;
                if (this.allContainersIntersect(mouseEvent, currentContainers)) {
                    mouseOverTarget = true;
                    break;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (allContainersFromDropTarget_1_1 && !allContainersFromDropTarget_1_1.done && (_a = allContainersFromDropTarget_1.return)) _a.call(allContainersFromDropTarget_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (dropTarget.targetContainsSource && !dropTarget.getContainer().contains(this.dragSource.eElement)) {
            return false;
        }
        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type, this.dragSource.eElement);
    };
    DragAndDropService.prototype.findCurrentDropTarget = function (mouseEvent, validDropTargets) {
        var e_3, _a, e_4, _b;
        var len = validDropTargets.length;
        if (len === 0) {
            return null;
        }
        if (len === 1) {
            return validDropTargets[0];
        }
        var rootNode = this.gridOptionsService.getRootNode();
        // elementsFromPoint return a list of elements under
        // the mouseEvent sorted from topMost to bottomMost
        var elementStack = rootNode.elementsFromPoint(mouseEvent.clientX, mouseEvent.clientY);
        try {
            // loop over the sorted elementStack to find which dropTarget comes first
            for (var elementStack_1 = __values(elementStack), elementStack_1_1 = elementStack_1.next(); !elementStack_1_1.done; elementStack_1_1 = elementStack_1.next()) {
                var el = elementStack_1_1.value;
                try {
                    for (var validDropTargets_1 = (e_4 = void 0, __values(validDropTargets)), validDropTargets_1_1 = validDropTargets_1.next(); !validDropTargets_1_1.done; validDropTargets_1_1 = validDropTargets_1.next()) {
                        var dropTarget = validDropTargets_1_1.value;
                        var containers = array_1.flatten(this.getAllContainersFromDropTarget(dropTarget));
                        if (containers.indexOf(el) !== -1) {
                            return dropTarget;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (validDropTargets_1_1 && !validDropTargets_1_1.done && (_b = validDropTargets_1.return)) _b.call(validDropTargets_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (elementStack_1_1 && !elementStack_1_1.done && (_a = elementStack_1.return)) _a.call(elementStack_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // we should never hit this point of the code because only
        // valid dropTargets should be provided to this method.
        return null;
    };
    DragAndDropService.prototype.enterDragTargetIfExists = function (dropTarget, mouseEvent, hDirection, vDirection, fromNudge) {
        if (!dropTarget) {
            return;
        }
        if (dropTarget.onDragEnter) {
            var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragEnter(dragEnterEvent);
        }
        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    };
    DragAndDropService.prototype.leaveLastTargetIfExists = function (mouseEvent, hDirection, vDirection, fromNudge) {
        if (!this.lastDropTarget) {
            return;
        }
        if (this.lastDropTarget.onDragLeave) {
            var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget.onDragLeave(dragLeaveEvent);
        }
        this.setGhostIcon(null);
    };
    DragAndDropService.prototype.addDropTarget = function (dropTarget) {
        this.dropTargets.push(dropTarget);
    };
    DragAndDropService.prototype.removeDropTarget = function (dropTarget) {
        this.dropTargets = this.dropTargets.filter(function (target) { return target.getContainer() !== dropTarget.getContainer(); });
    };
    DragAndDropService.prototype.hasExternalDropZones = function () {
        return this.dropTargets.some(function (zones) { return zones.external; });
    };
    DragAndDropService.prototype.findExternalZone = function (params) {
        var externalTargets = this.dropTargets.filter(function (target) { return target.external; });
        return externalTargets.find(function (zone) { return zone.getContainer() === params.getContainer(); }) || null;
    };
    DragAndDropService.prototype.getHorizontalDirection = function (event) {
        var clientX = this.eventLastTime && this.eventLastTime.clientX;
        var eClientX = event.clientX;
        if (clientX === eClientX) {
            return null;
        }
        return clientX > eClientX ? HorizontalDirection.Left : HorizontalDirection.Right;
    };
    DragAndDropService.prototype.getVerticalDirection = function (event) {
        var clientY = this.eventLastTime && this.eventLastTime.clientY;
        var eClientY = event.clientY;
        if (clientY === eClientY) {
            return null;
        }
        return clientY > eClientY ? VerticalDirection.Up : VerticalDirection.Down;
    };
    DragAndDropService.prototype.createDropTargetEvent = function (dropTarget, event, hDirection, vDirection, fromNudge) {
        // localise x and y to the target
        var dropZoneTarget = dropTarget.getContainer();
        var rect = dropZoneTarget.getBoundingClientRect();
        var _a = this, api = _a.gridApi, columnApi = _a.columnApi, dragItem = _a.dragItem, dragSource = _a.dragSource;
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return { event: event, x: x, y: y, vDirection: vDirection, hDirection: hDirection, dragSource: dragSource, fromNudge: fromNudge, dragItem: dragItem, api: api, columnApi: columnApi, dropZoneTarget: dropZoneTarget };
    };
    DragAndDropService.prototype.positionGhost = function (event) {
        var ghost = this.eGhost;
        if (!ghost) {
            return;
        }
        var ghostRect = ghost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = browser_1.getBodyWidth() - 2;
        var browserHeight = browser_1.getBodyHeight() - 2;
        var top = event.pageY - (ghostHeight / 2);
        var left = event.pageX - 10;
        var eDocument = this.gridOptionsService.getDocument();
        var win = (eDocument.defaultView || window);
        var windowScrollY = win.pageYOffset || eDocument.documentElement.scrollTop;
        var windowScrollX = win.pageXOffset || eDocument.documentElement.scrollLeft;
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
        ghost.style.left = left + "px";
        ghost.style.top = top + "px";
    };
    DragAndDropService.prototype.removeGhost = function () {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }
        this.eGhost = null;
    };
    DragAndDropService.prototype.createGhost = function () {
        this.eGhost = dom_1.loadTemplate(DragAndDropService_1.GHOST_TEMPLATE);
        this.mouseEventService.stampTopLevelGridCompWithGridInstance(this.eGhost);
        var theme = this.environment.getTheme().theme;
        if (theme) {
            this.eGhost.classList.add(theme);
        }
        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon');
        this.setGhostIcon(null);
        var eText = this.eGhost.querySelector('.ag-dnd-ghost-label');
        var dragItemName = this.dragSource.dragItemName;
        if (function_1.isFunction(dragItemName)) {
            dragItemName = dragItemName();
        }
        eText.innerHTML = string_1.escapeString(dragItemName) || '';
        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        var eDocument = this.gridOptionsService.getDocument();
        var targetEl = null;
        try {
            targetEl = eDocument.fullscreenElement;
        }
        catch (e) {
            // some environments like SalesForce will throw errors
            // simply by trying to read the fullscreenElement property
        }
        finally {
            if (!targetEl) {
                var rootNode = this.gridOptionsService.getRootNode();
                var body = rootNode.querySelector('body');
                if (body) {
                    targetEl = body;
                }
                else if (rootNode instanceof ShadowRoot) {
                    targetEl = rootNode;
                }
                else {
                    targetEl = rootNode === null || rootNode === void 0 ? void 0 : rootNode.documentElement;
                }
            }
        }
        this.eGhostParent = targetEl;
        if (!this.eGhostParent) {
            console.warn('AG Grid: could not find document body, it is needed for dragging columns');
        }
        else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    };
    DragAndDropService.prototype.setGhostIcon = function (iconName, shake) {
        if (shake === void 0) { shake = false; }
        dom_1.clearElement(this.eGhostIcon);
        var eIcon = null;
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
        if (eIcon === this.eHideIcon && this.gridOptionsService.is('suppressDragLeaveHidesColumns')) {
            return;
        }
        if (eIcon) {
            this.eGhostIcon.appendChild(eIcon);
        }
    };
    var DragAndDropService_1;
    DragAndDropService.ICON_PINNED = 'pinned';
    DragAndDropService.ICON_MOVE = 'move';
    DragAndDropService.ICON_LEFT = 'left';
    DragAndDropService.ICON_RIGHT = 'right';
    DragAndDropService.ICON_GROUP = 'group';
    DragAndDropService.ICON_AGGREGATE = 'aggregate';
    DragAndDropService.ICON_PIVOT = 'pivot';
    DragAndDropService.ICON_NOT_ALLOWED = 'notAllowed';
    DragAndDropService.ICON_HIDE = 'hide';
    DragAndDropService.GHOST_TEMPLATE = "<div class=\"ag-dnd-ghost ag-unselectable\">\n            <span class=\"ag-dnd-ghost-icon ag-shake-left-to-right\"></span>\n            <div class=\"ag-dnd-ghost-label\"></div>\n        </div>";
    __decorate([
        context_1.Autowired('dragService')
    ], DragAndDropService.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('mouseEventService')
    ], DragAndDropService.prototype, "mouseEventService", void 0);
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
    return DragAndDropService;
}(beanStub_1.BeanStub));
exports.DragAndDropService = DragAndDropService;
