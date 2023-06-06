import { Series, SeriesNodePickMode } from '../series';
export class HierarchySeries extends Series {
    constructor(moduleCtx) {
        super({ moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }
    getLabelData() {
        return [];
    }
}
