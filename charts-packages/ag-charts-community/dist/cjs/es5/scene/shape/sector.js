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
exports.Sector = void 0;
var path_1 = require("./path");
var angle_1 = require("../../util/angle");
var number_1 = require("../../util/number");
var bbox_1 = require("../bbox");
var Sector = /** @class */ (function (_super) {
    __extends(Sector, _super);
    function Sector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.innerRadius = 10;
        _this.outerRadius = 20;
        _this.startAngle = 0;
        _this.endAngle = Math.PI * 2;
        _this.angleOffset = 0;
        return _this;
    }
    Sector.prototype.computeBBox = function () {
        var radius = this.outerRadius;
        return new bbox_1.BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    };
    Sector.prototype.isFullPie = function () {
        return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
    };
    Sector.prototype.updatePath = function () {
        var path = this.path;
        var angleOffset = this.angleOffset;
        var startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        var endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        var innerRadius = Math.min(this.innerRadius, this.outerRadius);
        var outerRadius = Math.max(this.innerRadius, this.outerRadius);
        var fullPie = this.isFullPie();
        var centerX = this.centerX;
        var centerY = this.centerY;
        path.clear();
        if (!fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.lineTo(centerX + outerRadius * Math.cos(startAngle), centerY + outerRadius * Math.sin(startAngle));
        }
        path.cubicArc(centerX, centerY, outerRadius, outerRadius, 0, startAngle, endAngle, 0);
        if (fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
        }
        else {
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            var x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(Math.abs(x) < 1e-8 ? 0 : x, centerY + innerRadius * Math.sin(endAngle));
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();
        this.dirtyPath = false;
    };
    Sector.className = 'Sector';
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "centerX", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "centerY", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "innerRadius", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "outerRadius", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "startAngle", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "endAngle", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Sector.prototype, "angleOffset", void 0);
    return Sector;
}(path_1.Path));
exports.Sector = Sector;
