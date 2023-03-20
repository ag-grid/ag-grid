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
    updatePath() {
        const path = this.path;
        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const fullPie = number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
        const centerX = this.centerX;
        const centerY = this.centerY;
        path.clear();
        if (fullPie) {
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
        }
        else {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            path.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            if (innerRadius > 0) {
                path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            }
            else {
                path.lineTo(centerX, centerY);
            }
        }
        path.closePath();
        this.dirtyPath = false;
    }
    isPointInPath(x, y) {
        const { angleOffset } = this;
        const startAngle = angle_1.normalizeAngle360Inclusive(Math.min(this.startAngle, this.endAngle) + angleOffset);
        const endAngle = angle_1.normalizeAngle360Inclusive(Math.max(this.startAngle, this.endAngle) + angleOffset);
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const point = this.transformPoint(x, y);
        const deltaX = point.x - this.centerX;
        const deltaY = point.y - this.centerY;
        const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if (distance < innerRadius || distance > outerRadius) {
            return false;
        }
        const angle = angle_1.normalizeAngle360Inclusive(Math.atan2(deltaY, deltaX));
        if (startAngle > endAngle) {
            // Sector passes through 0-angle.
            return startAngle < angle || endAngle > angle;
        }
        if (startAngle === endAngle) {
            return true;
        }
        return startAngle < angle && endAngle > angle;
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
