var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NUMBER, Validate } from '../../util/validation';
import { BandScale } from '../../scale/bandScale';
import { ChartAxis } from '../chartAxis';
export class CategoryAxis extends ChartAxis {
    constructor() {
        super(new BandScale());
        this._paddingOverrideEnabled = false;
        this.groupPaddingInner = 0.1;
        this.includeInvisibleDomains = true;
    }
    set paddingInner(value) {
        this._paddingOverrideEnabled = true;
        this.scale.paddingInner = value;
    }
    get paddingInner() {
        this._paddingOverrideEnabled = true;
        return this.scale.paddingInner;
    }
    set paddingOuter(value) {
        this.scale.paddingOuter = value;
    }
    get paddingOuter() {
        return this.scale.paddingOuter;
    }
    normaliseDataDomain(d) {
        // Prevent duplicate categories.
        const valuesSet = new Set(d);
        return new Array(...valuesSet.values());
    }
    calculateDomain() {
        if (!this._paddingOverrideEnabled) {
            const { boundSeries } = this;
            if (boundSeries.some((s) => ['bar', 'column'].includes(s.type))) {
                this.scale.paddingInner = 0.2;
                this.scale.paddingOuter = 0.3;
            }
            else {
                this.scale.paddingInner = 1;
                this.scale.paddingOuter = 0;
            }
        }
        return super.calculateDomain();
    }
}
CategoryAxis.className = 'CategoryAxis';
CategoryAxis.type = 'category';
__decorate([
    Validate(NUMBER(0, 1))
], CategoryAxis.prototype, "groupPaddingInner", void 0);
