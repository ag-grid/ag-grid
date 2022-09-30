var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { getFont } from '../../scene/shape/text';
import { Observable, reactive } from '../../util/observable';
export class Label extends Observable {
    constructor() {
        super();
        this.enabled = true;
        this.fontSize = 8;
        this.fontFamily = 'Verdana, sans-serif';
        this.color = 'rgba(70, 70, 70, 1)';
    }
    getFont() {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
__decorate([
    reactive('change', 'dataChange')
], Label.prototype, "enabled", void 0);
__decorate([
    reactive('change')
], Label.prototype, "fontSize", void 0);
__decorate([
    reactive('change')
], Label.prototype, "fontFamily", void 0);
__decorate([
    reactive('change')
], Label.prototype, "fontStyle", void 0);
__decorate([
    reactive('change')
], Label.prototype, "fontWeight", void 0);
__decorate([
    reactive('change')
], Label.prototype, "color", void 0);
