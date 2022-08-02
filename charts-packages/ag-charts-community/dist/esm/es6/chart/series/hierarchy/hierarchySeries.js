import { Series, SeriesNodePickMode } from '../series';
export class HierarchySeries extends Series {
    constructor() {
        super({ pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
    }
    getLabelData() {
        return [];
    }
}
