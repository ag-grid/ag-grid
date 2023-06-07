import { AxisTitle } from '../axis';
import { Caption } from '../caption';
import { DropShadow } from '../scene/dropShadow';
import { CrossLine } from './crossline/crossLine';
import { DoughnutInnerLabel, DoughnutInnerCircle } from './series/polar/pieSeries';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2NoYXJ0T3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDckMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRWpELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVuRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBb0I7SUFDL0MsWUFBWSxFQUFFLEVBQUU7Q0FDbkIsQ0FBQztBQUVGLE1BQU0sa0JBQWtCLEdBQW9CO0lBQ3hDLFlBQVksRUFBRTtRQUNWLEtBQUssRUFBRSxPQUFPO1FBQ2QsUUFBUSxFQUFFLE9BQU87UUFDakIsUUFBUSxFQUFFLE9BQU87UUFDakIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsV0FBVyxFQUFFLG1CQUFtQjtRQUNoQyxxQkFBcUIsRUFBRSxTQUFTO1FBQ2hDLGNBQWMsRUFBRSxTQUFTO1FBQ3pCLHdCQUF3QixFQUFFLGtCQUFrQjtLQUMvQztJQUNELFlBQVksRUFBRTtRQUNWLGdDQUFnQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQztRQUMzRCx1QkFBdUIsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUM7UUFDbEQsbUJBQW1CLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUM7S0FDdkQ7Q0FDSixDQUFDO0FBRUYsTUFBTSxVQUFVLG1CQUFtQjtJQUMvQixPQUFPO1FBQ0gsWUFBWSxrQ0FDTCxrQkFBa0IsQ0FBQyxZQUFZLEdBQy9CLGtCQUFrQixDQUFDLFlBQVksQ0FDckM7UUFDRCxZQUFZLG9CQUNMLGtCQUFrQixDQUFDLFlBQWEsQ0FDdEM7S0FDSixDQUFDO0FBQ04sQ0FBQyJ9