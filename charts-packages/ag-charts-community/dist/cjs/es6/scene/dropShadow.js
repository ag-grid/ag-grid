"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropShadow = void 0;
const validation_1 = require("../util/validation");
const changeDetectable_1 = require("./changeDetectable");
class DropShadow extends changeDetectable_1.ChangeDetectable {
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
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.BOOLEAN,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], DropShadow.prototype, "enabled", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.COLOR_STRING,
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], DropShadow.prototype, "color", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.NUMBER(),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], DropShadow.prototype, "xOffset", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.NUMBER(),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], DropShadow.prototype, "yOffset", void 0);
__decorate([
    validation_1.ValidateAndChangeDetection({
        validatePredicate: validation_1.NUMBER(0),
        sceneChangeDetectionOpts: { redraw: changeDetectable_1.RedrawType.MAJOR },
    })
], DropShadow.prototype, "blur", void 0);
exports.DropShadow = DropShadow;
