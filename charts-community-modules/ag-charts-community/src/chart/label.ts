import { BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, COLOR_STRING, STRING, Validate } from '../util/validation';
import { getFont } from '../scene/shape/text';
import { FontStyle, FontWeight } from './agChartOptions';
import { normalizeAngle360, toRadians } from '../util/angle';

export class Label {
    @Validate(BOOLEAN)
    enabled = true;

    @Validate(NUMBER(0))
    fontSize = 12;

    @Validate(STRING)
    fontFamily = 'Verdana, sans-serif';

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(COLOR_STRING)
    color = 'rgba(70, 70, 70, 1)';

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}

export function calculateLabelRotation(opts: {
    rotation?: number;
    parallel?: boolean;
    regularFlipRotation?: number;
    parallelFlipRotation?: number;
}) {
    const { parallelFlipRotation = 0, regularFlipRotation = 0 } = opts;
    const labelRotation = opts.rotation ? normalizeAngle360(toRadians(opts.rotation)) : 0;
    const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
    // Flip if the axis rotation angle is in the top hemisphere.
    const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;

    let autoRotation = 0;
    if (opts.parallel) {
        autoRotation = (parallelFlipFlag * Math.PI) / 2;
    } else if (regularFlipFlag === -1) {
        autoRotation = Math.PI;
    }

    return { labelRotation, autoRotation, parallelFlipFlag, regularFlipFlag };
}
