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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var TitleEdit = /** @class */ (function (_super) {
    __extends(TitleEdit, _super);
    function TitleEdit(chartMenu) {
        var _this = _super.call(this, TitleEdit.TEMPLATE) || this;
        _this.chartMenu = chartMenu;
        return _this;
    }
    TitleEdit.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.getGui(), 'keypress', function (e) {
            if (e.key === 'Enter') {
                _this.endEditing();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', this.endEditing.bind(this));
    };
    /* should be called when the containing component changes to a new chart proxy */
    TitleEdit.prototype.setChartProxy = function (chartProxy) {
        var _this = this;
        if (this.chartProxy) {
            for (var i = 0; i++; i < this.destroyableChartListeners.length) {
                this.destroyableChartListeners[i]();
            }
            this.destroyableChartListeners = [];
        }
        this.chartProxy = chartProxy;
        var chart = this.chartProxy.getChart();
        var canvas = chart.scene.canvas.element;
        var destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', function (event) {
            var title = chart.title;
            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                var bbox = title.node.computeBBox();
                var xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
                _this.startEditing(__assign(__assign({}, bbox), xy));
            }
        });
        var destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', function (event) {
            var title = chart.title;
            var inTitle = title && title.node.containsPoint(event.offsetX, event.offsetY);
            canvas.style.cursor = inTitle ? 'pointer' : '';
        });
        this.destroyableChartListeners = [
            destroyDbleClickListener,
            destroyMouseMoveListener
        ];
    };
    TitleEdit.prototype.startEditing = function (titleBBox) {
        if (this.chartMenu.isVisible()) {
            // currently we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }
        var minimumTargetInputWidth = 300;
        var maximumInputWidth = this.chartProxy.getChart().width;
        var inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);
        var inputElement = this.getGui();
        core_1._.addCssClass(inputElement, 'currently-editing');
        var inputStyle = inputElement.style;
        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartProxy.getTitleOption('fontFamily');
        inputStyle.fontWeight = this.chartProxy.getTitleOption('fontWeight');
        inputStyle.fontStyle = this.chartProxy.getTitleOption('fontStyle');
        inputStyle.fontSize = this.chartProxy.getTitleOption('fontSize') + 'px';
        inputStyle.color = this.chartProxy.getTitleOption('color');
        // populate the input with the title, unless the title is the placeholder:
        var oldTitle = this.chartProxy.getTitleOption('text');
        var inputValue = oldTitle === this.chartTranslator.translate('titlePlaceholder') ? '' : oldTitle;
        inputElement.value = inputValue;
        var inputRect = inputElement.getBoundingClientRect();
        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';
        inputElement.focus();
    };
    TitleEdit.prototype.endEditing = function () {
        var value = this.getGui().value;
        this.chartProxy.setTitleOption('text', value);
        this.eventService.dispatchEvent({ 'type': 'chartTitleEdit' });
        core_1._.removeCssClass(this.getGui(), 'currently-editing');
    };
    TitleEdit.TEMPLATE = "<input\n            class=\"ag-chart-title-edit\"\n            style=\"padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;\" />\n        ";
    __decorate([
        core_1.Autowired('chartTranslator')
    ], TitleEdit.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], TitleEdit.prototype, "init", null);
    return TitleEdit;
}(core_1.Component));
exports.TitleEdit = TitleEdit;
//# sourceMappingURL=titleEdit.js.map