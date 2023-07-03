import { AxisTitle } from '../axis.mjs';
import { Caption } from '../caption.mjs';
import { DropShadow } from '../scene/dropShadow.mjs';
import { CrossLine } from './crossline/crossLine.mjs';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries.mjs';
export const JSON_APPLY_PLUGINS = {
    constructors: {},
};
const JSON_APPLY_OPTIONS = {
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
        constructors: Object.assign(Object.assign({}, JSON_APPLY_OPTIONS.constructors), JSON_APPLY_PLUGINS.constructors),
        allowedTypes: Object.assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
