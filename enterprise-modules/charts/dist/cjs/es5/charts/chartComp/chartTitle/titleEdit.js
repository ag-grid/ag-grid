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
exports.TitleEdit = void 0;
var core_1 = require("@ag-grid-community/core");
var TitleEdit = /** @class */ (function (_super) {
    __extends(TitleEdit, _super);
    function TitleEdit(chartMenu) {
        var _this = _super.call(this, TitleEdit.TEMPLATE) || this;
        _this.chartMenu = chartMenu;
        _this.editing = false;
        return _this;
    }
    TitleEdit.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.getGui(), 'keypress', function (e) {
            if (_this.editing && e.key === 'Enter') {
                _this.handleEndEditing();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', function () { return _this.endEditing(); });
    };
    /* should be called when the containing component changes to a new chart proxy */
    TitleEdit.prototype.refreshTitle = function (chartController, chartOptionsService) {
        var _this = this;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        var chartProxy = this.chartController.getChartProxy();
        if (chartProxy) {
            for (var i = 0; i++; i < this.destroyableChartListeners.length) {
                this.destroyableChartListeners[i]();
            }
            this.destroyableChartListeners = [];
        }
        var chart = chartProxy.getChart();
        var canvas = chart.scene.canvas.element;
        var destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', function (event) {
            var title = chart.title;
            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                var bbox = title.node.computeBBox();
                var xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
                _this.startEditing(__assign(__assign({}, bbox), xy));
            }
        });
        var wasInTitle = false;
        var destroyMouseMoveListener = this.addManagedListener(canvas, 'mousemove', function (event) {
            var title = chart.title;
            var inTitle = !!(title && title.enabled && title.node.containsPoint(event.offsetX, event.offsetY));
            if (wasInTitle !== inTitle) {
                canvas.style.cursor = inTitle ? 'pointer' : '';
            }
            wasInTitle = inTitle;
        });
        this.destroyableChartListeners = [
            destroyDbleClickListener,
            destroyMouseMoveListener
        ];
    };
    TitleEdit.prototype.startEditing = function (titleBBox) {
        if (this.chartMenu && this.chartMenu.isVisible()) {
            // currently, we ignore requests to edit the chart title while the chart menu is showing
            // because the click to edit the chart will also close the chart menu, making the position
            // of the title change.
            return;
        }
        if (this.editing) {
            return;
        }
        this.editing = true;
        var minimumTargetInputWidth = 300;
        var maximumInputWidth = this.chartController.getChartProxy().getChart().width;
        var inputWidth = Math.max(Math.min(titleBBox.width + 20, maximumInputWidth), minimumTargetInputWidth);
        var inputElement = this.getGui();
        inputElement.classList.add('currently-editing');
        var inputStyle = inputElement.style;
        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');
        // populate the input with the title, unless the title is the placeholder:
        var oldTitle = this.chartOptionsService.getChartOption('title.text');
        var isTitlePlaceholder = oldTitle === this.chartTranslationService.translate('titlePlaceholder');
        inputElement.value = isTitlePlaceholder ? '' : oldTitle;
        var inputRect = inputElement.getBoundingClientRect();
        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - inputRect.height / 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';
        inputElement.focus();
    };
    TitleEdit.prototype.handleEndEditing = function () {
        // special handling to avoid flicker caused by delay when swapping old and new titles
        var _this = this;
        // 1 - store current title color
        var titleColor = this.chartOptionsService.getChartOption('title.color');
        // 2 - hide title by making it transparent
        var transparentColor = 'rgba(0, 0, 0, 0)';
        this.chartOptionsService.setChartOption('title.color', transparentColor);
        // 3 - trigger 'end editing' - this will update the chart with the new title
        this.chartOptionsService.awaitChartOptionUpdate(function () { return _this.endEditing(); });
        // 4 - restore title color to its original value
        this.chartOptionsService.awaitChartOptionUpdate(function () {
            _this.chartOptionsService.setChartOption('title.color', titleColor);
        });
    };
    TitleEdit.prototype.endEditing = function () {
        var _this = this;
        if (!this.editing) {
            return;
        }
        this.editing = false;
        var value = this.getGui().value;
        if (value && value.trim() !== '') {
            this.chartOptionsService.setChartOption('title.text', value);
            this.chartOptionsService.setChartOption('title.enabled', true);
        }
        else {
            this.chartOptionsService.setChartOption('title.text', '');
            this.chartOptionsService.setChartOption('title.enabled', false);
        }
        this.getGui().classList.remove('currently-editing');
        // await chart updates so `chartTitleEdit` event consumers can read the new state correctly
        this.chartOptionsService.awaitChartOptionUpdate(function () {
            _this.eventService.dispatchEvent({ type: 'chartTitleEdit' });
        });
    };
    TitleEdit.TEMPLATE = "<input\n            class=\"ag-chart-title-edit\"\n            style=\"padding:0; border:none; border-radius: 0; min-height: 0; text-align: center;\" />\n        ";
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], TitleEdit.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], TitleEdit.prototype, "init", null);
    return TitleEdit;
}(core_1.Component));
exports.TitleEdit = TitleEdit;
