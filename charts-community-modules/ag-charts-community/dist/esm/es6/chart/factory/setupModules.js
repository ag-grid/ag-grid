import { REGISTERED_MODULES } from '../../util/module';
import { registerAxisThemeTemplate } from '../chartAxesTypes';
import { JSON_APPLY_PLUGINS } from '../chartOptions';
import { registerChartDefaults } from './chartTypes';
import { registerLegend } from './legendTypes';
import { registerSeries } from './seriesTypes';
export function setupModules() {
    for (const m of REGISTERED_MODULES) {
        if (m.optionConstructors != null) {
            Object.assign(JSON_APPLY_PLUGINS.constructors, m.optionConstructors);
        }
        if (m.type === 'root') {
            if (m.themeTemplate) {
                for (const chartType of m.chartTypes) {
                    registerChartDefaults(chartType, m.themeTemplate);
                }
            }
        }
        if (m.type === 'series') {
            if (m.chartTypes.length > 1)
                throw new Error('AG Charts - Module definition error: ' + m.identifier);
            registerSeries(m.identifier, m.chartTypes[0], m.instanceConstructor, m.seriesDefaults, m.themeTemplate);
        }
        if (m.type === 'axis') {
            if (m.themeTemplate) {
                for (const axisType of m.axisTypes) {
                    registerAxisThemeTemplate(axisType, m.themeTemplate);
                }
            }
        }
        if (m.type === 'legend') {
            registerLegend(m.identifier, m.instanceConstructor);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBNb2R1bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2ZhY3Rvcnkvc2V0dXBNb2R1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUNyRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFL0MsTUFBTSxVQUFVLFlBQVk7SUFDeEIsS0FBSyxNQUFNLENBQUMsSUFBSSxrQkFBa0IsRUFBRTtRQUNoQyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7WUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDeEU7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQ25CLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRTtnQkFDakIsS0FBSyxNQUFNLFNBQVMsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFO29CQUNsQyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNyRDthQUNKO1NBQ0o7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVyRyxjQUFjLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUMzRztRQUVELElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7WUFDbkIsSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFO2dCQUNqQixLQUFLLE1BQU0sUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7b0JBQ2hDLHlCQUF5QixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQ3hEO2FBQ0o7U0FDSjtRQUVELElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDckIsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDdkQ7S0FDSjtBQUNMLENBQUMifQ==