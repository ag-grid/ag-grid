/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var component_1 = require("../widgets/component");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnGroup_1 = require("../entities/columnGroup");
var columnController_1 = require("../columnController/columnController");
var renderedHeaderCell_1 = require("./deprecated/renderedHeaderCell");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var utils_1 = require("../utils");
var headerWrapperComp_1 = require("./header/headerWrapperComp");
var headerGroupWrapperComp_1 = require("./headerGroup/headerGroupWrapperComp");
var HeaderRowComp = (function (_super) {
    __extends(HeaderRowComp, _super);
    function HeaderRowComp(dept, showingGroups, pinned, eRoot, dropTarget) {
        var _this = _super.call(this, "<div class=\"ag-header-row\"/>") || this;
        _this.headerElements = {};
        _this.dept = dept;
        _this.showingGroups = showingGroups;
        _this.pinned = pinned;
        _this.eRoot = eRoot;
        _this.dropTarget = dropTarget;
        return _this;
    }
    HeaderRowComp.prototype.forEachHeaderElement = function (callback) {
        var _this = this;
        Object.keys(this.headerElements).forEach(function (key) {
            var headerElement = _this.headerElements[key];
            callback(headerElement);
        });
    };
    HeaderRowComp.prototype.destroy = function () {
        var idsOfAllChildren = Object.keys(this.headerElements);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
        _super.prototype.destroy.call(this);
    };
    HeaderRowComp.prototype.removeAndDestroyChildComponents = function (idsToDestroy) {
        var _this = this;
        idsToDestroy.forEach(function (id) {
            var child = _this.headerElements[id];
            _this.getGui().removeChild(child.getGui());
            child.destroy();
            delete _this.headerElements[id];
        });
    };
    HeaderRowComp.prototype.onRowHeightChanged = function () {
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        this.getGui().style.top = (this.dept * rowHeight) + 'px';
        this.getGui().style.height = rowHeight + 'px';
    };
    //noinspection JSUnusedLocalSymbols
    HeaderRowComp.prototype.init = function () {
        this.onRowHeightChanged();
        this.onVirtualColumnsChanged();
        this.setWidth();
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    };
    HeaderRowComp.prototype.onColumnResized = function () {
        this.setWidth();
    };
    HeaderRowComp.prototype.setWidth = function () {
        var mainRowWidth = this.columnController.getContainerWidth(this.pinned) + 'px';
        this.getGui().style.width = mainRowWidth;
    };
    HeaderRowComp.prototype.onGridColumnsChanged = function () {
        this.removeAndDestroyAllChildComponents();
    };
    HeaderRowComp.prototype.removeAndDestroyAllChildComponents = function () {
        var idsOfAllChildren = Object.keys(this.headerElements);
        this.removeAndDestroyChildComponents(idsOfAllChildren);
    };
    HeaderRowComp.prototype.onDisplayedColumnsChanged = function () {
        this.onVirtualColumnsChanged();
        this.setWidth();
    };
    HeaderRowComp.prototype.onVirtualColumnsChanged = function () {
        var _this = this;
        var currentChildIds = Object.keys(this.headerElements);
        var nodesAtDept = this.columnController.getVirtualHeaderGroupRow(this.pinned, this.dept);
        nodesAtDept.forEach(function (child) {
            var idOfChild = child.getUniqueId();
            // if we already have this cell rendered, do nothing
            if (currentChildIds.indexOf(idOfChild) >= 0) {
                utils_1.Utils.removeFromArray(currentChildIds, idOfChild);
                return;
            }
            // skip groups that have no displayed children. this can happen when the group is broken,
            // and this section happens to have nothing to display for the open / closed state.
            // (a broken group is one that is split, ie columns in the group have a non-group column
            // in between them)
            if (child instanceof columnGroup_1.ColumnGroup && child.getDisplayedChildren().length === 0) {
                return;
            }
            var renderedHeaderElement = _this.createHeaderElement(child);
            _this.headerElements[idOfChild] = renderedHeaderElement;
            _this.getGui().appendChild(renderedHeaderElement.getGui());
        });
        // at this point, anything left in currentChildIds is an element that is no longer in the viewport
        this.removeAndDestroyChildComponents(currentChildIds);
    };
    // check if user is using the deprecated
    HeaderRowComp.prototype.isUsingOldHeaderRenderer = function (column) {
        var colDef = column.getColDef();
        return utils_1.Utils.anyExists([
            // header template
            this.gridOptionsWrapper.getHeaderCellTemplateFunc(),
            this.gridOptionsWrapper.getHeaderCellTemplate(),
            colDef.headerCellTemplate,
            // header cellRenderer
            colDef.headerCellRenderer,
            this.gridOptionsWrapper.getHeaderCellRenderer()
        ]);
    };
    HeaderRowComp.prototype.createHeaderElement = function (columnGroupChild) {
        var result;
        if (columnGroupChild instanceof columnGroup_1.ColumnGroup) {
            result = new headerGroupWrapperComp_1.HeaderGroupWrapperComp(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
        }
        else {
            if (this.isUsingOldHeaderRenderer(columnGroupChild)) {
                ////// DEPRECATED - TAKE THIS OUT IN V9
                if (!warningGiven) {
                    console.warn('ag-Grid: since v8, custom headers are now done using components. Please refer to the documentation https://www.ag-grid.com/javascript-grid-header-rendering/. Support for the old way will be dropped in v9.');
                    warningGiven = true;
                }
                result = new renderedHeaderCell_1.RenderedHeaderCell(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
            }
            else {
                // the future!!!
                result = new headerWrapperComp_1.HeaderWrapperComp(columnGroupChild, this.eRoot, this.dropTarget, this.pinned);
            }
        }
        this.context.wireBean(result);
        return result;
    };
    return HeaderRowComp;
}(component_1.Component));
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], HeaderRowComp.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], HeaderRowComp.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], HeaderRowComp.prototype, "context", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], HeaderRowComp.prototype, "eventService", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HeaderRowComp.prototype, "init", null);
exports.HeaderRowComp = HeaderRowComp;
// remove this in v9, when we take out support for the old headers
var warningGiven = false;
