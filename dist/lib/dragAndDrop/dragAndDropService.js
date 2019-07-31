/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../logger");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var dragService_1 = require("./dragService");
var columnController_1 = require("../columnController/columnController");
var environment_1 = require("../environment");
var utils_1 = require("../utils");
var DragSourceType;
(function (DragSourceType) {
    DragSourceType[DragSourceType["ToolPanel"] = 0] = "ToolPanel";
    DragSourceType[DragSourceType["HeaderCell"] = 1] = "HeaderCell";
    DragSourceType[DragSourceType["RowDrag"] = 2] = "RowDrag";
})(DragSourceType = exports.DragSourceType || (exports.DragSourceType = {}));
var VDirection;
(function (VDirection) {
    VDirection[VDirection["Up"] = 0] = "Up";
    VDirection[VDirection["Down"] = 1] = "Down";
})(VDirection = exports.VDirection || (exports.VDirection = {}));
var HDirection;
(function (HDirection) {
    HDirection[HDirection["Left"] = 0] = "Left";
    HDirection[HDirection["Right"] = 1] = "Right";
})(HDirection = exports.HDirection || (exports.HDirection = {}));
var DragAndDropService = /** @class */ (function () {
    function DragAndDropService() {
        this.dragSourceAndParamsList = [];
        this.dropTargets = [];
    }
    DragAndDropService_1 = DragAndDropService;
    DragAndDropService.prototype.init = function () {
        this.ePinnedIcon = utils_1._.createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.ePlusIcon = utils_1._.createIcon('columnMoveAdd', this.gridOptionsWrapper, null);
        this.eHiddenIcon = utils_1._.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = utils_1._.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = utils_1._.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = utils_1._.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = utils_1._.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = utils_1._.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = utils_1._.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = utils_1._.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
    };
    DragAndDropService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
    };
    DragAndDropService.prototype.getStringType = function (type) {
        switch (type) {
            case DragSourceType.RowDrag: return 'row';
            case DragSourceType.HeaderCell: return 'headerCell';
            case DragSourceType.ToolPanel: return 'toolPanel';
            default:
                console.warn("ag-Grid: bug - unknown drag type " + type);
                return null;
        }
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
        var sourceAndParams = utils_1._.find(this.dragSourceAndParamsList, function (item) { return item.dragSource === dragSource; });
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            utils_1._.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    };
    DragAndDropService.prototype.destroy = function () {
        var _this = this;
        this.dragSourceAndParamsList.forEach(function (sourceAndParams) {
            _this.dragService.removeDragSource(sourceAndParams.params);
        });
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
        this.dragItem = this.dragSource.dragItemCallback();
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        if (this.dragSource.dragStarted) {
            this.dragSource.dragStarted();
        }
        this.createGhost();
    };
    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
        this.eventLastTime = null;
        this.dragging = false;
        if (this.dragSource.dragStopped) {
            this.dragSource.dragStopped();
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
        var hDirection = this.workOutHDirection(mouseEvent);
        var vDirection = this.workOutVDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = utils_1._.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));
        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    };
    DragAndDropService.prototype.enterDragTargetIfExists = function (dropTarget, mouseEvent, hDirection, vDirection, fromNudge) {
        if (!dropTarget) {
            return;
        }
        var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
        dropTarget.onDragEnter(dragEnterEvent);
        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    };
    DragAndDropService.prototype.leaveLastTargetIfExists = function (mouseEvent, hDirection, vDirection, fromNudge) {
        if (!this.lastDropTarget) {
            return;
        }
        var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);
        this.lastDropTarget.onDragLeave(dragLeaveEvent);
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
        var allContainers = this.getAllContainersFromDropTarget(dropTarget);
        var mouseOverTarget = false;
        allContainers.forEach(function (eContainer) {
            if (!eContainer) {
                return;
            } // secondary can be missing
            var rect = eContainer.getBoundingClientRect();
            // if element is not visible, then width and height are zero
            if (rect.width === 0 || rect.height === 0) {
                return;
            }
            var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX <= rect.right;
            var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
            //console.log(`rect.width = ${rect.width} || rect.height = ${rect.height} ## verticalFit = ${verticalFit}, horizontalFit = ${horizontalFit}, `);
            if (horizontalFit && verticalFit) {
                mouseOverTarget = true;
            }
        });
        if (mouseOverTarget) {
            var mouseOverTargetAndInterested = dropTarget.isInterestedIn(this.dragSource.type);
            return mouseOverTargetAndInterested;
        }
        else {
            return false;
        }
    };
    DragAndDropService.prototype.addDropTarget = function (dropTarget) {
        this.dropTargets.push(dropTarget);
    };
    DragAndDropService.prototype.workOutHDirection = function (event) {
        if (this.eventLastTime.clientX > event.clientX) {
            return HDirection.Left;
        }
        else if (this.eventLastTime.clientX < event.clientX) {
            return HDirection.Right;
        }
        else {
            return null;
        }
    };
    DragAndDropService.prototype.workOutVDirection = function (event) {
        if (this.eventLastTime.clientY > event.clientY) {
            return VDirection.Up;
        }
        else if (this.eventLastTime.clientY < event.clientY) {
            return VDirection.Down;
        }
        else {
            return null;
        }
    };
    DragAndDropService.prototype.createDropTargetEvent = function (dropTarget, event, hDirection, vDirection, fromNudge) {
        // localise x and y to the target component
        var rect = dropTarget.getContainer().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var dropTargetEvent = {
            event: event,
            x: x,
            y: y,
            vDirection: vDirection,
            hDirection: hDirection,
            dragSource: this.dragSource,
            fromNudge: fromNudge,
            dragItem: this.dragItem
        };
        return dropTargetEvent;
    };
    DragAndDropService.prototype.positionGhost = function (event) {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = utils_1._.getBodyWidth() - 2;
        var browserHeight = utils_1._.getBodyHeight() - 2;
        // put ghost vertically in middle of cursor
        var top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        var left = event.pageX - 30;
        var usrDocument = this.gridOptionsWrapper.getDocument();
        var windowScrollY = window.pageYOffset || usrDocument.documentElement.scrollTop;
        var windowScrollX = window.pageXOffset || usrDocument.documentElement.scrollLeft;
        // check ghost is not positioned outside of the browser
        if (browserWidth > 0) {
            if ((left + this.eGhost.clientWidth) > (browserWidth + windowScrollX)) {
                left = browserWidth + windowScrollX - this.eGhost.clientWidth;
            }
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight > 0) {
            if ((top + this.eGhost.clientHeight) > (browserHeight + windowScrollY)) {
                top = browserHeight + windowScrollY - this.eGhost.clientHeight;
            }
        }
        if (top < 0) {
            top = 0;
        }
        this.eGhost.style.left = left + 'px';
        this.eGhost.style.top = top + 'px';
    };
    DragAndDropService.prototype.removeGhost = function () {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }
        this.eGhost = null;
    };
    DragAndDropService.prototype.createGhost = function () {
        this.eGhost = utils_1._.loadTemplate(DragAndDropService_1.GHOST_TEMPLATE);
        var theme = this.environment.getTheme();
        if (theme) {
            utils_1._.addCssClass(this.eGhost, theme);
        }
        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon');
        this.setGhostIcon(null);
        var eText = this.eGhost.querySelector('.ag-dnd-ghost-label');
        eText.innerHTML = utils_1._.escape(this.dragSource.dragItemName);
        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        var usrDocument = this.gridOptionsWrapper.getDocument();
        this.eGhostParent = usrDocument.querySelector('body');
        if (!this.eGhostParent) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
        else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    };
    DragAndDropService.prototype.setGhostIcon = function (iconName, shake) {
        if (shake === void 0) { shake = false; }
        utils_1._.clearElement(this.eGhostIcon);
        var eIcon;
        switch (iconName) {
            case DragAndDropService_1.ICON_ADD:
                eIcon = this.ePlusIcon;
                break;
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
            default:
                eIcon = this.eHiddenIcon;
                break;
        }
        this.eGhostIcon.appendChild(eIcon);
        utils_1._.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    };
    var DragAndDropService_1;
    DragAndDropService.ICON_PINNED = 'pinned';
    DragAndDropService.ICON_ADD = 'add';
    DragAndDropService.ICON_MOVE = 'move';
    DragAndDropService.ICON_LEFT = 'left';
    DragAndDropService.ICON_RIGHT = 'right';
    DragAndDropService.ICON_GROUP = 'group';
    DragAndDropService.ICON_AGGREGATE = 'aggregate';
    DragAndDropService.ICON_PIVOT = 'pivot';
    DragAndDropService.ICON_NOT_ALLOWED = 'notAllowed';
    DragAndDropService.GHOST_TEMPLATE = '<div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label">' +
        '  </div>' +
        '</div>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], DragAndDropService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('dragService'),
        __metadata("design:type", dragService_1.DragService)
    ], DragAndDropService.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('environment'),
        __metadata("design:type", environment_1.Environment)
    ], DragAndDropService.prototype, "environment", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], DragAndDropService.prototype, "columnController", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DragAndDropService.prototype, "init", null);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], DragAndDropService.prototype, "setBeans", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DragAndDropService.prototype, "destroy", null);
    DragAndDropService = DragAndDropService_1 = __decorate([
        context_1.Bean('dragAndDropService')
    ], DragAndDropService);
    return DragAndDropService;
}());
exports.DragAndDropService = DragAndDropService;
