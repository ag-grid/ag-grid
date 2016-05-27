/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.2.5
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
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_3 = require("../context/context");
var svgFactory_1 = require("../svgFactory");
var dragService_1 = require("./dragService");
var columnController_1 = require("../columnController/columnController");
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
    DragAndDropService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
        this.eBody = document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    };
    // we do not need to clean up drag sources, as we are just adding a listener to the element.
    // when the element is disposed, the drag source is also disposed, even though this service
    // remains. this is a bit different to normal 'addListener' methods
    DragAndDropService.prototype.addDragSource = function (dragSource) {
        this.dragService.addDragSource({
            eElement: dragSource.eElement,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        });
    };
    DragAndDropService.prototype.nudge = function () {
        if (this.dragging) {
            this.onDragging(this.eventLastTime);
        }
    };
    DragAndDropService.prototype.onDragStart = function (dragSource, mouseEvent) {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragSource.dragItem.forEach(function (column) { return column.setMoving(true); });
        this.dragItem = this.dragSource.dragItem;
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        this.createGhost();
    };
    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
        this.eventLastTime = null;
        this.dragging = false;
        this.dragItem.forEach(function (column) { return column.setMoving(false); });
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
        var dropTarget = utils_1.Utils.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));
        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, direction);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, direction);
            this.lastDropTarget = dropTarget;
        }
        else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
            dropTarget.onDragging(draggingEvent);
        }
    };
    DragAndDropService.prototype.enterDragTargetIfExists = function (dropTarget, mouseEvent, direction) {
        if (!dropTarget) {
            return;
        }
        var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
        dropTarget.onDragEnter(dragEnterEvent);
        this.setGhostIcon(dropTarget.iconName);
    };
    DragAndDropService.prototype.leaveLastTargetIfExists = function (mouseEvent, direction) {
        if (!this.lastDropTarget) {
            return;
        }
        var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, direction);
        this.lastDropTarget.onDragLeave(dragLeaveEvent);
        this.setGhostIcon(null);
    };
    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    DragAndDropService.prototype.isMouseOnDropTarget = function (mouseEvent, dropTarget) {
        var ePrimaryAndSecondaryContainers = [dropTarget.eContainer];
        if (dropTarget.eSecondaryContainers) {
            ePrimaryAndSecondaryContainers = ePrimaryAndSecondaryContainers.concat(dropTarget.eSecondaryContainers);
        }
        var gotMatch = false;
        ePrimaryAndSecondaryContainers.forEach(function (eContainer) {
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
        this.eGhost = utils_1.Utils.loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon');
        if (this.lastDropTarget) {
            this.setGhostIcon(this.lastDropTarget.iconName);
        }
        var eText = this.eGhost.querySelector('.ag-dnd-ghost-label');
        eText.innerHTML = this.dragSource.dragItemName;
        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        this.eBody.appendChild(this.eGhost);
    };
    /*
    // took this out as it wasn't making sense when dragging from the side panel, as it was possible to drag
       columns that were not visible - which is fine, as you are selecting from all columns here. what should be
       done is we check what columns to include in the drag depending on what started to drag - but that is to
       much coding for now, so just hardcoding the width to 200px for now.
        private getActualWidth(columns: Column[]): number {
            var totalColWidth = 0;
    
            // we only include displayed columns so hidden columns do not add space as this would look weird,
            // if for example moving a group with 5 cols, but only 1 displayed, we want ghost to be just the width
            // of the 1 displayed column
            var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
            var displayedColumns = _.filter(columns, column => allDisplayedColumns.indexOf(column) >= 0 );
    
            displayedColumns.forEach( column => totalColWidth += column.getActualWidth() );
    
            return totalColWidth;
        }
    */
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
    DragAndDropService.GHOST_TEMPLATE = '<div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label">' +
        '  </div>' +
        '</div>';
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], DragAndDropService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('dragService'), 
        __metadata('design:type', dragService_1.DragService)
    ], DragAndDropService.prototype, "dragService", void 0);
    __decorate([
        context_3.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], DragAndDropService.prototype, "columnController", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], DragAndDropService.prototype, "setBeans", null);
    DragAndDropService = __decorate([
        context_2.Bean('dragAndDropService'), 
        __metadata('design:paramtypes', [])
    ], DragAndDropService);
    return DragAndDropService;
})();
exports.DragAndDropService = DragAndDropService;
