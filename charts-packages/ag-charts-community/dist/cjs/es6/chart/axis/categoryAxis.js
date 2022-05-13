"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bandScale_1 = require("../../scale/bandScale");
const chartAxis_1 = require("../chartAxis");
class CategoryAxis extends chartAxis_1.ChartAxis {
    constructor() {
        super(new bandScale_1.BandScale());
        this.scale.paddingInner = 0.2;
        this.scale.paddingOuter = 0.3;
    }
    set paddingInner(value) {
        this.scale.paddingInner = value;
    }
    get paddingInner() {
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
        this.scale.domain = values
            .filter((s, i, arr) => arr.indexOf(s) === i);
    }
    get domain() {
        return this.scale.domain.slice();
    }
}
exports.CategoryAxis = CategoryAxis;
CategoryAxis.className = 'CategoryAxis';
CategoryAxis.type = 'category';
//# sourceMappingURL=categoryAxis.js.map