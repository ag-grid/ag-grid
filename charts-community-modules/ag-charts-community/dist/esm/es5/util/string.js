var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { buildFormatter } from './timeFormat';
var interpolatePattern = /(#\{(.*?)\})/g;
export function interpolate(input, values, formats) {
    return input.replace(interpolatePattern, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var name = args[2];
        var _a = __read(name.split(':'), 2), valueName = _a[0], formatName = _a[1];
        var value = values[valueName];
        if (typeof value === 'number') {
            var format = formatName && formats && formats[formatName];
            if (format) {
                var _b = format, locales = _b.locales, options = _b.options;
                return value.toLocaleString(locales, options);
            }
            return String(value);
        }
        if (value instanceof Date) {
            var format = formatName && formats && formats[formatName];
            if (typeof format === 'string') {
                var formatter = buildFormatter(format);
                return formatter(value);
            }
            return value.toDateString();
        }
        if (typeof value === 'string' || (value === null || value === void 0 ? void 0 : value.toString)) {
            return String(value);
        }
        return '';
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRTlDLElBQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBVzNDLE1BQU0sVUFBVSxXQUFXLENBQ3ZCLEtBQWEsRUFDYixNQUFnQyxFQUNoQyxPQUEwQztJQUUxQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7UUFBVSxjQUFPO2FBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztZQUFQLHlCQUFPOztRQUN0RCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixJQUFBLEtBQUEsT0FBMEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSxFQUF4QyxTQUFTLFFBQUEsRUFBRSxVQUFVLFFBQW1CLENBQUM7UUFDaEQsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWhDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzNCLElBQU0sTUFBTSxHQUFHLFVBQVUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTVELElBQUksTUFBTSxFQUFFO2dCQUNGLElBQUEsS0FBdUIsTUFBc0IsRUFBM0MsT0FBTyxhQUFBLEVBQUUsT0FBTyxhQUEyQixDQUFDO2dCQUNwRCxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLEtBQUssWUFBWSxJQUFJLEVBQUU7WUFDdkIsSUFBTSxNQUFNLEdBQUcsVUFBVSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUQsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLElBQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekMsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7WUFDRCxPQUFPLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUMvQjtRQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxLQUFJLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLENBQUEsRUFBRTtZQUM5QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIn0=