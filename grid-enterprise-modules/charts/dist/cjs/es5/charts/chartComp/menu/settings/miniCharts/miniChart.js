"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniChart = void 0;
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
// import { _Scene } from "ag-charts-enterprise";
var CANVAS_CLASS = 'ag-chart-mini-thumbnail-canvas';
var ERROR_MESSAGE = 'AG Grid - chart update failed';
var MiniChart = /** @class */ (function (_super) {
    __extends(MiniChart, _super);
    function MiniChart(container, tooltipName) {
        var _this = _super.call(this) || this;
        _this.size = 58;
        _this.padding = 5;
        _this.root = new ag_charts_community_1._Scene.Group();
        var scene = new ag_charts_community_1._Scene.Scene({
            window: window,
            document: window.document,
            width: _this.size,
            height: _this.size
        });
        scene.canvas.element.classList.add(CANVAS_CLASS);
        scene.root = _this.root;
        scene.container = container;
        _this.scene = scene;
        _this.tooltipName = tooltipName;
        return _this;
    }
    MiniChart.prototype.init = function () {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
        // Necessary to force scene graph render as we are not using the standalone factory.
        this.scene.render()
            .catch(function (e) {
            console.error("".concat(ERROR_MESSAGE), e);
        });
    };
    __decorate([
        (0, core_1.Autowired)('chartTranslationService')
    ], MiniChart.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MiniChart.prototype, "init", null);
    return MiniChart;
}(core_1.Component));
exports.MiniChart = MiniChart;
