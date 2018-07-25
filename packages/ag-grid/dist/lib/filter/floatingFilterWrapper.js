/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var utils_1 = require("../utils");
var setLeftFeature_1 = require("../rendering/features/setLeftFeature");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var beans_1 = require("../rendering/beans");
var hoverFeature_1 = require("../headerRendering/hoverFeature");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var columnHoverService_1 = require("../rendering/columnHoverService");
var BaseFilterWrapperComp = (function (_super) {
    __extends(BaseFilterWrapperComp, _super);
    function BaseFilterWrapperComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseFilterWrapperComp.prototype.init = function (params) {
        this.column = params.column;
        var base = utils_1._.loadTemplate("<div class=\"ag-header-cell\" aria-hidden=\"true\"><div class=\"ag-floating-filter-body\" aria-hidden=\"true\"></div></div>");
        this.enrichBody(base);
        this.setTemplateFromElement(base);
        this.setupWidth();
        this.addColumnHoverListener();
        this.addFeature(this.context, new hoverFeature_1.HoverFeature([this.column], this.getGui()));
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
    };
    BaseFilterWrapperComp.prototype.addColumnHoverListener = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    BaseFilterWrapperComp.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    BaseFilterWrapperComp.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    BaseFilterWrapperComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], BaseFilterWrapperComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnHoverService'),
        __metadata("design:type", columnHoverService_1.ColumnHoverService)
    ], BaseFilterWrapperComp.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], BaseFilterWrapperComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('beans'),
        __metadata("design:type", beans_1.Beans)
    ], BaseFilterWrapperComp.prototype, "beans", void 0);
    return BaseFilterWrapperComp;
}(component_1.Component));
exports.BaseFilterWrapperComp = BaseFilterWrapperComp;
var FloatingFilterWrapperComp = (function (_super) {
    __extends(FloatingFilterWrapperComp, _super);
    function FloatingFilterWrapperComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FloatingFilterWrapperComp.prototype.init = function (params) {
        this.floatingFilterCompPromise = params.floatingFilterComp;
        this.suppressFilterButton = params.suppressFilterButton;
        _super.prototype.init.call(this, params);
        this.addEventListeners();
    };
    FloatingFilterWrapperComp.prototype.addEventListeners = function () {
        if (!this.suppressFilterButton && this.eButtonShowMainFilter) {
            this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        }
    };
    FloatingFilterWrapperComp.prototype.enrichBody = function (body) {
        var _this = this;
        this.floatingFilterCompPromise.then(function (floatingFilterComp) {
            var floatingFilterBody = body.querySelector('.ag-floating-filter-body');
            var floatingFilterCompUi = floatingFilterComp.getGui();
            if (_this.suppressFilterButton) {
                floatingFilterBody.appendChild(floatingFilterCompUi);
                utils_1._.removeCssClass(floatingFilterBody, 'ag-floating-filter-body');
                utils_1._.addCssClass(floatingFilterBody, 'ag-floating-filter-full-body');
            }
            else {
                floatingFilterBody.appendChild(floatingFilterCompUi);
                body.appendChild(utils_1._.loadTemplate("<div class=\"ag-floating-filter-button\" aria-hidden=\"true\">\n                        <button type=\"button\" ref=\"eButtonShowMainFilter\"></button>\n                </div>"));
                var eIcon = utils_1._.createIconNoSpan('filter', _this.gridOptionsWrapper, _this.column);
                body.querySelector('button').appendChild(eIcon);
            }
            if (floatingFilterComp.afterGuiAttached) {
                floatingFilterComp.afterGuiAttached();
            }
            _this.wireQuerySelectors();
            _this.addEventListeners();
        });
    };
    FloatingFilterWrapperComp.prototype.onParentModelChanged = function (parentModel) {
        var combinedFilter = undefined;
        var mainModel = null;
        if (parentModel && parentModel.operator) {
            combinedFilter = parentModel;
            mainModel = combinedFilter.condition1;
        }
        else {
            mainModel = parentModel;
        }
        this.floatingFilterCompPromise.then(function (floatingFilterComp) {
            floatingFilterComp.onParentModelChanged(mainModel, combinedFilter);
        });
    };
    FloatingFilterWrapperComp.prototype.showParentFilter = function () {
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filterMenuTab', ['filterMenuTab']);
    };
    __decorate([
        componentAnnotations_1.RefSelector('eButtonShowMainFilter'),
        __metadata("design:type", HTMLInputElement)
    ], FloatingFilterWrapperComp.prototype, "eButtonShowMainFilter", void 0);
    __decorate([
        context_1.Autowired('menuFactory'),
        __metadata("design:type", Object)
    ], FloatingFilterWrapperComp.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], FloatingFilterWrapperComp.prototype, "gridOptionsWrapper", void 0);
    return FloatingFilterWrapperComp;
}(BaseFilterWrapperComp));
exports.FloatingFilterWrapperComp = FloatingFilterWrapperComp;
var EmptyFloatingFilterWrapperComp = (function (_super) {
    __extends(EmptyFloatingFilterWrapperComp, _super);
    function EmptyFloatingFilterWrapperComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmptyFloatingFilterWrapperComp.prototype.enrichBody = function (body) {
    };
    EmptyFloatingFilterWrapperComp.prototype.onParentModelChanged = function (parentModel) {
    };
    return EmptyFloatingFilterWrapperComp;
}(BaseFilterWrapperComp));
exports.EmptyFloatingFilterWrapperComp = EmptyFloatingFilterWrapperComp;
