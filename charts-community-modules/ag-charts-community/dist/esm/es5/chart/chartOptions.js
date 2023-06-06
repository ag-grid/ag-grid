var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { AxisTitle } from '../axis';
import { Caption } from '../caption';
import { DropShadow } from '../scene/dropShadow';
import { CrossLine } from './crossline/crossLine';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';
export var JSON_APPLY_PLUGINS = {
    constructors: {},
};
var JSON_APPLY_OPTIONS = {
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
        constructors: __assign(__assign({}, JSON_APPLY_OPTIONS.constructors), JSON_APPLY_PLUGINS.constructors),
        allowedTypes: __assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2NoYXJ0T3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDcEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRW5GLE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFvQjtJQUMvQyxZQUFZLEVBQUUsRUFBRTtDQUNuQixDQUFDO0FBRUYsSUFBTSxrQkFBa0IsR0FBb0I7SUFDeEMsWUFBWSxFQUFFO1FBQ1YsS0FBSyxFQUFFLE9BQU87UUFDZCxRQUFRLEVBQUUsT0FBTztRQUNqQixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUUsVUFBVTtRQUNsQixXQUFXLEVBQUUsbUJBQW1CO1FBQ2hDLHFCQUFxQixFQUFFLFNBQVM7UUFDaEMsY0FBYyxFQUFFLFNBQVM7UUFDekIsd0JBQXdCLEVBQUUsa0JBQWtCO0tBQy9DO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsZ0NBQWdDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1FBQzNELHVCQUF1QixFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztRQUNsRCxtQkFBbUIsRUFBRSxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQztLQUN2RDtDQUNKLENBQUM7QUFFRixNQUFNLFVBQVUsbUJBQW1CO0lBQy9CLE9BQU87UUFDSCxZQUFZLHdCQUNMLGtCQUFrQixDQUFDLFlBQVksR0FDL0Isa0JBQWtCLENBQUMsWUFBWSxDQUNyQztRQUNELFlBQVksZUFDTCxrQkFBa0IsQ0FBQyxZQUFhLENBQ3RDO0tBQ0osQ0FBQztBQUNOLENBQUMifQ==