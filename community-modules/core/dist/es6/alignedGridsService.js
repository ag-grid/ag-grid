/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Events } from "./events";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { Autowired } from "./context/context";
import { PostConstruct } from "./context/context";
import { BeanStub } from "./context/beanStub";
var AlignedGridsService = /** @class */ (function (_super) {
    __extends(AlignedGridsService, _super);
    function AlignedGridsService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        _this.consuming = false;
        return _this;
    }
    AlignedGridsService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
    };
    AlignedGridsService.prototype.init = function () {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.fireScrollEvent.bind(this));
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
            var gridBodyCon = _this.controllersService.getGridBodyController();
            gridBodyCon.getScrollFeature().setHorizontalScrollPosition(event.left);
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
                case Events.EVENT_COLUMN_MOVED:
                case Events.EVENT_COLUMN_VISIBLE:
                case Events.EVENT_COLUMN_PINNED:
                case Events.EVENT_COLUMN_RESIZED:
                    var colEvent = event;
                    _this.processColumnEvent(colEvent);
                    break;
                case Events.EVENT_COLUMN_GROUP_OPENED:
                    var groupOpenedEvent = event;
                    _this.processGroupOpenedEvent(groupOpenedEvent);
                    break;
                case Events.EVENT_COLUMN_PIVOT_CHANGED:
                    // we cannot support pivoting with aligned grids as the columns will be out of sync as the
                    // grids will have columns created based on the row data of the grid.
                    console.warn('AG Grid: pivoting is not supported with aligned grids. ' +
                        'You can only use one of these features at a time in a grid.');
                    break;
            }
        });
    };
    AlignedGridsService.prototype.processGroupOpenedEvent = function (groupOpenedEvent) {
        // likewise for column group
        var masterColumnGroup = groupOpenedEvent.columnGroup;
        var otherColumnGroup = null;
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
        var otherColumn = null;
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
        var masterColumns = this.getMasterColumns(colEvent);
        switch (colEvent.type) {
            case Events.EVENT_COLUMN_MOVED:
                // when the user moves columns via setColumnState, we can't depend on moving specific columns
                // to an index, as there maybe be many indexes columns moved to (as wasn't result of a mouse drag).
                // so only way to be sure is match the order of all columns using Column State.
                {
                    var movedEvent = colEvent;
                    var srcColState = colEvent.columnApi.getColumnState();
                    var destColState = srcColState.map(function (s) { return ({ colId: s.colId }); });
                    this.columnController.applyColumnState({ state: destColState, applyOrder: true }, "alignedGridChanged");
                    this.logger.log("onColumnEvent-> processing " + colEvent.type + " toIndex = " + movedEvent.toIndex);
                }
                break;
            case Events.EVENT_COLUMN_VISIBLE:
                // when the user changes visibility via setColumnState, we can't depend on visibility flag in event
                // as there maybe be mix of true/false (as wasn't result of a mouse click to set visiblity).
                // so only way to be sure is match the visibility of all columns using Column State.
                {
                    var visibleEvent = colEvent;
                    var srcColState = colEvent.columnApi.getColumnState();
                    var destColState = srcColState.map(function (s) { return ({ colId: s.colId, hide: s.hide }); });
                    this.columnController.applyColumnState({ state: destColState }, "alignedGridChanged");
                    this.logger.log("onColumnEvent-> processing " + colEvent.type + " visible = " + visibleEvent.visible);
                }
                break;
            case Events.EVENT_COLUMN_PINNED:
                {
                    var pinnedEvent = colEvent;
                    var srcColState = colEvent.columnApi.getColumnState();
                    var destColState = srcColState.map(function (s) { return ({ colId: s.colId, pinned: s.pinned }); });
                    this.columnController.applyColumnState({ state: destColState }, "alignedGridChanged");
                    this.logger.log("onColumnEvent-> processing " + colEvent.type + " pinned = " + pinnedEvent.pinned);
                }
                break;
            case Events.EVENT_COLUMN_RESIZED:
                var resizedEvent_1 = colEvent;
                masterColumns.forEach(function (column) {
                    _this.logger.log("onColumnEvent-> processing " + colEvent.type + " actualWidth = " + column.getActualWidth());
                    var columnWidths = [{ key: column.getColId(), newWidth: column.getActualWidth() }];
                    _this.columnController.setColumnWidths(columnWidths, false, resizedEvent_1.finished, "alignedGridChanged");
                });
                break;
        }
        var gridBodyCon = this.controllersService.getGridBodyController();
        var isVerticalScrollShowing = gridBodyCon.isVerticalScrollShowing();
        var alignedGrids = this.gridOptionsWrapper.getAlignedGrids();
        if (alignedGrids) {
            alignedGrids.forEach(function (grid) {
                if (grid.api) {
                    grid.api.setAlwaysShowVerticalScroll(isVerticalScrollShowing);
                }
            });
        }
    };
    __decorate([
        Autowired('columnController')
    ], AlignedGridsService.prototype, "columnController", void 0);
    __decorate([
        Autowired('controllersService')
    ], AlignedGridsService.prototype, "controllersService", void 0);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], AlignedGridsService.prototype, "setBeans", null);
    __decorate([
        PostConstruct
    ], AlignedGridsService.prototype, "init", null);
    AlignedGridsService = __decorate([
        Bean('alignedGridsService')
    ], AlignedGridsService);
    return AlignedGridsService;
}(BeanStub));
export { AlignedGridsService };
