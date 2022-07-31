"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bandScale_1 = require("../../scale/bandScale");
const chartAxis_1 = require("../chartAxis");
class CategoryAxis extends chartAxis_1.ChartAxis {
    constructor() {
        super(new bandScale_1.BandScale());
        this._paddingOverrideEnabled = false;
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
    set domain(values) {
        // Prevent duplicate categories.
        const valuesSet = new Set(values);
        this.scale.domain = new Array(...valuesSet.values());
    }
    get domain() {
        return this.scale.domain.slice();
    }
    calculateDomain({ primaryTickCount }) {
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
        return super.calculateDomain({ primaryTickCount });
    }
}
exports.CategoryAxis = CategoryAxis;
CategoryAxis.className = 'CategoryAxis';
CategoryAxis.type = 'category';
