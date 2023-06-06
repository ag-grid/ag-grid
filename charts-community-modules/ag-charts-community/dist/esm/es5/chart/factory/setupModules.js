var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { REGISTERED_MODULES } from '../../util/module';
import { registerAxisThemeTemplate } from '../chartAxesTypes';
import { JSON_APPLY_PLUGINS } from '../chartOptions';
import { registerChartDefaults } from './chartTypes';
import { registerLegend } from './legendTypes';
import { registerSeries } from './seriesTypes';
export function setupModules() {
    var e_1, _a, e_2, _b, e_3, _c;
    try {
        for (var REGISTERED_MODULES_1 = __values(REGISTERED_MODULES), REGISTERED_MODULES_1_1 = REGISTERED_MODULES_1.next(); !REGISTERED_MODULES_1_1.done; REGISTERED_MODULES_1_1 = REGISTERED_MODULES_1.next()) {
            var m = REGISTERED_MODULES_1_1.value;
            if (m.optionConstructors != null) {
                Object.assign(JSON_APPLY_PLUGINS.constructors, m.optionConstructors);
            }
            if (m.type === 'root') {
                if (m.themeTemplate) {
                    try {
                        for (var _d = (e_2 = void 0, __values(m.chartTypes)), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var chartType = _e.value;
                            registerChartDefaults(chartType, m.themeTemplate);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_2) throw e_2.error; }
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
                    try {
                        for (var _f = (e_3 = void 0, __values(m.axisTypes)), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var axisType = _g.value;
                            registerAxisThemeTemplate(axisType, m.themeTemplate);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
            if (m.type === 'legend') {
                registerLegend(m.identifier, m.instanceConstructor);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (REGISTERED_MODULES_1_1 && !REGISTERED_MODULES_1_1.done && (_a = REGISTERED_MODULES_1.return)) _a.call(REGISTERED_MODULES_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBNb2R1bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2ZhY3Rvcnkvc2V0dXBNb2R1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdkQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDOUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDckQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3JELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDL0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvQyxNQUFNLFVBQVUsWUFBWTs7O1FBQ3hCLEtBQWdCLElBQUEsdUJBQUEsU0FBQSxrQkFBa0IsQ0FBQSxzREFBQSxzRkFBRTtZQUEvQixJQUFNLENBQUMsK0JBQUE7WUFDUixJQUFJLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7Z0JBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3hFO1lBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsYUFBYSxFQUFFOzt3QkFDakIsS0FBd0IsSUFBQSxvQkFBQSxTQUFBLENBQUMsQ0FBQyxVQUFVLENBQUEsQ0FBQSxnQkFBQSw0QkFBRTs0QkFBakMsSUFBTSxTQUFTLFdBQUE7NEJBQ2hCLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7eUJBQ3JEOzs7Ozs7Ozs7aUJBQ0o7YUFDSjtZQUVELElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFckcsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDM0c7WUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO2dCQUNuQixJQUFJLENBQUMsQ0FBQyxhQUFhLEVBQUU7O3dCQUNqQixLQUF1QixJQUFBLG9CQUFBLFNBQUEsQ0FBQyxDQUFDLFNBQVMsQ0FBQSxDQUFBLGdCQUFBLDRCQUFFOzRCQUEvQixJQUFNLFFBQVEsV0FBQTs0QkFDZix5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3lCQUN4RDs7Ozs7Ozs7O2lCQUNKO2FBQ0o7WUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUNyQixjQUFjLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUN2RDtTQUNKOzs7Ozs7Ozs7QUFDTCxDQUFDIn0=