import { Caption } from '../caption';
import { DropShadow } from '../scene/dropShadow';
import { jsonApply } from '../util/json';
import { CrossLine } from './crossline/crossLine';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';

export const jsonApplyPlugins = {
    constructors: {} as Record<string, new () => any>,
};

const JSON_APPLY_OPTIONS: Parameters<typeof jsonApply>[2] = {
    constructors: {
        title: Caption,
        subtitle: Caption,
        footnote: Caption,
        shadow: DropShadow,
        innerCircle: DoughnutInnerCircle,
        'axes[].crossLines[]': CrossLine,
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
            ...JSON_APPLY_OPTIONS!.constructors!,
            ...jsonApplyPlugins.constructors,
        },
        allowedTypes: {
            ...JSON_APPLY_OPTIONS!.allowedTypes!,
        },
    };
}
