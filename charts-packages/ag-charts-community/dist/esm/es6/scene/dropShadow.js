var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BOOLEAN, COLOR_STRING, NUMBER, Validate } from '../util/validation';
import { ChangeDetectable, RedrawType } from './changeDetectable';
import { SceneChangeDetection } from './node';
export class DropShadow extends ChangeDetectable {
    constructor() {
        super(...arguments);
        this.enabled = true;
        this.color = 'rgba(0, 0, 0, 0.5)';
        this.xOffset = 0;
        this.yOffset = 0;
        this.blur = 5;
    }
}
__decorate([
    Validate(BOOLEAN),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "enabled", void 0);
__decorate([
    Validate(COLOR_STRING),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "color", void 0);
__decorate([
    Validate(NUMBER()),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "xOffset", void 0);
__decorate([
    Validate(NUMBER()),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "yOffset", void 0);
__decorate([
    Validate(NUMBER(0)),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], DropShadow.prototype, "blur", void 0);
