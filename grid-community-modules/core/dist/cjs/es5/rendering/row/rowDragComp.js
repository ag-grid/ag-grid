/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowDragComp = void 0;
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var rowNode_1 = require("../../entities/rowNode");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var eventKeys_1 = require("../../eventKeys");
var beanStub_1 = require("../../context/beanStub");
var icon_1 = require("../../utils/icon");
var function_1 = require("../../utils/function");
var RowDragComp = /** @class */ (function (_super) {
    __extends(RowDragComp, _super);
    function RowDragComp(cellValueFn, rowNode, column, customGui, dragStartPixels, suppressVisibilityChange) {
        var _this = _super.call(this) || this;
        _this.cellValueFn = cellValueFn;
        _this.rowNode = rowNode;
        _this.column = column;
        _this.customGui = customGui;
        _this.dragStartPixels = dragStartPixels;
        _this.suppressVisibilityChange = suppressVisibilityChange;
        _this.dragSource = null;
        return _this;
    }
    RowDragComp.prototype.isCustomGui = function () {
        return this.customGui != null;
    };
    RowDragComp.prototype.postConstruct = function () {
        if (!this.customGui) {
            this.setTemplate(/* html */ "<div class=\"ag-drag-handle ag-row-drag\" aria-hidden=\"true\"></div>");
            this.getGui().appendChild(icon_1.createIconNoSpan('rowDrag', this.beans.gridOptionsService, null));
            this.addDragSource();
        }
        else {
            this.setDragElement(this.customGui, this.dragStartPixels);
        }
        this.checkCompatibility();
        if (!this.suppressVisibilityChange) {
            var strategy = this.beans.gridOptionsService.is('rowDragManaged') ?
                new ManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column) :
                new NonManagedVisibilityStrategy(this, this.beans, this.rowNode, this.column);
            this.createManagedBean(strategy, this.beans.context);
        }
    };
    RowDragComp.prototype.setDragElement = function (dragElement, dragStartPixels) {
        this.setTemplateFromElement(dragElement);
        this.addDragSource(dragStartPixels);
    };
    RowDragComp.prototype.getSelectedNodes = function () {
        var isRowDragMultiRow = this.beans.gridOptionsService.is('rowDragMultiRow');
        if (!isRowDragMultiRow) {
            return [this.rowNode];
        }
        var selection = this.beans.selectionService.getSelectedNodes();
        return selection.indexOf(this.rowNode) !== -1 ? selection : [this.rowNode];
    };
    // returns true if all compatibility items work out
    RowDragComp.prototype.checkCompatibility = function () {
        var managed = this.beans.gridOptionsService.is('rowDragManaged');
        var treeData = this.beans.gridOptionsService.isTreeData();
        if (treeData && managed) {
            function_1.doOnce(function () {
                return console.warn('AG Grid: If using row drag with tree data, you cannot have rowDragManaged=true');
            }, 'RowDragComp.managedAndTreeData');
        }
    };
    RowDragComp.prototype.getDragItem = function () {
        return {
            rowNode: this.rowNode,
            rowNodes: this.getSelectedNodes(),
            columns: this.column ? [this.column] : undefined,
            defaultTextValue: this.cellValueFn(),
        };
    };
    RowDragComp.prototype.getRowDragText = function (column) {
        if (column) {
            var colDef = column.getColDef();
            if (colDef.rowDragText) {
                return colDef.rowDragText;
            }
        }
        return this.gridOptionsService.get('rowDragText');
    };
    RowDragComp.prototype.addDragSource = function (dragStartPixels) {
        var _this = this;
        if (dragStartPixels === void 0) { dragStartPixels = 4; }
        // if this is changing the drag element, delete the previous dragSource
        if (this.dragSource) {
            this.removeDragSource();
        }
        var rowDragText = this.getRowDragText(this.column);
        var translate = this.localeService.getLocaleTextFunc();
        this.dragSource = {
            type: dragAndDropService_1.DragSourceType.RowDrag,
            eElement: this.getGui(),
            dragItemName: function () {
                var _a;
                var dragItem = _this.getDragItem();
                var dragItemCount = ((_a = dragItem.rowNodes) === null || _a === void 0 ? void 0 : _a.length) || 1;
                if (rowDragText) {
                    return rowDragText(dragItem, dragItemCount);
                }
                return dragItemCount === 1 ? _this.cellValueFn() : dragItemCount + " " + translate('rowDragRows', 'rows');
            },
            getDragItem: function () { return _this.getDragItem(); },
            dragStartPixels: dragStartPixels,
            dragSourceDomDataKey: this.beans.gridOptionsService.getDomDataKey()
        };
        this.beans.dragAndDropService.addDragSource(this.dragSource, true);
    };
    RowDragComp.prototype.removeDragSource = function () {
        if (this.dragSource) {
            this.beans.dragAndDropService.removeDragSource(this.dragSource);
        }
        this.dragSource = null;
    };
    __decorate([
        context_1.Autowired('beans')
    ], RowDragComp.prototype, "beans", void 0);
    __decorate([
        context_1.PostConstruct
    ], RowDragComp.prototype, "postConstruct", null);
    __decorate([
        context_1.PreDestroy
    ], RowDragComp.prototype, "removeDragSource", null);
    return RowDragComp;
}(component_1.Component));
exports.RowDragComp = RowDragComp;
var VisibilityStrategy = /** @class */ (function (_super) {
    __extends(VisibilityStrategy, _super);
    function VisibilityStrategy(parent, rowNode, column) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.rowNode = rowNode;
        _this.column = column;
        return _this;
    }
    VisibilityStrategy.prototype.setDisplayedOrVisible = function (neverDisplayed) {
        var displayedOptions = { skipAriaHidden: true };
        if (neverDisplayed) {
            this.parent.setDisplayed(false, displayedOptions);
        }
        else {
            var shown = true;
            var isShownSometimes = false;
            if (this.column) {
                shown = this.column.isRowDrag(this.rowNode) || this.parent.isCustomGui();
                isShownSometimes = function_1.isFunction(this.column.getColDef().rowDrag);
            }
            // if shown sometimes, them some rows can have drag handle while other don't,
            // so we use setVisible to keep the handles horizontally aligned (as setVisible
            // keeps the empty space, whereas setDisplayed looses the space)
            if (isShownSometimes) {
                this.parent.setDisplayed(true, displayedOptions);
                this.parent.setVisible(shown, displayedOptions);
            }
            else {
                this.parent.setDisplayed(shown, displayedOptions);
                this.parent.setVisible(true, displayedOptions);
            }
        }
    };
    return VisibilityStrategy;
}(beanStub_1.BeanStub));
// when non managed, the visibility depends on suppressRowDrag property only
var NonManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(NonManagedVisibilityStrategy, _super);
    function NonManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this, parent, rowNode, column) || this;
        _this.beans = beans;
        return _this;
    }
    NonManagedVisibilityStrategy.prototype.postConstruct = function () {
        this.addManagedPropertyListener('suppressRowDrag', this.onSuppressRowDrag.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    NonManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var neverDisplayed = this.beans.gridOptionsService.is('suppressRowDrag');
        this.setDisplayedOrVisible(neverDisplayed);
    };
    __decorate([
        context_1.PostConstruct
    ], NonManagedVisibilityStrategy.prototype, "postConstruct", null);
    return NonManagedVisibilityStrategy;
}(VisibilityStrategy));
// when managed, the visibility depends on sort, filter and row group, as well as suppressRowDrag property
var ManagedVisibilityStrategy = /** @class */ (function (_super) {
    __extends(ManagedVisibilityStrategy, _super);
    function ManagedVisibilityStrategy(parent, beans, rowNode, column) {
        var _this = _super.call(this, parent, rowNode, column) || this;
        _this.beans = beans;
        return _this;
    }
    ManagedVisibilityStrategy.prototype.postConstruct = function () {
        // we do not show the component if sort, filter or grouping is active
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_FILTER_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.beans.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.workOutVisibility.bind(this));
        // in case data changes, then we need to update visibility of drag item
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.workOutVisibility.bind(this));
        this.addManagedPropertyListener('suppressRowDrag', this.onSuppressRowDrag.bind(this));
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.onSuppressRowDrag = function () {
        this.workOutVisibility();
    };
    ManagedVisibilityStrategy.prototype.workOutVisibility = function () {
        // only show the drag if both sort and filter are not present
        var gridBodyCon = this.beans.ctrlsService.getGridBodyCtrl();
        var rowDragFeature = gridBodyCon.getRowDragFeature();
        var shouldPreventRowMove = rowDragFeature && rowDragFeature.shouldPreventRowMove();
        var suppressRowDrag = this.beans.gridOptionsService.is('suppressRowDrag');
        var hasExternalDropZones = this.beans.dragAndDropService.hasExternalDropZones();
        var neverDisplayed = (shouldPreventRowMove && !hasExternalDropZones) || suppressRowDrag;
        this.setDisplayedOrVisible(neverDisplayed);
    };
    __decorate([
        context_1.PostConstruct
    ], ManagedVisibilityStrategy.prototype, "postConstruct", null);
    return ManagedVisibilityStrategy;
}(VisibilityStrategy));
