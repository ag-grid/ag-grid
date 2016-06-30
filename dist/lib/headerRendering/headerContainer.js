/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.0-alpha.4
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
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var context_2 = require("../context/context");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var moveColumnController_1 = require("./moveColumnController");
var columnController_1 = require("../columnController/columnController");
var gridPanel_1 = require("../gridPanel/gridPanel");
var context_3 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var headerRowComp_1 = require("./headerRowComp");
var HeaderContainer = (function () {
    function HeaderContainer(eContainer, eViewport, eRoot, pinned) {
        this.headerRowComps = [];
        this.eContainer = eContainer;
        this.eRoot = eRoot;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }
    HeaderContainer.prototype.setWidth = function (width) {
        this.eContainer.style.width = width + 'px';
    };
    HeaderContainer.prototype.init = function () {
        this.setupDragAndDrop();
        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onGridColumnsChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    };
    HeaderContainer.prototype.destroy = function () {
        this.removeHeaderRowComps();
    };
    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    HeaderContainer.prototype.onGridColumnsChanged = function () {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    };
    // we expose this for gridOptions.api.refreshHeader() to call
    HeaderContainer.prototype.refresh = function () {
        this.onGridColumnsChanged();
    };
    HeaderContainer.prototype.setupDragAndDrop = function () {
        var moveColumnController = new moveColumnController_1.MoveColumnController(this.pinned);
        this.context.wireBean(moveColumnController);
        var secondaryContainers;
        switch (this.pinned) {
            case column_1.Column.PINNED_LEFT:
                secondaryContainers = this.gridPanel.getDropTargetLeftContainers();
                break;
            case column_1.Column.PINNED_RIGHT:
                secondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers();
                break;
            default:
                secondaryContainers = this.gridPanel.getDropTargetBodyContainers();
                break;
        }
        var icon = this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
        this.dropTarget = {
            eContainer: this.eViewport ? this.eViewport : this.eContainer,
            iconName: icon,
            eSecondaryContainers: secondaryContainers,
            onDragging: moveColumnController.onDragging.bind(moveColumnController),
            onDragEnter: moveColumnController.onDragEnter.bind(moveColumnController),
            onDragLeave: moveColumnController.onDragLeave.bind(moveColumnController),
            onDragStop: moveColumnController.onDragStop.bind(moveColumnController)
        };
        this.dragAndDropService.addDropTarget(this.dropTarget);
    };
    HeaderContainer.prototype.removeHeaderRowComps = function () {
        this.headerRowComps.forEach(function (headerRowComp) {
            headerRowComp.destroy();
        });
        this.headerRowComps.length = 0;
        utils_1.Utils.removeAllChildren(this.eContainer);
    };
    HeaderContainer.prototype.createHeaderRowComps = function () {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowCount = this.columnController.getHeaderRowCount();
        for (var dept = 0; dept < rowCount; dept++) {
            var groupRow = dept !== (rowCount - 1);
            var headerRowComp = new headerRowComp_1.HeaderRowComp(dept, groupRow, this.pinned, this.eRoot, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderContainer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_2.Context)
    ], HeaderContainer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], HeaderContainer.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], HeaderContainer.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], HeaderContainer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], HeaderContainer.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], HeaderContainer.prototype, "eventService", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], HeaderContainer.prototype, "init", null);
    return HeaderContainer;
})();
exports.HeaderContainer = HeaderContainer;
