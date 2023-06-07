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
const lightTheme = () => new ChartTheme();
const darkTheme = () => new DarkTheme();
const lightThemes = {
    undefined: lightTheme,
    null: lightTheme,
    'ag-default': lightTheme,
    'ag-material': () => new MaterialLight(),
    'ag-pastel': () => new PastelLight(),
    'ag-solar': () => new SolarLight(),
    'ag-vivid': () => new VividLight(),
};
const darkThemes = {
    undefined: darkTheme,
    null: darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': () => new MaterialDark(),
    'ag-pastel-dark': () => new PastelDark(),
    'ag-solar-dark': () => new SolarDark(),
    'ag-vivid-dark': () => new VividDark(),
};
export const themes = Object.assign(Object.assign({}, darkThemes), lightThemes);
export function getChartTheme(value) {
    var _a;
    if (value instanceof ChartTheme) {
        return value;
    }
    const stockTheme = themes[value];
    if (stockTheme) {
        return stockTheme();
    }
    value = value;
    // Flatten recursive themes.
    const overrides = [];
    let palette;
    while (typeof value === 'object') {
        overrides.push((_a = value.overrides) !== null && _a !== void 0 ? _a : {});
        // Use first palette found, they can't be merged.
        if (value.palette && palette == null) {
            palette = value.palette;
        }
        value = value.baseTheme;
    }
    overrides.reverse();
    const flattenedTheme = Object.assign({ baseTheme: value, overrides: jsonMerge(overrides) }, (palette ? { palette } : {}));
    if (flattenedTheme.baseTheme || flattenedTheme.overrides) {
        const baseTheme = getChartTheme(flattenedTheme.baseTheme);
        return new baseTheme.constructor(flattenedTheme);
    }
    return lightTheme();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L21hcHBpbmcvdGhlbWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVoRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJNUMsTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUMxQyxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBRXhDLE1BQU0sV0FBVyxHQUFhO0lBQzFCLFNBQVMsRUFBRSxVQUFVO0lBQ3JCLElBQUksRUFBRSxVQUFVO0lBQ2hCLFlBQVksRUFBRSxVQUFVO0lBQ3hCLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGFBQWEsRUFBRTtJQUN4QyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxXQUFXLEVBQUU7SUFDcEMsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksVUFBVSxFQUFFO0lBQ2xDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLFVBQVUsRUFBRTtDQUNyQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQWE7SUFDekIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsSUFBSSxFQUFFLFNBQVM7SUFDZixpQkFBaUIsRUFBRSxTQUFTO0lBQzVCLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksWUFBWSxFQUFFO0lBQzVDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksVUFBVSxFQUFFO0lBQ3hDLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLFNBQVMsRUFBRTtJQUN0QyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUU7Q0FDekMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLE1BQU0sbUNBQ1osVUFBVSxHQUNWLFdBQVcsQ0FDakIsQ0FBQztBQUVGLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBMEM7O0lBQ3BFLElBQUksS0FBSyxZQUFZLFVBQVUsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUF5QixDQUFDLENBQUM7SUFDckQsSUFBSSxVQUFVLEVBQUU7UUFDWixPQUFPLFVBQVUsRUFBRSxDQUFDO0tBQ3ZCO0lBRUQsS0FBSyxHQUFHLEtBQXFCLENBQUM7SUFFOUIsNEJBQTRCO0lBQzVCLE1BQU0sU0FBUyxHQUE0QixFQUFFLENBQUM7SUFDOUMsSUFBSSxPQUFPLENBQUM7SUFDWixPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQUEsS0FBSyxDQUFDLFNBQVMsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFdEMsaURBQWlEO1FBQ2pELElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ2xDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQzNCO1FBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7S0FDM0I7SUFDRCxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFcEIsTUFBTSxjQUFjLG1CQUNoQixTQUFTLEVBQUUsS0FBSyxFQUNoQixTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUM1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ2xDLENBQUM7SUFFRixJQUFJLGNBQWMsQ0FBQyxTQUFTLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtRQUN0RCxNQUFNLFNBQVMsR0FBUSxhQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsT0FBTyxVQUFVLEVBQUUsQ0FBQztBQUN4QixDQUFDIn0=