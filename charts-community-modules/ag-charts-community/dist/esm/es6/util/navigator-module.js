import { Navigator } from '../chart/navigator/navigator';
import { registerModule } from './module';
export const CHART_NAVIGATOR_MODULE = {
    type: 'root',
    optionsKey: 'navigator',
    packageType: 'community',
    chartTypes: ['cartesian'],
    instanceConstructor: Navigator,
    themeTemplate: {
        navigator: {
            enabled: false,
            height: 30,
            mask: {
                fill: '#999999',
                stroke: '#999999',
                strokeWidth: 1,
                fillOpacity: 0.2,
            },
            minHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8,
            },
            maxHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8,
            },
        },
    },
};
registerModule(CHART_NAVIGATOR_MODULE);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdG9yLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL25hdmlnYXRvci1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3pELE9BQU8sRUFBVSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEQsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQVc7SUFDMUMsSUFBSSxFQUFFLE1BQU07SUFDWixVQUFVLEVBQUUsV0FBVztJQUN2QixXQUFXLEVBQUUsV0FBVztJQUN4QixVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFDekIsbUJBQW1CLEVBQUUsU0FBUztJQUM5QixhQUFhLEVBQUU7UUFDWCxTQUFTLEVBQUU7WUFDUCxPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFO2dCQUNGLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixXQUFXLEVBQUUsQ0FBQztnQkFDZCxXQUFXLEVBQUUsR0FBRzthQUNuQjtZQUNELFNBQVMsRUFBRTtnQkFDUCxJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUUsU0FBUztnQkFDakIsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsY0FBYyxFQUFFLENBQUM7YUFDcEI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLFdBQVcsRUFBRSxDQUFDO2dCQUNkLEtBQUssRUFBRSxDQUFDO2dCQUNSLE1BQU0sRUFBRSxFQUFFO2dCQUNWLFdBQVcsRUFBRSxDQUFDO2dCQUNkLGNBQWMsRUFBRSxDQUFDO2FBQ3BCO1NBQ0o7S0FDSjtDQUNKLENBQUM7QUFFRixjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQyJ9