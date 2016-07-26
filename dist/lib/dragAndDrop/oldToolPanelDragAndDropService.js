/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
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
var utils_1 = require('../utils');
var logger_1 = require("../logger");
var context_1 = require("../context/context");
var context_2 = require("../context/context");
/** Functionality for internal DnD functionality between GUI widgets. Eg this service is used to drag columns
 * from the 'available columns' list and putting them into the 'grouped columns' in the tool panel.
 * This service is NOT used by the column headers for resizing and moving, that is a different use case. */
var OldToolPanelDragAndDropService = (function () {
    function OldToolPanelDragAndDropService() {
        this.destroyFunctions = [];
    }
    OldToolPanelDragAndDropService.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
        // need to clean this up, add to 'finished' logic in grid
        var mouseUpListener = this.stopDragging.bind(this);
        document.addEventListener('mouseup', mouseUpListener);
        this.destroyFunctions.push(function () { document.removeEventListener('mouseup', mouseUpListener); });
    };
    OldToolPanelDragAndDropService.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) { return func(); });
        document.removeEventListener('mouseup', this.mouseUpEventListener);
    };
    OldToolPanelDragAndDropService.prototype.stopDragging = function () {
        if (this.dragItem) {
            this.setDragCssClasses(this.dragItem.eDragSource, false);
            this.dragItem = null;
        }
    };
    OldToolPanelDragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
    };
    OldToolPanelDragAndDropService.prototype.addDragSource = function (eDragSource, dragSourceCallback) {
        this.setDragCssClasses(eDragSource, false);
        eDragSource.addEventListener('mousedown', this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
    };
    OldToolPanelDragAndDropService.prototype.onMouseDownDragSource = function (eDragSource, dragSourceCallback) {
        if (this.dragItem) {
            this.stopDragging();
        }
        var data;
        if (dragSourceCallback.getData) {
            data = dragSourceCallback.getData();
        }
        var containerId;
        if (dragSourceCallback.getContainerId) {
            containerId = dragSourceCallback.getContainerId();
        }
        this.dragItem = {
            eDragSource: eDragSource,
            data: data,
            containerId: containerId
        };
        this.setDragCssClasses(this.dragItem.eDragSource, true);
    };
    OldToolPanelDragAndDropService.prototype.addDropTarget = function (eDropTarget, dropTargetCallback) {
        var _this = this;
        var mouseIn = false;
        var acceptDrag = false;
        eDropTarget.addEventListener('mouseover', function () {
            if (!mouseIn) {
                mouseIn = true;
                if (_this.dragItem) {
                    acceptDrag = dropTargetCallback.acceptDrag(_this.dragItem);
                }
                else {
                    acceptDrag = false;
                }
            }
        });
        eDropTarget.addEventListener('mouseout', function () {
            if (acceptDrag) {
                dropTargetCallback.noDrop();
            }
            mouseIn = false;
            acceptDrag = false;
        });
        eDropTarget.addEventListener('mouseup', function () {
            // dragItem should never be null, checking just in case
            if (acceptDrag && _this.dragItem) {
                dropTargetCallback.drop(_this.dragItem);
            }
        });
    };
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], OldToolPanelDragAndDropService.prototype, "agWire", null);
    __decorate([
        context_1.PreDestroy, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], OldToolPanelDragAndDropService.prototype, "destroy", null);
    OldToolPanelDragAndDropService = __decorate([
        context_1.Bean('oldToolPanelDragAndDropService'), 
        __metadata('design:paramtypes', [])
    ], OldToolPanelDragAndDropService);
    return OldToolPanelDragAndDropService;
})();
exports.OldToolPanelDragAndDropService = OldToolPanelDragAndDropService;
