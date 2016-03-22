// ag-grid-enterprise v4.0.7
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var main_8 = require("ag-grid/main");
var main_9 = require("ag-grid/main");
var main_10 = require("ag-grid/main");
var main_11 = require("ag-grid/main");
var main_12 = require("ag-grid/main");
var main_13 = require("ag-grid/main");
var main_14 = require("ag-grid/main");
var svgFactory = main_2.SvgFactory.getInstance();
var RowGroupPanel = (function (_super) {
    __extends(RowGroupPanel, _super);
    function RowGroupPanel() {
        _super.call(this, '<div class="ag-row-group-panel ag-font-style"></div>');
    }
    RowGroupPanel.prototype.agWire = function () {
        this.addEmptyMessageToGui();
    };
    RowGroupPanel.prototype.init = function () {
        this.logger = this.loggerFactory.create('RowGroupPanel');
        this.globalEventService.addEventListener(main_14.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        this.globalEventService.addEventListener(main_14.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        this.setupDropTarget();
    };
    RowGroupPanel.prototype.setupDropTarget = function () {
        this.dropTarget = {
            eContainer: this.getGui(),
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this)
        };
        this.dragAndDropService.addDropTarget(this.dropTarget);
    };
    RowGroupPanel.prototype.onDragging = function () {
    };
    RowGroupPanel.prototype.onDragEnter = function (draggingEvent) {
        // see if column is already grouped, if it is, ignore it
        var columnAlreadyGrouped = this.columnController.isColumnRowGrouped(draggingEvent.dragItem);
        var columnNotGroupable = draggingEvent.dragItem.getColDef().suppressRowGroup;
        if (columnAlreadyGrouped || columnNotGroupable) {
            // do not allow group
            this.dragAndDropService.setGhostIcon(null);
        }
        else {
            // allow group
            this.addPotentialDropToGui(draggingEvent.dragItem);
            this.dragAndDropService.setGhostIcon(main_10.DragAndDropService.ICON_GROUP);
        }
    };
    RowGroupPanel.prototype.onDragLeave = function (draggingEvent) {
        // if the dragging started from us, we remove the group, however if it started
        // someplace else, then we don't, as it was only 'asking'
        if (draggingEvent.dragSource.dragSourceDropTarget === this.dropTarget) {
            this.gridPanel.turnOnAnimationForABit();
            this.columnController.removeRowGroupColumn(draggingEvent.dragItem);
            this.columnController.setColumnVisible(draggingEvent.dragItem, true);
        }
        if (this.ePotentialDropGui) {
            this.removePotentialDropFromGui();
        }
    };
    RowGroupPanel.prototype.onDragStop = function (draggingEvent) {
        //this.columnController.addRowGroupColumn(draggingEvent.dragItem);
        if (this.ePotentialDropGui) {
            // not necessary to remove it, as the change to rowGroups results in
            // this panel refreshing, however my brain will be more at peace if we do
            this.removePotentialDropFromGui();
            this.columnController.addRowGroupColumn(draggingEvent.dragItem);
        }
    };
    RowGroupPanel.prototype.onColumnChanged = function () {
        main_1.Utils.removeAllChildren(this.getGui());
        var columns = this.columnController.getRowGroupColumns();
        if (columns.length > 0) {
            this.addColumnsToGui(columns);
        }
        else {
            this.addEmptyMessageToGui();
        }
    };
    RowGroupPanel.prototype.removePotentialDropFromGui = function () {
        this.getGui().removeChild(this.ePotentialDropGui);
        this.ePotentialDropGui = null;
        // if no groupings, need to add the empty message back in
        if (this.columnController.getRowGroupColumns().length === 0) {
            this.addEmptyMessageToGui();
        }
    };
    RowGroupPanel.prototype.addPotentialDropToGui = function (column) {
        this.ePotentialDropGui = document.createElement('span');
        if (this.columnController.getRowGroupColumns().length === 0) {
            // if no groupings, need to remove the empty message
            main_1.Utils.removeAllChildren(this.getGui());
            var eGroupIcon = svgFactory.createGroupIcon();
            main_1.Utils.addCssClass(eGroupIcon, 'ag-faded');
            main_1.Utils.addCssClass(eGroupIcon, 'ag-row-group-icon');
            this.ePotentialDropGui.appendChild(eGroupIcon);
        }
        else {
            // otherwise we need to add an arrow
            var eArrow = document.createElement('span');
            eArrow.innerHTML = '&#8594;';
            this.ePotentialDropGui.appendChild(eArrow);
        }
        var cell = new RenderedGroupedColumnCell(column, this.dropTarget, true);
        this.context.wireBean(cell);
        this.ePotentialDropGui.appendChild(cell.getGui());
        this.getGui().appendChild(this.ePotentialDropGui);
    };
    RowGroupPanel.prototype.addColumnsToGui = function (columns) {
        var _this = this;
        var eGroupIcon = svgFactory.createGroupIcon();
        main_1.Utils.addCssClass(eGroupIcon, 'ag-row-group-icon');
        this.getGui().appendChild(eGroupIcon);
        columns.forEach(function (column, index) {
            if (index > 0) {
                var eArrow = document.createElement('span');
                eArrow.innerHTML = '&#8594;';
                _this.getGui().appendChild(eArrow);
            }
            var cell = new RenderedGroupedColumnCell(column, _this.dropTarget);
            _this.context.wireBean(cell);
            _this.getGui().appendChild(cell.getGui());
        });
    };
    RowGroupPanel.prototype.addEmptyMessageToGui = function () {
        // add in faded group icon
        var eGroupIcon = svgFactory.createGroupIcon();
        main_1.Utils.addCssClass(eGroupIcon, 'ag-faded ag-row-group-icon');
        this.getGui().appendChild(eGroupIcon);
        // add in message
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var rowGroupColumnsEmptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag columns here to group');
        var eMessage = document.createElement('span');
        eMessage.innerHTML = rowGroupColumnsEmptyMessage;
        main_1.Utils.addCssClass(eMessage, 'ag-row-group-empty-message');
        this.getGui().appendChild(eMessage);
    };
    __decorate([
        main_5.Autowired('columnController'), 
        __metadata('design:type', main_6.ColumnController)
    ], RowGroupPanel.prototype, "columnController", void 0);
    __decorate([
        main_5.Autowired('context'), 
        __metadata('design:type', main_8.Context)
    ], RowGroupPanel.prototype, "context", void 0);
    __decorate([
        main_5.Autowired('loggerFactory'), 
        __metadata('design:type', main_9.LoggerFactory)
    ], RowGroupPanel.prototype, "loggerFactory", void 0);
    __decorate([
        main_5.Autowired('dragAndDropService'), 
        __metadata('design:type', main_10.DragAndDropService)
    ], RowGroupPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        main_5.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_11.GridOptionsWrapper)
    ], RowGroupPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_5.Autowired('gridPanel'), 
        __metadata('design:type', main_12.GridPanel)
    ], RowGroupPanel.prototype, "gridPanel", void 0);
    __decorate([
        main_5.Autowired('eventService'), 
        __metadata('design:type', main_7.EventService)
    ], RowGroupPanel.prototype, "globalEventService", void 0);
    __decorate([
        main_13.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RowGroupPanel.prototype, "init", null);
    RowGroupPanel = __decorate([
        main_3.Bean('rowGroupPanel'), 
        __metadata('design:paramtypes', [])
    ], RowGroupPanel);
    return RowGroupPanel;
})(main_4.Component);
exports.RowGroupPanel = RowGroupPanel;
var RenderedGroupedColumnCell = (function (_super) {
    __extends(RenderedGroupedColumnCell, _super);
    function RenderedGroupedColumnCell(column, dragSourceDropTarget, ghost) {
        if (ghost === void 0) { ghost = false; }
        _super.call(this, RenderedGroupedColumnCell.TEMPLATE);
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }
    RenderedGroupedColumnCell.prototype.init = function () {
        this.setupComponents();
        if (!this.ghost) {
            this.addDragSource();
        }
    };
    RenderedGroupedColumnCell.prototype.addDragSource = function () {
        var dragSource = {
            eElement: this.getGui(),
            dragItem: this.column,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource);
    };
    RenderedGroupedColumnCell.prototype.setupComponents = function () {
        var _this = this;
        var eText = this.getGui().querySelector('#eText');
        var btRemove = this.getGui().querySelector('#btRemove');
        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);
        btRemove.addEventListener('click', function () {
            _this.gridPanel.turnOnAnimationForABit();
            _this.columnController.removeRowGroupColumn(_this.column);
            _this.columnController.setColumnVisible(_this.column, true);
        });
        if (this.ghost) {
            main_1.Utils.addCssClass(this.getGui(), 'ag-row-group-cell-ghost');
        }
    };
    RenderedGroupedColumnCell.TEMPLATE = '<span class="ag-row-group-cell">' +
        '<span id="eText" class="ag-row-group-cell-text"></span>' +
        '<span id="btRemove" class="ag-row-group-cell-button">&#10006;</span>' +
        '</span>';
    __decorate([
        main_5.Autowired('dragAndDropService'), 
        __metadata('design:type', main_10.DragAndDropService)
    ], RenderedGroupedColumnCell.prototype, "dragAndDropService", void 0);
    __decorate([
        main_5.Autowired('columnController'), 
        __metadata('design:type', main_6.ColumnController)
    ], RenderedGroupedColumnCell.prototype, "columnController", void 0);
    __decorate([
        main_5.Autowired('gridPanel'), 
        __metadata('design:type', main_12.GridPanel)
    ], RenderedGroupedColumnCell.prototype, "gridPanel", void 0);
    __decorate([
        main_13.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedGroupedColumnCell.prototype, "init", null);
    return RenderedGroupedColumnCell;
})(main_4.Component);
