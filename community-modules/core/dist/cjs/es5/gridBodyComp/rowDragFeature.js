/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowDragFeature = void 0;
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var iRowNode_1 = require("../interfaces/iRowNode");
var array_1 = require("../utils/array");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var function_1 = require("../utils/function");
var autoScrollService_1 = require("../autoScrollService");
var RowDragFeature = /** @class */ (function (_super) {
    __extends(RowDragFeature, _super);
    function RowDragFeature(eContainer) {
        var _this = _super.call(this) || this;
        _this.isMultiRowDrag = false;
        _this.isGridSorted = false;
        _this.isGridFiltered = false;
        _this.isRowGroupActive = false;
        _this.eContainer = eContainer;
        return _this;
    }
    RowDragFeature.prototype.postConstruct = function () {
        var _this = this;
        if (this.gridOptionsService.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel;
        }
        var refreshStatus = function () {
            _this.onSortChanged();
            _this.onFilterChanged();
            _this.onRowGroupChanged();
        };
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_MODEL_UPDATED, function () {
            refreshStatus();
        });
        refreshStatus();
        this.ctrlsService.whenReady(function () {
            var gridBodyCon = _this.ctrlsService.getGridBodyCtrl();
            _this.autoScrollService = new autoScrollService_1.AutoScrollService({
                scrollContainer: gridBodyCon.getBodyViewportElement(),
                scrollAxis: 'y',
                getVerticalPosition: function () { return gridBodyCon.getScrollFeature().getVScrollPosition().top; },
                setVerticalPosition: function (position) { return gridBodyCon.getScrollFeature().setVerticalScrollPosition(position); },
                onScrollCallback: function () { _this.onDragging(_this.lastDraggingEvent); }
            });
        });
    };
    RowDragFeature.prototype.onSortChanged = function () {
        this.isGridSorted = this.sortController.isSortActive();
    };
    RowDragFeature.prototype.onFilterChanged = function () {
        this.isGridFiltered = this.filterManager.isAnyFilterPresent();
    };
    RowDragFeature.prototype.onRowGroupChanged = function () {
        var rowGroups = this.columnModel.getRowGroupColumns();
        this.isRowGroupActive = !generic_1.missingOrEmpty(rowGroups);
    };
    RowDragFeature.prototype.getContainer = function () {
        return this.eContainer;
    };
    RowDragFeature.prototype.isInterestedIn = function (type) {
        return type === dragAndDropService_1.DragSourceType.RowDrag;
    };
    RowDragFeature.prototype.getIconName = function () {
        var managedDrag = this.gridOptionsService.is('rowDragManaged');
        if (managedDrag && this.shouldPreventRowMove()) {
            return dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED;
        }
        return dragAndDropService_1.DragAndDropService.ICON_MOVE;
    };
    RowDragFeature.prototype.shouldPreventRowMove = function () {
        return this.isGridSorted || this.isGridFiltered || this.isRowGroupActive;
    };
    RowDragFeature.prototype.getRowNodes = function (draggingEvent) {
        var _this = this;
        if (!this.isFromThisGrid(draggingEvent)) {
            return (draggingEvent.dragItem.rowNodes || []);
        }
        var isRowDragMultiRow = this.gridOptionsService.is('rowDragMultiRow');
        var selectedNodes = __spread(this.selectionService.getSelectedNodes()).sort(function (a, b) {
            if (a.rowIndex == null || b.rowIndex == null) {
                return 0;
            }
            return _this.getRowIndexNumber(a) - _this.getRowIndexNumber(b);
        });
        var currentNode = draggingEvent.dragItem.rowNode;
        if (isRowDragMultiRow && selectedNodes.indexOf(currentNode) !== -1) {
            this.isMultiRowDrag = true;
            return selectedNodes;
        }
        this.isMultiRowDrag = false;
        return [currentNode];
    };
    RowDragFeature.prototype.onDragEnter = function (draggingEvent) {
        // builds a lits of all rows being dragged before firing events
        draggingEvent.dragItem.rowNodes = this.getRowNodes(draggingEvent);
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchGridEvent(eventKeys_1.Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.getRowNodes(draggingEvent).forEach(function (rowNode) {
            rowNode.setDragging(true);
        });
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.onDragging = function (draggingEvent) {
        this.onEnterOrDragging(draggingEvent);
    };
    RowDragFeature.prototype.isFromThisGrid = function (draggingEvent) {
        var dragSourceDomDataKey = draggingEvent.dragSource.dragSourceDomDataKey;
        return dragSourceDomDataKey === this.gridOptionsService.getDomDataKey();
    };
    RowDragFeature.prototype.isDropZoneWithinThisGrid = function (draggingEvent) {
        var gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        var gridGui = gridBodyCon.getGui();
        var dropZoneTarget = draggingEvent.dropZoneTarget;
        return !gridGui.contains(dropZoneTarget);
    };
    RowDragFeature.prototype.onEnterOrDragging = function (draggingEvent) {
        // this event is fired for enter and move
        this.dispatchGridEvent(eventKeys_1.Events.EVENT_ROW_DRAG_MOVE, draggingEvent);
        this.lastDraggingEvent = draggingEvent;
        var pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var managedDrag = this.gridOptionsService.is('rowDragManaged');
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }
        this.autoScrollService.check(draggingEvent.event);
    };
    RowDragFeature.prototype.doManagedDrag = function (draggingEvent, pixel) {
        var isFromThisGrid = this.isFromThisGrid(draggingEvent);
        var managedDrag = this.gridOptionsService.is('rowDragManaged');
        var rowNodes = draggingEvent.dragItem.rowNodes;
        if (managedDrag && this.shouldPreventRowMove()) {
            return;
        }
        if (this.gridOptionsService.is('suppressMoveWhenRowDragging') || !isFromThisGrid) {
            if (!this.isDropZoneWithinThisGrid(draggingEvent)) {
                this.clientSideRowModel.highlightRowAtPixel(rowNodes[0], pixel);
            }
        }
        else {
            this.moveRows(rowNodes, pixel);
        }
    };
    RowDragFeature.prototype.getRowIndexNumber = function (rowNode) {
        return parseInt(array_1.last(rowNode.getRowIndexString().split('-')), 10);
    };
    RowDragFeature.prototype.moveRowAndClearHighlight = function (draggingEvent) {
        var _this = this;
        var lastHighlightedRowNode = this.clientSideRowModel.getLastHighlightedRowNode();
        var isBelow = lastHighlightedRowNode && lastHighlightedRowNode.highlighted === iRowNode_1.RowHighlightPosition.Below;
        var pixel = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var rowNodes = draggingEvent.dragItem.rowNodes;
        var increment = isBelow ? 1 : 0;
        if (this.isFromThisGrid(draggingEvent)) {
            rowNodes.forEach(function (rowNode) {
                if (rowNode.rowTop < pixel) {
                    increment -= 1;
                }
            });
            this.moveRows(rowNodes, pixel, increment);
        }
        else {
            var getRowIdFunc_1 = this.gridOptionsService.getRowIdFunc();
            var addIndex = this.clientSideRowModel.getRowIndexAtPixel(pixel) + 1;
            if (this.clientSideRowModel.getHighlightPosition(pixel) === iRowNode_1.RowHighlightPosition.Above) {
                addIndex--;
            }
            this.clientSideRowModel.updateRowData({
                add: rowNodes
                    .map(function (node) { return node.data; })
                    .filter(function (data) { return !_this.clientSideRowModel.getRowNode(getRowIdFunc_1 ? getRowIdFunc_1({ data: data, level: 0 }) : data.id); }),
                addIndex: addIndex
            });
        }
        this.clearRowHighlight();
    };
    RowDragFeature.prototype.clearRowHighlight = function () {
        this.clientSideRowModel.highlightRowAtPixel(null);
    };
    RowDragFeature.prototype.moveRows = function (rowNodes, pixel, increment) {
        if (increment === void 0) { increment = 0; }
        var rowWasMoved = this.clientSideRowModel.ensureRowsAtPixel(rowNodes, pixel, increment);
        if (rowWasMoved) {
            this.focusService.clearFocusedCell();
            if (this.rangeService) {
                this.rangeService.removeAllCellRanges();
            }
        }
    };
    RowDragFeature.prototype.addRowDropZone = function (params) {
        var _this = this;
        if (!params.getContainer()) {
            function_1.doOnce(function () { return console.warn('AG Grid: addRowDropZone - A container target needs to be provided'); }, 'add-drop-zone-empty-target');
            return;
        }
        if (this.dragAndDropService.findExternalZone(params)) {
            console.warn('AG Grid: addRowDropZone - target already exists in the list of DropZones. Use `removeRowDropZone` before adding it again.');
            return;
        }
        var processedParams = {
            getContainer: params.getContainer
        };
        if (params.fromGrid) {
            params.fromGrid = undefined;
            processedParams = params;
        }
        else {
            if (params.onDragEnter) {
                processedParams.onDragEnter = function (e) {
                    params.onDragEnter(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_ENTER, e));
                };
            }
            if (params.onDragLeave) {
                processedParams.onDragLeave = function (e) {
                    params.onDragLeave(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_LEAVE, e));
                };
            }
            if (params.onDragging) {
                processedParams.onDragging = function (e) {
                    params.onDragging(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_MOVE, e));
                };
            }
            if (params.onDragStop) {
                processedParams.onDragStop = function (e) {
                    params.onDragStop(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_END, e));
                };
            }
        }
        this.dragAndDropService.addDropTarget(__assign({ isInterestedIn: function (type) { return type === dragAndDropService_1.DragSourceType.RowDrag; }, getIconName: function () { return dragAndDropService_1.DragAndDropService.ICON_MOVE; }, external: true }, processedParams));
    };
    RowDragFeature.prototype.getRowDropZone = function (events) {
        var _this = this;
        var getContainer = this.getContainer.bind(this);
        var onDragEnter = this.onDragEnter.bind(this);
        var onDragLeave = this.onDragLeave.bind(this);
        var onDragging = this.onDragging.bind(this);
        var onDragStop = this.onDragStop.bind(this);
        if (!events) {
            return { getContainer: getContainer, onDragEnter: onDragEnter, onDragLeave: onDragLeave, onDragging: onDragging, onDragStop: onDragStop, /* @private */ fromGrid: true };
        }
        return {
            getContainer: getContainer,
            onDragEnter: events.onDragEnter
                ? (function (e) {
                    onDragEnter(e);
                    events.onDragEnter(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_ENTER, e));
                })
                : onDragEnter,
            onDragLeave: events.onDragLeave
                ? (function (e) {
                    onDragLeave(e);
                    events.onDragLeave(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_LEAVE, e));
                })
                : onDragLeave,
            onDragging: events.onDragging
                ? (function (e) {
                    onDragging(e);
                    events.onDragging(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_MOVE, e));
                })
                : onDragging,
            onDragStop: events.onDragStop
                ? (function (e) {
                    onDragStop(e);
                    events.onDragStop(_this.draggingToRowDragEvent(eventKeys_1.Events.EVENT_ROW_DRAG_END, e));
                })
                : onDragStop,
            fromGrid: true /* @private */
        };
    };
    RowDragFeature.prototype.draggingToRowDragEvent = function (type, draggingEvent) {
        var yNormalised = this.mouseEventService.getNormalisedPosition(draggingEvent).y;
        var mouseIsPastLastRow = yNormalised > this.paginationProxy.getCurrentPageHeight();
        var overIndex = -1;
        var overNode;
        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }
        var vDirectionString;
        switch (draggingEvent.vDirection) {
            case dragAndDropService_1.VerticalDirection.Down:
                vDirectionString = 'down';
                break;
            case dragAndDropService_1.VerticalDirection.Up:
                vDirectionString = 'up';
                break;
            default:
                vDirectionString = null;
                break;
        }
        var event = {
            type: type,
            api: this.gridOptionsService.get('api'),
            columnApi: this.gridOptionsService.get('columnApi'),
            context: this.gridOptionsService.get('context'),
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode,
            nodes: draggingEvent.dragItem.rowNodes,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };
        return event;
    };
    RowDragFeature.prototype.dispatchGridEvent = function (type, draggingEvent) {
        var event = this.draggingToRowDragEvent(type, draggingEvent);
        this.eventService.dispatchEvent(event);
    };
    RowDragFeature.prototype.onDragLeave = function (draggingEvent) {
        this.dispatchGridEvent(eventKeys_1.Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
        if (this.gridOptionsService.is('rowDragManaged')) {
            this.clearRowHighlight();
        }
        if (this.isFromThisGrid(draggingEvent)) {
            this.isMultiRowDrag = false;
        }
    };
    RowDragFeature.prototype.onDragStop = function (draggingEvent) {
        this.dispatchGridEvent(eventKeys_1.Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);
        if (this.gridOptionsService.is('rowDragManaged') &&
            (this.gridOptionsService.is('suppressMoveWhenRowDragging') || !this.isFromThisGrid(draggingEvent)) &&
            !this.isDropZoneWithinThisGrid(draggingEvent)) {
            this.moveRowAndClearHighlight(draggingEvent);
        }
    };
    RowDragFeature.prototype.stopDragging = function (draggingEvent) {
        this.autoScrollService.ensureCleared();
        this.getRowNodes(draggingEvent).forEach(function (rowNode) {
            rowNode.setDragging(false);
        });
    };
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], RowDragFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], RowDragFeature.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], RowDragFeature.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], RowDragFeature.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], RowDragFeature.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], RowDragFeature.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('filterManager')
    ], RowDragFeature.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('selectionService')
    ], RowDragFeature.prototype, "selectionService", void 0);
    __decorate([
        context_1.Autowired('mouseEventService')
    ], RowDragFeature.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], RowDragFeature.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], RowDragFeature.prototype, "rangeService", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowDragFeature.prototype, "postConstruct", null);
    return RowDragFeature;
}(beanStub_1.BeanStub));
exports.RowDragFeature = RowDragFeature;
