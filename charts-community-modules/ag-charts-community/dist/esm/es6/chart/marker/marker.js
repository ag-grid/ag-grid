var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path, ScenePathChangeDetection } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
export class Marker extends Path {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.size = 12;
    }
    computeBBox() {
        const { x, y, size } = this;
        const half = size / 2;
        return new BBox(x - half, y - half, size, size);
    }
    applyPath(s, moves) {
        const { path } = this;
        let { x, y } = this;
        path.clear();
        for (const { x: mx, y: my, t } of moves) {
            x += mx * s;
            y += my * s;
            if (t === 'move') {
                path.moveTo(x, y);
            }
            else {
                path.lineTo(x, y);
            }
        }
        path.closePath();
    }
}
__decorate([
    ScenePathChangeDetection()
], Marker.prototype, "x", void 0);
__decorate([
    ScenePathChangeDetection()
], Marker.prototype, "y", void 0);
__decorate([
    ScenePathChangeDetection({ convertor: Math.abs })
], Marker.prototype, "size", void 0);
