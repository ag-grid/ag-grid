/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnController_1 = require("./columnController/columnController");
var eventService_1 = require("./eventService");
var logger_1 = require("./logger");
var events_1 = require("./events");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var context_3 = require("./context/context");
var context_4 = require("./context/context");
var AlignedGridsService = /** @class */ (function () {
    function AlignedGridsService() {
        // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        this.consuming = false;
    }
    AlignedGridsService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
    };
    AlignedGridsService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    AlignedGridsService.prototype.init = function () {
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_BODY_SCROLL, this.fireScrollEvent.bind(this));
    };
    // common logic across all the fire methods
    AlignedGridsService.prototype.fireEvent = function (callback) {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }
        // iterate through the aligned grids, and pass each aligned grid service to the callback
        var otherGrids = this.gridOptionsWrapper.getAlignedGrids();
        if (otherGrids) {
            otherGrids.forEach(function (otherGridOptions) {
                if (otherGridOptions.api) {
                    var alignedGridService = otherGridOptions.api.__getAlignedGridService();
                    callback(alignedGridService);
                }
            });
        }
    };
    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    AlignedGridsService.prototype.onEvent = function (callback) {
        this.consuming = true;
        callback();
        this.consuming = false;
    };
    AlignedGridsService.prototype.fireColumnEvent = function (event) {
        this.fireEvent(function (alignedGridsService) {
            alignedGridsService.onColumnEvent(event);
        });
    };
    AlignedGridsService.prototype.fireScrollEvent = function (event) {
        if (event.direction !== 'horizontal') {
            return;
        }
        this.fireEvent(function (alignedGridsService) {
            alignedGridsService.onScrollEvent(event);
        });
    };
    AlignedGridsService.prototype.onScrollEvent = function (event) {
        var _this = this;
        this.onEvent(function () {
            _this.gridPanel.setHorizontalScrollPosition(event.left);
        });
    };
    AlignedGridsService.prototype.getMasterColumns = function (event) {
        var result = [];
        if (event.columns) {
            event.columns.forEach(function (column) {
                result.push(column);
            });
        }
        else if (event.column) {
            result.push(event.column);
        }
        return result;
    };
    AlignedGridsService.prototype.getColumnIds = function (event) {
        var result = [];
        if (event.columns) {
            event.columns.forEach(function (column) {
                result.push(column.getColId());
            });
        }
        else if (event.column) {
            result.push(event.column.getColId());
        }
        return result;
    };
    AlignedGridsService.prototype.onColumnEvent = function (event) {
        var _this = this;
        this.onEvent(function () {
            switch (event.type) {
                case events_1.Events.EVENT_COLUMN_MOVED:
                case events_1.Events.EVENT_COLUMN_VISIBLE:
                case events_1.Events.EVENT_COLUMN_PINNED:
                case events_1.Events.EVENT_COLUMN_RESIZED:
                    var colEvent = event;
                    _this.processColumnEvent(colEvent);
                    break;
                case events_1.Events.EVENT_COLUMN_GROUP_OPENED:
                    var groupOpenedEvent = event;
                    _this.processGroupOpenedEvent(groupOpenedEvent);
                    break;
                case events_1.Events.EVENT_COLUMN_PIVOT_CHANGED:
                    // we cannot support pivoting with aligned grids as the columns will be out of sync as the
                    // grids will have columns created based on the row data of the grid.
                    console.warn('ag-Grid: pivoting is not supported with aligned grids. ' +
                        'You can only use one of these features at a time in a grid.');
                    break;
            }
        });
    };
    AlignedGridsService.prototype.processGroupOpenedEvent = function (groupOpenedEvent) {
        // likewise for column group
        var masterColumnGroup = groupOpenedEvent.columnGroup;
        var otherColumnGroup;
        if (masterColumnGroup) {
            var groupId = masterColumnGroup.getGroupId();
            otherColumnGroup = this.columnController.getOriginalColumnGroup(groupId);
        }
        if (masterColumnGroup && !otherColumnGroup) {
            return;
        }
        this.logger.log('onColumnEvent-> processing ' + groupOpenedEvent + ' expanded = ' + masterColumnGroup.isExpanded());
        this.columnController.setColumnGroupOpened(otherColumnGroup, masterColumnGroup.isExpanded(), "alignedGridChanged");
    };
    AlignedGridsService.prototype.processColumnEvent = function (colEvent) {
        var _this = this;
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        var masterColumn = colEvent.column;
        var otherColumn;
        if (masterColumn) {
            otherColumn = this.columnController.getPrimaryColumn(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) {
            return;
        }
        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        var columnIds = this.getColumnIds(colEvent);
        var masterColumns = this.getMasterColumns(colEvent);
        switch (colEvent.type) {
            case events_1.Events.EVENT_COLUMN_MOVED:
                var movedEvent = colEvent;
                this.logger.log("onColumnEvent-> processing " + colEvent.type + " toIndex = " + movedEvent.toIndex);
                this.columnController.moveColumns(columnIds, movedEvent.toIndex, "alignedGridChanged");
                break;
            case events_1.Events.EVENT_COLUMN_VISIBLE:
                var visibleEvent = colEvent;
                this.logger.log("onColumnEvent-> processing " + colEvent.type + " visible = " + visibleEvent.visible);
                this.columnController.setColumnsVisible(columnIds, visibleEvent.visible, "alignedGridChanged");
                break;
            case events_1.Events.EVENT_COLUMN_PINNED:
                var pinnedEvent = colEvent;
                this.logger.log("onColumnEvent-> processing " + colEvent.type + " pinned = " + pinnedEvent.pinned);
                this.columnController.setColumnsPinned(columnIds, pinnedEvent.pinned, "alignedGridChanged");
                break;
            case events_1.Events.EVENT_COLUMN_RESIZED:
                var resizedEvent_1 = colEvent;
                masterColumns.forEach(function (column) {
                    _this.logger.log("onColumnEvent-> processing " + colEvent.type + " actualWidth = " + column.getActualWidth());
                    _this.columnController.setColumnWidth(column.getColId(), column.getActualWidth(), false, resizedEvent_1.finished, "alignedGridChanged");
                });
                break;
        }
        var isVerticalScrollShowing = this.gridPanel.isVerticalScrollShowing();
        var alignedGrids = this.gridOptionsWrapper.getAlignedGrids();
        alignedGrids.forEach(function (grid) {
            grid.api.setAlwaysShowVerticalScroll(isVerticalScrollShowing);
        });
    };
    __decorate([
        context_3.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AlignedGridsService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], AlignedGridsService.prototype, "columnController", void 0);
    __decorate([
        context_3.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], AlignedGridsService.prototype, "eventService", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], AlignedGridsService.prototype, "setBeans", null);
    __decorate([
        context_4.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AlignedGridsService.prototype, "init", null);
    AlignedGridsService = __decorate([
        context_1.Bean('alignedGridsService')
    ], AlignedGridsService);
    return AlignedGridsService;
}());
exports.AlignedGridsService = AlignedGridsService;
