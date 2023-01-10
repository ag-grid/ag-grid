"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sector = void 0;
const path_1 = require("./path");
const angle_1 = require("../../util/angle");
const number_1 = require("../../util/number");
const bbox_1 = require("../bbox");
class Sector extends path_1.Path {
    constructor() {
        super(...arguments);
        this.centerX = 0;
        this.centerY = 0;
        this.innerRadius = 10;
        this.outerRadius = 20;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.angleOffset = 0;
    }
    computeBBox() {
        const radius = this.outerRadius;
        return new bbox_1.BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    }
    isFullPie() {
        return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
    }
    updatePath() {
        const path = this.path;
        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const fullPie = this.isFullPie();
        let centerX = this.centerX;
        let centerY = this.centerY;
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
            const x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(Math.abs(x) < 1e-8 ? 0 : x, centerY + innerRadius * Math.sin(endAngle));
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();
        this.dirtyPath = false;
    }
}
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
exports.Sector = Sector;
