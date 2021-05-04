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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var MiniChart = /** @class */ (function (_super) {
    __extends(MiniChart, _super);
    function MiniChart(container, tooltipName) {
        var _this = _super.call(this) || this;
        _this.size = 58;
        _this.padding = 5;
        _this.root = new ag_charts_community_1.Group();
        var scene = new ag_charts_community_1.Scene(window.document, _this.size, _this.size);
        core_1._.addCssClass(scene.canvas.element, 'ag-chart-mini-thumbnail-canvas');
        scene.root = _this.root;
        scene.container = container;
        _this.scene = scene;
        _this.tooltipName = tooltipName;
        return _this;
    }
    MiniChart.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslator.translate(this.tooltipName);
    };
    __decorate([
        core_1.Autowired('chartTranslator')
    ], MiniChart.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], MiniChart.prototype, "init", null);
    return MiniChart;
}(core_1.Component));
exports.MiniChart = MiniChart;
//# sourceMappingURL=miniChart.js.map