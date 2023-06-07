var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
var TitleEdit = /** @class */ (function (_super) {
    __extends(TitleEdit, _super);
    function TitleEdit(chartMenu) {
        var _this = _super.call(this, TitleEdit.TEMPLATE) || this;
        _this.chartMenu = chartMenu;
        _this.destroyableChartListeners = [];
        _this.editing = false;
        return _this;
    }
    TitleEdit.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.getGui(), 'keydown', function (e) {
            if (_this.editing && e.key === 'Enter' && !e.shiftKey) {
                _this.handleEndEditing();
                e.preventDefault();
            }
        });
        this.addManagedListener(this.getGui(), 'input', function () {
            if (_this.editing) {
                _this.updateHeight();
            }
        });
        this.addManagedListener(this.getGui(), 'blur', function () { return _this.endEditing(); });
    };
    /* should be called when the containing component changes to a new chart proxy */
    TitleEdit.prototype.refreshTitle = function (chartController, chartOptionsService) {
        var e_1, _a;
        var _this = this;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        try {
            for (var _b = __values(this.destroyableChartListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var destroyFn = _c.value;
                destroyFn();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.destroyableChartListeners = [];
        var chartProxy = this.chartController.getChartProxy();
        var chart = chartProxy.getChart();
        var canvas = chart.scene.canvas.element;
        var destroyDbleClickListener = this.addManagedListener(canvas, 'dblclick', function (event) {
            var title = chart.title;
            if (title && title.node.containsPoint(event.offsetX, event.offsetY)) {
                var bbox = title.node.computeBBox();
                var xy = title.node.inverseTransformPoint(bbox.x, bbox.y);
                _this.startEditing(__assign(__assign({}, bbox), xy), canvas.width);
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
    TitleEdit.prototype.startEditing = function (titleBBox, canvasWidth) {
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
        var inputWidth = Math.max(Math.min(titleBBox.width + 20, canvasWidth), minimumTargetInputWidth);
        var element = this.getGui();
        element.classList.add('currently-editing');
        var inputStyle = element.style;
        // match style of input to title that we're editing
        inputStyle.fontFamily = this.chartOptionsService.getChartOption('title.fontFamily');
        inputStyle.fontWeight = this.chartOptionsService.getChartOption('title.fontWeight');
        inputStyle.fontStyle = this.chartOptionsService.getChartOption('title.fontStyle');
        inputStyle.fontSize = this.chartOptionsService.getChartOption('title.fontSize') + 'px';
        inputStyle.color = this.chartOptionsService.getChartOption('title.color');
        // populate the input with the title, unless the title is the placeholder:
        var oldTitle = this.chartOptionsService.getChartOption('title.text');
        var isTitlePlaceholder = oldTitle === this.chartTranslationService.translate('titlePlaceholder');
        element.value = isTitlePlaceholder ? '' : oldTitle;
        var oldTitleLines = oldTitle.split(/\r?\n/g).length;
        inputStyle.left = Math.round(titleBBox.x + titleBBox.width / 2 - inputWidth / 2 - 1) + 'px';
        inputStyle.top = Math.round(titleBBox.y + titleBBox.height / 2 - (oldTitleLines * this.getLineHeight()) / 2 - 2) + 'px';
        inputStyle.width = Math.round(inputWidth) + 'px';
        inputStyle.lineHeight = this.getLineHeight() + 'px';
        this.updateHeight();
        element.focus();
    };
    TitleEdit.prototype.updateHeight = function () {
        var element = this.getGui();
        // The element should cover the title and provide enough space for the new one.
        var oldTitleLines = this.chartOptionsService.getChartOption('title.text').split(/\r?\n/g).length;
        var currentTitleLines = element.value.split(/\r?\n/g).length;
        element.style.height = (Math.round(Math.max(oldTitleLines, currentTitleLines) * this.getLineHeight()) + 4) + 'px';
    };
    TitleEdit.prototype.getLineHeight = function () {
        var fixedLineHeight = this.chartOptionsService.getChartOption('title.lineHeight');
        if (fixedLineHeight) {
            return parseInt(fixedLineHeight);
        }
        return Math.round(parseInt(this.chartOptionsService.getChartOption('title.fontSize')) * 1.2);
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
    TitleEdit.TEMPLATE = "<textarea\n             class=\"ag-chart-title-edit\"\n             style=\"padding:0; border:none; border-radius: 0; min-height: 0; text-align: center; resize: none;\" />\n        ";
    __decorate([
        Autowired('chartTranslationService')
    ], TitleEdit.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], TitleEdit.prototype, "init", null);
    return TitleEdit;
}(Component));
export { TitleEdit };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGVFZGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvY2hhcnRUaXRsZS90aXRsZUVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBUTlFO0lBQStCLDZCQUFTO0lBY3BDLG1CQUE2QixTQUFvQjtRQUFqRCxZQUNJLGtCQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FDNUI7UUFGNEIsZUFBUyxHQUFULFNBQVMsQ0FBVztRQUx6QywrQkFBeUIsR0FBbUIsRUFBRSxDQUFDO1FBRy9DLGFBQU8sR0FBWSxLQUFLLENBQUM7O0lBSWpDLENBQUM7SUFHTSx3QkFBSSxHQUFYO1FBREEsaUJBY0M7UUFaRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxVQUFDLENBQWdCO1lBQy9ELElBQUksS0FBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xELEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDdEI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFO1lBQzVDLElBQUksS0FBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxLQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDdkI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxF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