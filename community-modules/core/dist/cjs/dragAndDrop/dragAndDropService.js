/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var string_1 = require("../utils/string");
var icon_1 = require("../utils/icon");
var array_1 = require("../utils/array");
var generic_1 = require("../utils/generic");
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
        this.ePinnedIcon = icon_1.createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.eHideIcon = icon_1.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = icon_1.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = icon_1.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = icon_1.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = icon_1.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = icon_1.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = icon_1.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = icon_1.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
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
        var sourceAndParams = generic_1.find(this.dragSourceAndParamsList, function (item) { return item.dragSource === dragSource; });
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            array_1.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    };
    DragAndDropService.prototype.clearDragSourceParamsList = function () {
        var _this = this;
        this.dragSourceAndParamsList.forEach(function (sourceAndParams) { return _this.dragService.removeDragSource(sourceAndParams.params); });
        this.dragSourceAndParamsList.length = 0;
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
        var hDirection = this.getHorizontalDirection(mouseEvent);
        var vDirection = this.getVerticalDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        var validDropTargets = this.dropTargets.filter(function (target) { return _this.isMouseOnDropTarget(mouseEvent, target); });
        var len = validDropTargets.length;
        var dropTarget = null;
        if (len > 0) {
            dropTarget = len === 1
                ? validDropTargets[0]
                // the current mouse position could intersect with more than 1 element
                // if they are nested. In that case we need to get the most specific
                // container, which is the one that does not contain any other targets.
                : validDropTargets.reduce(function (prevTarget, currTarget) {
                    if (!prevTarget) {
                        return currTarget;
                    }
                    var prevContainer = prevTarget.getContainer();
                    var currContainer = currTarget.getContainer();
                    if (prevContainer.contains(currContainer)) {
                        return currTarget;
                    }
                    return prevTarget;
                });
        }
        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget && dropTarget.onDragging) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
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
    DragAndDropService.prototype.getAllContainersFromDropTarget = function (dropTarget) {
        var containers = [dropTarget.getContainer()];
        var secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        if (secondaryContainers) {
            containers = containers.concat(secondaryContainers);
        }
        return containers;
    };
    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    DragAndDropService.prototype.isMouseOnDropTarget = function (mouseEvent, dropTarget) {
        var mouseOverTarget = false;
        this.getAllContainersFromDropTarget(dropTarget)
            .filter(function (eContainer) { return eContainer; }) // secondary can be missing
            .forEach(function (eContainer) {
            var rect = eContainer.getBoundingClientRect();
            // if element is not visible, then width and height are zero
            if (rect.width === 0 || rect.height === 0) {
                return;
            }
            var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX < rect.right;
            var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY < rect.bottom;
            if (horizontalFit && verticalFit) {
                mouseOverTarget = true;
            }
        });
        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type);
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
        return generic_1.find(externalTargets, function (zone) { return zone.getContainer() === params.getContainer(); });
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
        var usrDocument = this.gridOptionsWrapper.getDocument();
        var windowScrollY = window.pageYOffset || usrDocument.documentElement.scrollTop;
        var windowScrollX = window.pageXOffset || usrDocument.documentElement.scrollLeft;
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
        var theme = this.environment.getTheme().theme;
        if (theme) {
            dom_1.addCssClass(this.eGhost, theme);
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
        var usrDocument = this.gridOptionsWrapper.getDocument();
        var targetEl = usrDocument.fullscreenElement || usrDocument.querySelector('body');
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
        dom_1.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
        if (eIcon === this.eHideIcon && this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns()) {
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
    return DragAndDropService;
}(beanStub_1.BeanStub));
exports.DragAndDropService = DragAndDropService;

//# sourceMappingURL=dragAndDropService.js.map
