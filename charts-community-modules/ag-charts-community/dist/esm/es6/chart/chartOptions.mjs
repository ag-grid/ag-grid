import { AxisTitle } from './axis/axisTitle.mjs';
import { Caption } from '../caption.mjs';
import { DropShadow } from '../scene/dropShadow.mjs';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries.mjs';
export const JSON_APPLY_PLUGINS = {
    constructors: {},
    constructedArrays: new WeakMap(),
};
export function assignJsonApplyConstructedArray(array, ctor) {
    var _a;
    (_a = JSON_APPLY_PLUGINS.constructedArrays) === null || _a === void 0 ? void 0 : _a.set(array, ctor);
}
const JSON_APPLY_OPTIONS = {
    constructors: {
        title: Caption,
        subtitle: Caption,
        footnote: Caption,
        shadow: DropShadow,
        innerCircle: DoughnutInnerCircle,
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
        constructedArrays: JSON_APPLY_PLUGINS.constructedArrays,
        allowedTypes: Object.assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
