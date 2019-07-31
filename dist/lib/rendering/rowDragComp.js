/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var rowNode_1 = require("../entities/rowNode");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var eventKeys_1 = require("../eventKeys");
var beanStub_1 = require("../context/beanStub");
var utils_1 = require("../utils");
var RowDragComp = /** @class */ (function (_super) {
    __extends(RowDragComp, _super);
    function RowDragComp(rowNode, column, cellValue, beans) {
        var _this = _super.call(this, "<div class=\"ag-row-drag\"></div>") || this;
        _this.visibleMode = null;
        _this.rowNode = rowNode;
        _this.column = column;
        _this.cellValue = cellValue;
        _this.beans = beans;
        return _this;
    }
    RowDragComp.prototype.postConstruct = function () {
        var eGui = this.getGui();
        eGui.appendChild(utils_1._.createIconNoSpan('rowDrag', this.beans.gridOptionsWrapper, null));
        this.addDragSource();
        this.checkCompatibility();
        if (this.beans.gridOptionsWrapper.isRowDragManaged()) {
            this.addFeature(this.beans.context, new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column));
        }
        else {
            this.addFeature(this.beans.context, new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column));
        }
    };
    // returns true if all compatibility items work out
    RowDragComp.prototype.checkCompatibility = function () {
        var managed = this.beans.gridOptionsWrapper.isRowDragManaged();
        var treeData = this.beans.gridOptionsWrapper.isTreeData();
        if (treeData && managed) {
            utils_1._.doOnce(function () {
                return console.warn('ag-Grid: If using row drag with tree data, you cannot have rowDragManaged=true');
            }, 'RowDragComp.managedAndTreeData');
        }
    };
    RowDragComp.prototype.addDragSource = function () {
        var _this = this;
        var dragItem = {
            rowNode: this.rowNode
        };
        var dragSource = {
            type: dragAndDropService_1.DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: this.cellValue,
            dragItemCallback: function () { return dragItem; },
            dragStartPixels: 0
        };
        this.beans.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.beans.dragAndDropService.removeDragSource(dragSource); });
    };
    RowDragComp.prototype.getVisibleMode = function () {
        return this.visibleMode;
    };
    RowDragComp.prototype.setVisibleMode = function (type) {
        this.visibleMode = type;
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowDragComp.prototype, "postConstruct", null);
    return RowDragComp;
}(component_1.Component));
exports.RowDragComp = RowDragComp;
// when non managed, the visibility depends on suppressRowDrag property only
var NonManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(NonManagedVisibilityStrategy, _super);
    function NonManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.beans = beans;
        _this.column = column;
        _this.rowNode = rowNode;
        return _this;
    }
    NonManagedVisibilityStrategy.prototype.postConstruct = function () {
        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        if (suppressRowDrag) {
            this.parent.setVisibleMode('display');
            this.parent.setVisible(false, 'display');
        }
        else {
            var visible = this.column.isRowDrag(this.rowNode);
            if (!this.parent.getVisibleMode()) {
                var isRowDragFunc = utils_1._.isFunction(this.column.getColDef().rowDrag);
                this.parent.setVisibleMode(isRowDragFunc ? 'visibility' : 'display');
            }
            this.parent.setVisible(visible, this.parent.getVisibleMode());
        }
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], NonManagedVisibilityStrategy.prototype, "postConstruct", null);
    return NonManagedVisibilityStrategy;
}(beanStub_1.BeanStub));
// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
var ManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(ManagedVisibilityStrategy, _super);
    function ManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.beans = beans;
        _this.column = column;
        _this.rowNode = rowNode;
        return _this;
    }
    ManagedVisibilityStrategy.prototype.postConstruct = function () {
        // we do not show the component if sort, filter or grouping is active
        this.addDestroyableEventListener(this.beans.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, eventKeys_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addDestroyableEventListener(this.beans.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addDestroyableEventListener(this.beans.gridOptionsWrapper, 'suppressRowDrag', this.onSuppressRowDrag.bind(this));
        this.updateSortActive();
        this.updateFilterActive();
        this.updateRowGroupActive();
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.updateRowGroupActive = function () {
        var rowGroups = this.beans.columnController.getRowGroupColumns();
        this.rowGroupActive = !utils_1._.missingOrEmpty(rowGroups);
    };
    ManagedVisibilityStrategy.prototype.onRowGroupChanged = function () {
        this.updateRowGroupActive();
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.updateSortActive = function () {
        var sortModel = this.beans.sortController.getSortModel();
        this.sortActive = !utils_1._.missingOrEmpty(sortModel);
    };
    ManagedVisibilityStrategy.prototype.onSortChanged = function () {
        this.updateSortActive();
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.updateFilterActive = function () {
        this.filterActive = this.beans.filterManager.isAnyFilterPresent();
    };
    ManagedVisibilityStrategy.prototype.onFilterChanged = function () {
        this.updateFilterActive();
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var sortOrFilterOrGroupActive = this.sortActive || this.filterActive || this.rowGroupActive;
        var suppressRowDrag = this.beans.gridOptionsWrapper.isSuppressRowDrag();
        var alwaysHide = sortOrFilterOrGroupActive || suppressRowDrag;
        if (alwaysHide) {
            this.parent.setVisibleMode('display');
            this.parent.setVisible(false, 'display');
        }
        else {
            var visible = this.column.isRowDrag(this.rowNode);
            if (!this.parent.getVisibleMode()) {
                var isRowDragFunc = utils_1._.isFunction(this.column.getColDef().rowDrag);
                this.parent.setVisibleMode(isRowDragFunc ? 'visibility' : 'display');
            }
            this.parent.setVisible(visible, this.parent.getVisibleMode());
        }
    };
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ManagedVisibilityStrategy.prototype, "postConstruct", null);
    return ManagedVisibilityStrategy;
}(beanStub_1.BeanStub));
