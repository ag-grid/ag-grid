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
var renderedItem_1 = require("./renderedItem");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var main_8 = require("ag-grid/main");
var svgFactory = main_2.SvgFactory.getInstance();
var RenderedColumn = (function (_super) {
    __extends(RenderedColumn, _super);
    function RenderedColumn(column, columnDept, allowDragging) {
        _super.call(this, RenderedColumn.TEMPLATE);
        this.column = column;
        this.columnDept = columnDept;
        this.allowDragging = allowDragging;
    }
    RenderedColumn.prototype.init = function () {
        var eText = this.queryForHtmlElement('#eText');
        eText.innerHTML = this.columnController.getDisplayNameForCol(this.column);
        eText.addEventListener('dblclick', this.onColumnVisibilityChanged.bind(this));
        this.setupVisibleIcons();
        var eIndent = this.queryForHtmlElement('#eIndent');
        eIndent.style.width = (this.columnDept * 10) + 'px';
        if (this.allowDragging) {
            this.addDragSource();
        }
    };
    RenderedColumn.prototype.setupVisibleIcons = function () {
        var _this = this;
        this.eColumnHiddenIcon = this.queryForHtmlElement('#eColumnHiddenIcon');
        this.eColumnVisibleIcon = this.queryForHtmlElement('#eColumnVisibleIcon');
        this.eColumnHiddenIcon.appendChild(svgFactory.createColumnHiddenIcon());
        this.eColumnVisibleIcon.appendChild(svgFactory.createColumnVisibleIcon());
        this.eColumnHiddenIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));
        this.eColumnVisibleIcon.addEventListener('click', this.onColumnVisibilityChanged.bind(this));
        var columnStateChangedListener = this.onColumnStateChangedListener.bind(this);
        this.column.addEventListener(main_7.Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener);
        this.addDestroyFunc(function () { return _this.column.removeEventListener(main_7.Column.EVENT_VISIBLE_CHANGED, columnStateChangedListener); });
        this.setIconVisibility();
    };
    RenderedColumn.prototype.addDragSource = function () {
        var dragSource = {
            eElement: this.getGui(),
            dragItem: this.column
        };
        this.dragAndDropService.addDragSource(dragSource);
    };
    RenderedColumn.prototype.onColumnStateChangedListener = function () {
        this.setIconVisibility();
    };
    RenderedColumn.prototype.setIconVisibility = function () {
        var visible = this.column.isVisible();
        main_1.Utils.setVisible(this.eColumnVisibleIcon, visible);
        main_1.Utils.setVisible(this.eColumnHiddenIcon, !visible);
    };
    RenderedColumn.prototype.onColumnVisibilityChanged = function () {
        var newValue = !this.column.isVisible();
        this.columnController.setColumnVisible(this.column, newValue);
    };
    RenderedColumn.TEMPLATE = '<div class="ag-column-select-column">' +
        '  <span id="eIndent" class="ag-column-select-indent"></span>' +
        '  <span class="ag-column-group-icons">' +
        '    <span id="eColumnVisibleIcon" class="ag-column-visible-icon"></span>' +
        '    <span id="eColumnHiddenIcon" class="ag-column-hidden-icon"></span>' +
        '  </span>' +
        '    <span id="eText" class="ag-column-select-label"></span>' +
        '</div>';
    __decorate([
        main_3.Autowired('columnController'), 
        __metadata('design:type', main_4.ColumnController)
    ], RenderedColumn.prototype, "columnController", void 0);
    __decorate([
        main_3.Autowired('dragAndDropService'), 
        __metadata('design:type', main_5.DragAndDropService)
    ], RenderedColumn.prototype, "dragAndDropService", void 0);
    __decorate([
        main_3.Autowired('gridPanel'), 
        __metadata('design:type', main_6.GridPanel)
    ], RenderedColumn.prototype, "gridPanel", void 0);
    __decorate([
        main_8.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedColumn.prototype, "init", null);
    return RenderedColumn;
})(renderedItem_1.RenderedItem);
exports.RenderedColumn = RenderedColumn;
