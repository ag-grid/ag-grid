import { AxisTitle } from './axis/axisTitle';
import { Caption } from '../caption';
import { DropShadow } from '../scene/dropShadow';
import { JsonApplyParams } from '../util/json';
import { CrossLine } from './crossline/crossLine';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';

export const JSON_APPLY_PLUGINS: JsonApplyParams = {
    constructors: {},
};

const JSON_APPLY_OPTIONS: JsonApplyParams = {
    constructors: {
        title: Caption,
        subtitle: Caption,
        footnote: Caption,
        shadow: DropShadow,
        innerCircle: DoughnutInnerCircle,
        'axes[].crossLines[]': CrossLine,
        'axes[].title': AxisTitle,
        'series[].innerLabels[]': DoughnutInnerLabel,
    },
    allowedTypes: {
        'legend.pagination.marker.shape': ['primitive', 'function'],
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};

export function getJsonApplyOptions() {
    return {
        constructors: {
            ...JSON_APPLY_OPTIONS.constructors,
            ...JSON_APPLY_PLUGINS.constructors,
        },
        allowedTypes: {
            ...JSON_APPLY_OPTIONS.allowedTypes!,
        },
    };
}
