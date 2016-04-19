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
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnController_1 = require("./columnController/columnController");
var gridPanel_1 = require("./gridPanel/gridPanel");
var eventService_1 = require("./eventService");
var logger_1 = require("./logger");
var events_1 = require("./events");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var context_3 = require("./context/context");
var context_4 = require("./context/context");
var MasterSlaveService = (function () {
    function MasterSlaveService() {
        // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        this.consuming = false;
    }
    MasterSlaveService.prototype.agWire = function (loggerFactory) {
        this.logger = loggerFactory.create('MasterSlaveService');
    };
    MasterSlaveService.prototype.init = function () {
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
    };
    // common logic across all the fire methods
    MasterSlaveService.prototype.fireEvent = function (callback) {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }
        // iterate through the slave grids, and pass each slave service to the callback
        var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
        if (slaveGrids) {
            slaveGrids.forEach(function (slaveGridOptions) {
                if (slaveGridOptions.api) {
                    var slaveService = slaveGridOptions.api.__getMasterSlaveService();
                    callback(slaveService);
                }
            });
        }
    };
    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    MasterSlaveService.prototype.onEvent = function (callback) {
        this.consuming = true;
        callback();
        this.consuming = false;
    };
    MasterSlaveService.prototype.fireColumnEvent = function (event) {
        this.fireEvent(function (slaveService) {
            slaveService.onColumnEvent(event);
        });
    };
    MasterSlaveService.prototype.fireHorizontalScrollEvent = function (horizontalScroll) {
        this.fireEvent(function (slaveService) {
            slaveService.onScrollEvent(horizontalScroll);
        });
    };
    MasterSlaveService.prototype.onScrollEvent = function (horizontalScroll) {
        var _this = this;
        this.onEvent(function () {
            _this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
        });
    };
    MasterSlaveService.prototype.getMasterColumns = function (event) {
        var result = [];
        if (event.getColumn()) {
            result.push(event.getColumn());
        }
        if (event.getColumns()) {
            event.getColumns().forEach(function (column) {
                result.push(column);
            });
        }
        return result;
    };
    MasterSlaveService.prototype.getColumnIds = function (event) {
        var result = [];
        if (event.getColumn()) {
            result.push(event.getColumn().getColId());
        }
        if (event.getColumns()) {
            event.getColumns().forEach(function (column) {
                result.push(column.getColId());
            });
        }
        return result;
    };
    MasterSlaveService.prototype.onColumnEvent = function (event) {
        var _this = this;
        this.onEvent(function () {
            // the column in the event is from the master grid. need to
            // look up the equivalent from this (slave) grid
            var masterColumn = event.getColumn();
            var slaveColumn;
            if (masterColumn) {
                slaveColumn = _this.columnController.getColumn(masterColumn.getColId());
            }
            // if event was with respect to a master column, that is not present in this
            // grid, then we ignore the event
            if (masterColumn && !slaveColumn) {
                return;
            }
            // likewise for column group
            var masterColumnGroup = event.getColumnGroup();
            var slaveColumnGroup;
            if (masterColumnGroup) {
                var colId = masterColumnGroup.getGroupId();
                var instanceId = masterColumnGroup.getInstanceId();
                slaveColumnGroup = _this.columnController.getColumnGroup(colId, instanceId);
            }
            if (masterColumnGroup && !slaveColumnGroup) {
                return;
            }
            // in time, all the methods below should use the column ids, it's a more generic way
            // of handling columns, and also allows for single or multi column events
            var columnIds = _this.getColumnIds(event);
            var masterColumns = _this.getMasterColumns(event);
            switch (event.getType()) {
                case events_1.Events.EVENT_COLUMN_MOVED:
                    _this.logger.log('onColumnEvent-> processing ' + event + ' toIndex = ' + event.getToIndex());
                    _this.columnController.moveColumns(columnIds, event.getToIndex());
                    break;
                case events_1.Events.EVENT_COLUMN_VISIBLE:
                    _this.logger.log('onColumnEvent-> processing ' + event + ' visible = ' + event.isVisible());
                    _this.columnController.setColumnsVisible(columnIds, event.isVisible());
                    break;
                case events_1.Events.EVENT_COLUMN_PINNED:
                    _this.logger.log('onColumnEvent-> processing ' + event + ' pinned = ' + event.getPinned());
                    _this.columnController.setColumnsPinned(columnIds, event.getPinned());
                    break;
                case events_1.Events.EVENT_COLUMN_GROUP_OPENED:
                    _this.logger.log('onColumnEvent-> processing ' + event + ' expanded = ' + masterColumnGroup.isExpanded());
                    _this.columnController.setColumnGroupOpened(slaveColumnGroup, masterColumnGroup.isExpanded());
                    break;
                case events_1.Events.EVENT_COLUMN_RESIZED:
                    masterColumns.forEach(function (masterColumn) {
                        _this.logger.log('onColumnEvent-> processing ' + event + ' actualWidth = ' + masterColumn.getActualWidth());
                        _this.columnController.setColumnWidth(masterColumn.getColId(), masterColumn.getActualWidth(), event.isFinished());
                    });
                    break;
            }
        });
    };
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], MasterSlaveService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], MasterSlaveService.prototype, "columnController", void 0);
    __decorate([
        context_3.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], MasterSlaveService.prototype, "gridPanel", void 0);
    __decorate([
        context_3.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], MasterSlaveService.prototype, "eventService", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], MasterSlaveService.prototype, "agWire", null);
    __decorate([
        context_4.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], MasterSlaveService.prototype, "init", null);
    MasterSlaveService = __decorate([
        context_1.Bean('masterSlaveService'), 
        __metadata('design:paramtypes', [])
    ], MasterSlaveService);
    return MasterSlaveService;
})();
exports.MasterSlaveService = MasterSlaveService;
