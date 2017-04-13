/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var BaseFilterWrapperComp = (function (_super) {
    __extends(BaseFilterWrapperComp, _super);
    function BaseFilterWrapperComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseFilterWrapperComp.prototype.init = function (params) {
        this.column = params.column;
        var base = utils_1._.loadTemplate("<div class=\"ag-header-cell\"><div class=\"ag-floating-filter-body\"></div></div>");
        this.enrichBody(base);
        this.setTemplateFromElement(base);
        this.setupWidth();
        this.addFeature(this.context, new setLeftFeature_1.SetLeftFeature(this.column, this.getGui()));
    };
    BaseFilterWrapperComp.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    BaseFilterWrapperComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    return BaseFilterWrapperComp;
}(component_1.Component));
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], BaseFilterWrapperComp.prototype, "context", void 0);
exports.BaseFilterWrapperComp = BaseFilterWrapperComp;
var FloatingFilterWrapperComp = (function (_super) {
    __extends(FloatingFilterWrapperComp, _super);
    function FloatingFilterWrapperComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FloatingFilterWrapperComp.prototype.init = function (params) {
        this.floatingFilterComp = params.floatingFilterComp;
        this.suppressFilterButton = params.suppressFilterButton;
        _super.prototype.init.call(this, params);
        if (!this.suppressFilterButton) {
            this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        }
    };
    FloatingFilterWrapperComp.prototype.enrichBody = function (body) {
        var floatingFilterBody = body.querySelector('.ag-floating-filter-body');
        if (this.suppressFilterButton) {
            floatingFilterBody.appendChild(this.floatingFilterComp.getGui());
            utils_1._.removeCssClass(floatingFilterBody, 'ag-floating-filter-body');
            utils_1._.addCssClass(floatingFilterBody, 'ag-floating-filter-full-body');
        }
        else {
            floatingFilterBody.appendChild(this.floatingFilterComp.getGui());
            body.appendChild(utils_1._.loadTemplate("<div class=\"ag-floating-filter-button\">\n                    <button ref=\"eButtonShowMainFilter\">...</button>            \n            </div>"));
        }
    };
    FloatingFilterWrapperComp.prototype.onParentModelChanged = function (parentModel) {
        this.floatingFilterComp.onParentModelChanged(parentModel);
    };
    FloatingFilterWrapperComp.prototype.showParentFilter = function () {
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filter');
    };
    return FloatingFilterWrapperComp;
}(BaseFilterWrapperComp));
__decorate([
    componentAnnotations_1.RefSelector('eButtonShowMainFilter'),
    __metadata("design:type", HTMLInputElement)
], FloatingFilterWrapperComp.prototype, "eButtonShowMainFilter", void 0);
__decorate([
    context_1.Autowired('menuFactory'),
    __metadata("design:type", Object)
], FloatingFilterWrapperComp.prototype, "menuFactory", void 0);
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
