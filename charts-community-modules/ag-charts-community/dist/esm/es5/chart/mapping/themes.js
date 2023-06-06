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
import { ChartTheme } from '../themes/chartTheme';
import { DarkTheme } from '../themes/darkTheme';
import { MaterialLight } from '../themes/materialLight';
import { MaterialDark } from '../themes/materialDark';
import { PastelLight } from '../themes/pastelLight';
import { PastelDark } from '../themes/pastelDark';
import { SolarLight } from '../themes/solarLight';
import { SolarDark } from '../themes/solarDark';
import { VividLight } from '../themes/vividLight';
import { VividDark } from '../themes/vividDark';
import { jsonMerge } from '../../util/json';
var lightTheme = function () { return new ChartTheme(); };
var darkTheme = function () { return new DarkTheme(); };
var lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': function () { return new MaterialLight(); },
    'ag-pastel': function () { return new PastelLight(); },
    'ag-solar': function () { return new SolarLight(); },
    'ag-vivid': function () { return new VividLight(); },
};
var darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': function () { return new MaterialDark(); },
    'ag-pastel-dark': function () { return new PastelDark(); },
    'ag-solar-dark': function () { return new SolarDark(); },
    'ag-vivid-dark': function () { return new VividDark(); },
};
export var themes = __assign(__assign({}, darkThemes), lightThemes);
export function getChartTheme(value) {
    var _a;
    if (value instanceof ChartTheme) {
        return value;
    }
    var stockTheme = themes[value];
    if (stockTheme) {
        return stockTheme();
    }
    value = value;
    // Flatten recursive themes.
    var overrides = [];
    var palette;
    while (typeof value === 'object') {
        overrides.push((_a = value.overrides) !== null && _a !== void 0 ? _a : {});
        // Use first palette found, they can't be merged.
        if (value.palette && palette == null) {
            palette = value.palette;
        }
        value = value.baseTheme;
    }
    overrides.reverse();
    var flattenedTheme = __assign({ baseTheme: value, overrides: jsonMerge(overrides) }, (palette ? { palette: palette } : {}));
    if (flattenedTheme.baseTheme || flattenedTheme.overrides) {
        var baseTheme = getChartTheme(flattenedTheme.baseTheme);
        return new baseTheme.constructor(flattenedTheme);
    }
    return lightTheme();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L21hcHBpbmcvdGhlbWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRWhELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUk1QyxJQUFNLFVBQVUsR0FBRyxjQUFNLE9BQUEsSUFBSSxVQUFVLEVBQUUsRUFBaEIsQ0FBZ0IsQ0FBQztBQUMxQyxJQUFNLFNBQVMsR0FBRyxjQUFNLE9BQUEsSUFBSSxTQUFTLEVBQUUsRUFBZixDQUFlLENBQUM7QUFFeEMsSUFBTSxXQUFXLEdBQWE7SUFDMUIsU0FBUyxFQUFFLFVBQVU7SUFDckIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsWUFBWSxFQUFFLFVBQVU7SUFDeEIsYUFBYSxFQUFFLGNBQU0sT0FBQSxJQUFJLGFBQWEsRUFBRSxFQUFuQixDQUFtQjtJQUN4QyxXQUFXLEVBQUUsY0FBTSxPQUFBLElBQUksV0FBVyxFQUFFLEVBQWpCLENBQWlCO0lBQ3BDLFVBQVUsRUFBRSxjQUFNLE9BQUEsSUFBSSxVQUFVLEVBQUUsRUFBaEIsQ0FBZ0I7SUFDbEMsVUFBVSxFQUFFLGNBQU0sT0FBQSxJQUFJLFVBQVUsRUFBRSxFQUFoQixDQUFnQjtDQUNyQyxDQUFDO0FBRUYsSUFBTSxVQUFVLEdBQWE7SUFDekIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsSUFBSSxFQUFFLFNBQVM7SUFDZixpQkFBaUIsRUFBRSxTQUFTO0lBQzVCLGtCQUFrQixFQUFFLGNBQU0sT0FBQSxJQUFJLFlBQVksRUFBRSxFQUFsQixDQUFrQjtJQUM1QyxnQkFBZ0IsRUFBRSxjQUFNLE9BQUEsSUFBSSxVQUFVLEVBQUUsRUFBaEIsQ0FBZ0I7SUFDeEMsZUFBZSxFQUFFLGNBQU0sT0FBQSxJQUFJLFNBQVMsRUFBRSxFQUFmLENBQWU7SUFDdEMsZUFBZSxFQUFFLGNBQU0sT0FBQSxJQUFJLFNBQVMsRUFBRSxFQUFmLENBQWU7Q0FDekMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLE1BQU0seUJBQ1osVUFBVSxHQUNWLFdBQVcsQ0FDakIsQ0FBQztBQUVGLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBMEM7O0lBQ3BFLElBQUksS0FBSyxZQUFZLFVBQVUsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUF5QixDQUFDLENBQUM7SUFDckQsSUFBSSxVQUFVLEVBQUU7UUFDWixPQUFPLFVBQVUsRUFBRSxDQUFDO0tBQ3ZCO0lBRUQsS0FBSyxHQUFHLEtBQXFCLENBQUM7SUFFOUIsNEJBQTRCO0lBQzVCLElBQU0sU0FBUyxHQUE0QixFQUFFLENBQUM7SUFDOUMsSUFBSSxPQUFPLENBQUM7SUFDWixPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQUEsS0FBSyxDQUFDLFNBQVMsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFdEMsaURBQWlEO1FBQ2pELElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2xDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQzNCO1FBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7S0FDM0I7SUFDRCxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFcEIsSUFBTSxjQUFjLGNBQ2hCLFNBQVMsRUFBRSxLQUFLLEVBQ2hCLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLElBQzVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sU0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNsQyxDQUFDO0lBRUYsSUFBSSxjQUFjLENBQUMsU0FBUyxJQUFJLGNBQWMsQ0FBQyxTQUFTLEVBQUU7UUFDdEQsSUFBTSxTQUFTLEdBQVEsYUFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxPQUFPLElBQUksU0FBUyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNwRDtJQUVELE9BQU8sVUFBVSxFQUFFLENBQUM7QUFDeEIsQ0FBQyJ9