import { BOOLEAN, NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, COLOR_STRING, STRING, Validate } from '../util/validation';
import { getFont } from '../scene/shape/text';
import { FontStyle, FontWeight } from './agChartOptions';
import { normalizeAngle360, toRadians } from '../util/angle';
import { BBox } from '../scene/bbox';
import { Matrix } from '../scene/matrix';
import { axisLabelsOverlap, PointLabelDatum } from '../util/labelPlacement';

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
        return getFont(this);
    }
}
export type Flag = 1 | -1;
export function calculateLabelRotation(opts: {
    rotation?: number;
    parallel?: boolean;
    regularFlipRotation?: number;
    parallelFlipRotation?: number;
}): { configuredRotation: number; defaultRotation: number; parallelFlipFlag: Flag; regularFlipFlag: Flag } {
    const { parallelFlipRotation = 0, regularFlipRotation = 0 } = opts;
    const configuredRotation = opts.rotation ? normalizeAngle360(toRadians(opts.rotation)) : 0;
    const parallelFlipFlag =
        !configuredRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
    // Flip if the axis rotation angle is in the top hemisphere.
    const regularFlipFlag = !configuredRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;

    let defaultRotation = 0;
    if (opts.parallel) {
        defaultRotation = (parallelFlipFlag * Math.PI) / 2;
    } else if (regularFlipFlag === -1) {
        defaultRotation = Math.PI;
    }

    return { configuredRotation, defaultRotation, parallelFlipFlag, regularFlipFlag };
}

export function calculateLabelAutoRotation(
    labelData: PointLabelDatum[],
    minSpacing: number,
    autoRotateAngle: number,
    rotated?: boolean
) {
    const labelSpacing = getLabelSpacing(minSpacing, rotated);
    const labelsOverlap = axisLabelsOverlap(labelData, labelSpacing);
    // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`autoRotateLabels` is `true`),
    // automatically rotate the labels
    if (labelsOverlap) {
        return normalizeAngle360(toRadians(autoRotateAngle));
    }
    return 0;
}

export function getLabelSpacing(minSpacing: number, rotated?: boolean): number {
    if (!isNaN(minSpacing)) {
        return minSpacing;
    }
    return rotated ? 0 : 10;
}

export function getTextBaseline(
    parallel: boolean,
    labelRotation: number,
    sideFlag: Flag,
    parallelFlipFlag: Flag
): 'hanging' | 'bottom' | 'middle' {
    if (parallel && !labelRotation) {
        if (sideFlag * parallelFlipFlag === -1) {
            return 'hanging';
        } else {
            return 'bottom';
        }
    }
    return 'middle';
}

export function getTextAlign(
    parallel: boolean,
    labelRotation: number,
    labelAutoRotation: number,
    sideFlag: Flag,
    regularFlipFlag: Flag
): 'start' | 'end' | 'center' {
    const labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
    const labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
    const alignFlag = labelRotated || labelAutoRotated ? -1 : 1;

    if (parallel) {
        if (labelRotation || labelAutoRotation) {
            if (sideFlag * alignFlag === -1) {
                return 'end';
            }
        } else {
            return 'center';
        }
    } else if (sideFlag * regularFlipFlag === -1) {
        return 'end';
    }

    return 'start';
}

export function calculateLabelBBox(
    text: string,
    bbox: BBox,
    labelX: number,
    labelY: number,
    labelMatrix: Matrix
): PointLabelDatum {
    // Text.computeBBox() does not take into account any of the transformations that have been applied to the label nodes, only the width and height are useful.
    // Rather than taking into account all transformations including those of parent nodes which would be the result of `computeTransformedBBox()`, giving the x and y in the entire axis coordinate space,
    // take into account only the rotation and translation applied to individual label nodes to get the x y coordinates of the labels relative to each other
    // this makes label collision detection a lot simpler

    const { width, height } = bbox;

    const translatedBBox = new BBox(labelX, labelY, 0, 0);
    labelMatrix.transformBBox(translatedBBox, bbox);

    const { x = 0, y = 0 } = bbox;
    bbox.width = width;
    bbox.height = height;

    return {
        point: {
            x,
            y,
            size: 0,
        },
        label: {
            width,
            height,
            text,
        },
    };
}
