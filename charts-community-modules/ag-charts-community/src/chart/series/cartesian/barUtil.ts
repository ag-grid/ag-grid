import { isNumber } from '../../../util/value';
import { Point } from '../../../scene/point';
import { AgCartesianSeriesLabelFormatterParams } from '../../agChartOptions';

type Bounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type LabelPlacement = 'start' | 'end' | 'inside' | 'outside';

type LabelDatum = Readonly<Point> & {
    readonly text: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
};

export function createLabelData({
    value,
    rect,
    placement,
    seriesId,
    padding = 0,
    formatter,
    barAlongX,
}: {
    value: any;
    rect: Bounds;
    placement: LabelPlacement;
    seriesId: string;
    padding?: number;
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
    barAlongX: boolean;
}): LabelDatum {
    let labelText: string;
    if (formatter) {
        labelText = formatter({
            value: isNumber(value) ? value : undefined,
            seriesId,
        });
    } else {
        labelText = isNumber(value) ? value.toFixed(2) : '';
    }

    let labelX = rect.x + rect.width / 2;
    let labelY = rect.y + rect.height / 2;

    let labelTextAlign: CanvasTextAlign = 'center';
    let labelTextBaseline: CanvasTextBaseline = 'middle';

    const isPositive = value >= 0;
    switch (placement) {
        case 'start': {
            if (barAlongX) {
                labelX = isPositive ? rect.x - padding : rect.x + rect.width + padding;
                labelTextAlign = isPositive ? 'start' : 'end';
            } else {
                labelY = isPositive ? rect.y + rect.height + padding : rect.y - padding;
                labelTextBaseline = isPositive ? 'top' : 'bottom';
            }
            break;
        }
        case 'outside':
        case 'end': {
            if (barAlongX) {
                labelX = isPositive ? rect.x + rect.width + padding : rect.x - padding;
                labelTextAlign = isPositive ? 'start' : 'end';
            } else {
                labelY = isPositive ? rect.y - padding : rect.y + rect.height + padding;
                labelTextBaseline = isPositive ? 'bottom' : 'top';
            }
            break;
        }
        case 'inside':
        default: {
            labelTextBaseline = 'middle';
            break;
        }
    }

    return {
        text: labelText,
        textAlign: labelTextAlign,
        textBaseline: labelTextBaseline,
        x: labelX,
        y: labelY,
    };
}
