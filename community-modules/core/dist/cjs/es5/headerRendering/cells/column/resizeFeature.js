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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeFeature = void 0;
var beanStub_1 = require("../../../context/beanStub");
var context_1 = require("../../../context/context");
var dom_1 = require("../../../utils/dom");
var touchListener_1 = require("../../../widgets/touchListener");
var ResizeFeature = /** @class */ (function (_super) {
    __extends(ResizeFeature, _super);
    function ResizeFeature(pinned, column, eResize, comp, ctrl) {
        var _this = _super.call(this) || this;
        _this.pinned = pinned;
        _this.column = column;
        _this.eResize = eResize;
        _this.comp = comp;
        _this.ctrl = ctrl;
        return _this;
    }
    ResizeFeature.prototype.postConstruct = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var destroyResizeFuncs = [];
        var canResize;
        var canAutosize;
        var addResize = function () {
            dom_1.setDisplayed(_this.eResize, canResize);
            if (!canResize) {
                return;
            }
            var finishedWithResizeFunc = _this.horizontalResizeService.addResizeBar({
                eResizeBar: _this.eResize,
                onResizeStart: _this.onResizeStart.bind(_this),
                onResizing: _this.onResizing.bind(_this, false),
                onResizeEnd: _this.onResizing.bind(_this, true)
            });
            destroyResizeFuncs.push(finishedWithResizeFunc);
            if (canAutosize) {
                var skipHeaderOnAutoSize_1 = _this.gridOptionsService.is('skipHeaderOnAutoSize');
                var autoSizeColListener_1 = function () {
                    _this.columnModel.autoSizeColumn(_this.column, skipHeaderOnAutoSize_1, "uiColumnResized");
                };
                _this.eResize.addEventListener('dblclick', autoSizeColListener_1);
                var touchListener_2 = new touchListener_1.TouchListener(_this.eResize);
                touchListener_2.addEventListener(touchListener_1.TouchListener.EVENT_DOUBLE_TAP, autoSizeColListener_1);
                _this.addDestroyFunc(function () {
                    _this.eResize.removeEventListener('dblclick', autoSizeColListener_1);
                    touchListener_2.removeEventListener(touchListener_1.TouchListener.EVENT_DOUBLE_TAP, autoSizeColListener_1);
                    touchListener_2.destroy();
                });
            }
        };
        var removeResize = function () {
            destroyResizeFuncs.forEach(function (f) { return f(); });
            destroyResizeFuncs.length = 0;
        };
        var refresh = function () {
            var resize = _this.column.isResizable();
            var autoSize = !_this.gridOptionsService.is('suppressAutoSize') && !colDef.suppressAutoSize;
            var propertyChange = resize !== canResize || autoSize !== canAutosize;
            if (propertyChange) {
                canResize = resize;
                canAutosize = autoSize;
                removeResize();
                addResize();
            }
        };
        refresh();
        this.addDestroyFunc(removeResize);
        this.ctrl.addRefreshFunction(refresh);
    };
    ResizeFeature.prototype.onResizing = function (finished, resizeAmount) {
        var resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        var columnWidths = [{ key: this.column, newWidth: this.resizeStartWidth + resizeAmountNormalised }];
        this.columnModel.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnDragged");
        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    };
    ResizeFeature.prototype.onResizeStart = function (shiftKey) {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;
        this.comp.addOrRemoveCssClass('ag-column-resizing', true);
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    ResizeFeature.prototype.normaliseResizeAmount = function (dragChange) {
        var result = dragChange;
        var notPinningLeft = this.pinned !== 'left';
        var pinningRight = this.pinned === 'right';
        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (notPinningLeft) {
                result *= -1;
            }
        }
        else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (pinningRight) {
                result *= -1;
            }
        }
        return result;
    };
    __decorate([
        context_1.Autowired('horizontalResizeService')
    ], ResizeFeature.prototype, "horizontalResizeService", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], ResizeFeature.prototype, "columnModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], ResizeFeature.prototype, "postConstruct", null);
    return ResizeFeature;
}(beanStub_1.BeanStub));
exports.ResizeFeature = ResizeFeature;
