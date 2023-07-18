import { Axis } from '../../axis.mjs';
export class PolarAxis extends Axis {
    constructor() {
        super(...arguments);
        this.shape = 'polygon';
    }
    computeLabelsBBox(_options, _seriesRect) {
        return null;
    }
}
