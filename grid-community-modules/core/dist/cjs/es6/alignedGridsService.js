"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignedGridsService = void 0;
const events_1 = require("./events");
const context_1 = require("./context/context");
const context_2 = require("./context/context");
const context_3 = require("./context/context");
const context_4 = require("./context/context");
const beanStub_1 = require("./context/beanStub");
const gridApi_1 = require("./gridApi");
const function_1 = require("./utils/function");
let AlignedGridsService = class AlignedGridsService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
        // while processing a master event) we mark this if consuming an event, and if we are, then
        // we don't fire back any events.
        this.consuming = false;
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
    }
    getAlignedGridApis() {
        var _a;
        let alignedGrids = (_a = this.gridOptionsService.get('alignedGrids')) !== null && _a !== void 0 ? _a : [];
        const isCallbackConfig = typeof alignedGrids === 'function';
        if (typeof alignedGrids === 'function') {
            alignedGrids = alignedGrids();
        }
        const seeUrl = () => `See ${this.getFrameworkOverrides().getDocLink('aligned-grids')}`;
        const apis = alignedGrids.map((alignedGrid) => {
            var _a;
            if (!alignedGrid) {
                (0, function_1.errorOnce)(`alignedGrids contains an undefined option.`);
                if (!isCallbackConfig) {
                    (0, function_1.errorOnce)(`You may want to configure via a callback to avoid setup race conditions:
                     "alignedGrids: () => [linkedGrid]"`);
                }
                (0, function_1.errorOnce)(seeUrl());
                return;
            }
            if (alignedGrid instanceof gridApi_1.GridApi) {
                return alignedGrid;
            }
            // Extract the GridApi from a ref or component
            const refOrComp = alignedGrid;
            if ('current' in refOrComp) {
                return (_a = refOrComp.current) === null || _a === void 0 ? void 0 : _a.api;
            }
            else {
                if (!refOrComp.api) {
                    (0, function_1.errorOnce)(`alignedGrids - No api found on the linked grid. If you are passing gridOptions to alignedGrids since v31 this is no longer valid. ${seeUrl()}`);
                }
                return refOrComp.api;
            }
        }).filter(api => !!api && !api.isDestroyed());
        return apis;
    }
    init() {
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_BODY_SCROLL, this.fireScrollEvent.bind(this));
    }
    // common logic across all the fire methods
    fireEvent(callback) {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }
        // iterate through the aligned grids, and pass each aligned grid service to the callback
        this.getAlignedGridApis().forEach((api) => {
            const alignedGridService = api.__getAlignedGridService();
            callback(alignedGridService);
        });
    }
    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    onEvent(callback) {
        this.consuming = true;
        callback();
        this.consuming = false;
    }
    fireColumnEvent(event) {
        this.fireEvent(alignedGridsService => {
            alignedGridsService.onColumnEvent(event);
        });
    }
    fireScrollEvent(event) {
        if (event.direction !== 'horizontal') {
            return;
        }
        this.fireEvent(alignedGridsService => {
            alignedGridsService.onScrollEvent(event);
        });
    }
    onScrollEvent(event) {
        this.onEvent(() => {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            gridBodyCon.getScrollFeature().setHorizontalScrollPosition(event.left, true);
        });
    }
    getMasterColumns(event) {
        const result = [];
        if (event.columns) {
            event.columns.forEach((column) => {
                result.push(column);
            });
        }
        else if (event.column) {
            result.push(event.column);
        }
        return result;
    }
    getColumnIds(event) {
        const result = [];
        if (event.columns) {
            event.columns.forEach(column => {
                result.push(column.getColId());
            });
        }
        else if (event.column) {
            result.push(event.column.getColId());
        }
        return result;
    }
    onColumnEvent(event) {
        this.onEvent(() => {
            switch (event.type) {
                case events_1.Events.EVENT_COLUMN_MOVED:
                case events_1.Events.EVENT_COLUMN_VISIBLE:
                case events_1.Events.EVENT_COLUMN_PINNED:
                case events_1.Events.EVENT_COLUMN_RESIZED:
                    const colEvent = event;
                    this.processColumnEvent(colEvent);
                    break;
                case events_1.Events.EVENT_COLUMN_GROUP_OPENED:
                    const groupOpenedEvent = event;
                    this.processGroupOpenedEvent(groupOpenedEvent);
                    break;
                case events_1.Events.EVENT_COLUMN_PIVOT_CHANGED:
                    // we cannot support pivoting with aligned grids as the columns will be out of sync as the
                    // grids will have columns created based on the row data of the grid.
                    console.warn('AG Grid: pivoting is not supported with aligned grids. ' +
                        'You can only use one of these features at a time in a grid.');
                    break;
            }
        });
    }
    processGroupOpenedEvent(groupOpenedEvent) {
        // likewise for column group
        const masterColumnGroup = groupOpenedEvent.columnGroup;
        let otherColumnGroup = null;
        if (masterColumnGroup) {
            const groupId = masterColumnGroup.getGroupId();
            otherColumnGroup = this.columnModel.getProvidedColumnGroup(groupId);
        }
        if (masterColumnGroup && !otherColumnGroup) {
            return;
        }
        this.logger.log('onColumnEvent-> processing ' + groupOpenedEvent + ' expanded = ' + masterColumnGroup.isExpanded());
        this.columnModel.setColumnGroupOpened(otherColumnGroup, masterColumnGroup.isExpanded(), "alignedGridChanged");
    }
    processColumnEvent(colEvent) {
        var _a;
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        const masterColumn = colEvent.column;
        let otherColumn = null;
        if (masterColumn) {
            otherColumn = this.columnModel.getPrimaryColumn(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) {
            return;
        }
        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        const masterColumns = this.getMasterColumns(colEvent);
        switch (colEvent.type) {
            case events_1.Events.EVENT_COLUMN_MOVED:
                // when the user moves columns via applyColumnState, we can't depend on moving specific columns
                // to an index, as there maybe be many indexes columns moved to (as wasn't result of a mouse drag).
                // so only way to be sure is match the order of all columns using Column State.
                {
                    const movedEvent = colEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId }));
                    this.columnModel.applyColumnState({ state: destColState, applyOrder: true }, "alignedGridChanged");
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} toIndex = ${movedEvent.toIndex}`);
                }
                break;
            case events_1.Events.EVENT_COLUMN_VISIBLE:
                // when the user changes visibility via applyColumnState, we can't depend on visibility flag in event
                // as there maybe be mix of true/false (as wasn't result of a mouse click to set visiblity).
                // so only way to be sure is match the visibility of all columns using Column State.
                {
                    const visibleEvent = colEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId, hide: s.hide }));
                    this.columnModel.applyColumnState({ state: destColState }, "alignedGridChanged");
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} visible = ${visibleEvent.visible}`);
                }
                break;
            case events_1.Events.EVENT_COLUMN_PINNED:
                {
                    const pinnedEvent = colEvent;
                    const srcColState = colEvent.api.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId, pinned: s.pinned }));
                    this.columnModel.applyColumnState({ state: destColState }, "alignedGridChanged");
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} pinned = ${pinnedEvent.pinned}`);
                }
                break;
            case events_1.Events.EVENT_COLUMN_RESIZED:
                const resizedEvent = colEvent;
                const columnWidths = {};
                masterColumns.forEach((column) => {
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} actualWidth = ${column.getActualWidth()}`);
                    columnWidths[column.getId()] = { key: column.getColId(), newWidth: column.getActualWidth() };
                });
                // don't set flex columns width
                (_a = resizedEvent.flexColumns) === null || _a === void 0 ? void 0 : _a.forEach(col => {
                    if (columnWidths[col.getId()]) {
                        delete columnWidths[col.getId()];
                    }
                });
                this.columnModel.setColumnWidths(Object.values(columnWidths), false, resizedEvent.finished, "alignedGridChanged");
                break;
        }
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const isVerticalScrollShowing = gridBodyCon.isVerticalScrollShowing();
        this.getAlignedGridApis().forEach((api) => {
            api.setGridOption('alwaysShowVerticalScroll', isVerticalScrollShowing);
        });
    }
};
__decorate([
    (0, context_3.Autowired)('columnModel')
], AlignedGridsService.prototype, "columnModel", void 0);
__decorate([
    (0, context_3.Autowired)('ctrlsService')
], AlignedGridsService.prototype, "ctrlsService", void 0);
__decorate([
    __param(0, (0, context_2.Qualifier)('loggerFactory'))
], AlignedGridsService.prototype, "setBeans", null);
__decorate([
    context_4.PostConstruct
], AlignedGridsService.prototype, "init", null);
AlignedGridsService = __decorate([
    (0, context_1.Bean)('alignedGridsService')
], AlignedGridsService);
exports.AlignedGridsService = AlignedGridsService;
