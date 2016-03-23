/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var context_1 = require("../context/context");
var logger_1 = require("../logger");
var context_2 = require("../context/context");
var headerTemplateLoader_1 = require("../headerRendering/headerTemplateLoader");
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_3 = require("../context/context");
var svgFactory_1 = require("../svgFactory");
var dragService_1 = require("./dragService");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var DragAndDropService = (function () {
    function DragAndDropService() {
        this.dropTargets = [];
        this.ePinnedIcon = svgFactory.createPinIcon();
        this.ePlusIcon = svgFactory.createPlusIcon();
        this.eHiddenIcon = svgFactory.createColumnHiddenIcon();
        this.eMoveIcon = svgFactory.createMoveIcon();
        this.eLeftIcon = svgFactory.createLeftIcon();
        this.eRightIcon = svgFactory.createRightIcon();
        this.eGroupIcon = svgFactory.createGroupIcon();
    }
    DragAndDropService.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
        this.eBody = document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    };
    // we do not need to clean up drag sources, as we are just adding a listener to the element.
    // when the element is disposed, the drag source is also disposed, even though this service
    // remains. this is a bit different to normal 'addListener' methods
    DragAndDropService.prototype.addDragSource = function (params) {
        this.dragService.addDragSource({
            eElement: params.eElement,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        });
        //params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
    };
    DragAndDropService.prototype.nudge = function () {
        if (this.dragging) {
            this.onDragging(this.eventLastTime);
        }
    };
    DragAndDropService.prototype.onDragStart = function (dragSource, mouseEvent) {
        this.logger.log('startDrag');
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragSource.dragItem.setMoving(true);
        this.dragItem = this.dragSource.dragItem;
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        this.createGhost();
    };
    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
        this.logger.log('onDragStop');
        this.eventLastTime = null;
        this.dragging = false;
        this.dragItem.setMoving(false);
        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    };
    DragAndDropService.prototype.onDragging = function (mouseEvent) {
        var direction = this.workOutDirection(mouseEvent);
        this.eventLastTime = mouseEvent;
        this.positionGhost(mouseEvent);
        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = utils_1.Utils.find(this.dropTargets, function (dropTarget) {
            var targetsToCheck = [dropTarget.eContainer];
            if (dropTarget.eSecondaryContainers) {
                targetsToCheck = targetsToCheck.concat(dropTarget.eSecondaryContainers);
            }
            var gotMatch = false;
            targetsToCheck.forEach(function (eContainer) {
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
                    gotMatch = true;
                }
            });
            return gotMatch;
        });
        if (dropTarget !== this.lastDropTarget) {
            if (this.lastDropTarget) {
                this.logger.log('onDragLeave');
                var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, direction);
                this.lastDropTarget.onDragLeave(dragLeaveEvent);
                this.setGhostIcon(null);
            }
            if (dropTarget) {
                this.logger.log('onDragEnter');
                var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
                dropTarget.onDragEnter(dragEnterEvent);
                this.setGhostIcon(dropTarget.iconName);
            }
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
            dropTarget.onDragging(draggingEvent);
        }
    };
    DragAndDropService.prototype.addDropTarget = function (dropTarget) {
        this.dropTargets.push(dropTarget);
    };
    DragAndDropService.prototype.workOutDirection = function (event) {
        var direction;
        if (this.eventLastTime.clientX > event.clientX) {
            direction = DragAndDropService.DIRECTION_LEFT;
        }
        else if (this.eventLastTime.clientX < event.clientX) {
            direction = DragAndDropService.DIRECTION_RIGHT;
        }
        else {
            direction = null;
        }
        return direction;
    };
    DragAndDropService.prototype.createDropTargetEvent = function (dropTarget, event, direction) {
        // localise x and y to the target component
        var rect = dropTarget.eContainer.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var dropTargetEvent = {
            event: event,
            x: x,
            y: y,
            direction: direction,
            dragItem: this.dragItem,
            dragSource: this.dragSource
        };
        return dropTargetEvent;
    };
    DragAndDropService.prototype.positionGhost = function (event) {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = utils_1.Utils.getBodyWidth() - 2;
        var browserHeight = utils_1.Utils.getBodyHeight() - 2;
        // put ghost vertically in middle of cursor
        var top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        var left = event.pageX - 30;
        // check ghost is not positioned outside of the browser
        if (browserWidth > 0) {
            if ((left + this.eGhost.clientWidth) > browserWidth) {
                left = browserWidth - this.eGhost.clientWidth;
            }
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight > 0) {
            if ((top + this.eGhost.clientHeight) > browserHeight) {
                top = browserHeight - this.eGhost.clientHeight;
            }
        }
        if (top < 0) {
            top = 0;
        }
        this.eGhost.style.left = left + 'px';
        this.eGhost.style.top = top + 'px';
    };
    DragAndDropService.prototype.removeGhost = function () {
        if (this.eGhost) {
            this.eBody.removeChild(this.eGhost);
        }
        this.eGhost = null;
    };
    DragAndDropService.prototype.createGhost = function () {
        var dragItem = this.dragSource.dragItem;
        this.eGhost = utils_1.Utils.loadTemplate(headerTemplateLoader_1.HeaderTemplateLoader.HEADER_CELL_DND_TEMPLATE);
        this.eGhostIcon = this.eGhost.querySelector('#eGhostIcon');
        if (this.lastDropTarget) {
            this.setGhostIcon(this.lastDropTarget.iconName);
        }
        var eText = this.eGhost.querySelector('#agText');
        if (dragItem.getColDef().headerName) {
            eText.innerHTML = dragItem.getColDef().headerName;
        }
        else {
            eText.innerHTML = dragItem.getColId();
        }
        this.eGhost.style.width = dragItem.getActualWidth() + 'px';
        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        this.eBody.appendChild(this.eGhost);
    };
    DragAndDropService.prototype.setGhostIcon = function (iconName, shake) {
        if (shake === void 0) { shake = false; }
        utils_1.Utils.removeAllChildren(this.eGhostIcon);
        var eIcon;
        switch (iconName) {
            case DragAndDropService.ICON_ADD:
                eIcon = this.ePlusIcon;
                break;
            case DragAndDropService.ICON_PINNED:
                eIcon = this.ePinnedIcon;
                break;
            case DragAndDropService.ICON_MOVE:
                eIcon = this.eMoveIcon;
                break;
            case DragAndDropService.ICON_LEFT:
                eIcon = this.eLeftIcon;
                break;
            case DragAndDropService.ICON_RIGHT:
                eIcon = this.eRightIcon;
                break;
            case DragAndDropService.ICON_GROUP:
                eIcon = this.eGroupIcon;
                break;
            default:
                eIcon = this.eHiddenIcon;
                break;
        }
        this.eGhostIcon.appendChild(eIcon);
        utils_1.Utils.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    };
    DragAndDropService.DIRECTION_LEFT = 'left';
    DragAndDropService.DIRECTION_RIGHT = 'right';
    DragAndDropService.ICON_PINNED = 'pinned';
    DragAndDropService.ICON_ADD = 'add';
    DragAndDropService.ICON_MOVE = 'move';
    DragAndDropService.ICON_LEFT = 'left';
    DragAndDropService.ICON_RIGHT = 'right';
    DragAndDropService.ICON_GROUP = 'group';
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], DragAndDropService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('dragService'), 
        __metadata('design:type', dragService_1.DragService)
    ], DragAndDropService.prototype, "dragService", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], DragAndDropService.prototype, "agWire", null);
    DragAndDropService = __decorate([
        context_2.Bean('dragAndDropService'), 
        __metadata('design:paramtypes', [])
    ], DragAndDropService);
    return DragAndDropService;
})();
exports.DragAndDropService = DragAndDropService;
