import { buildFormatter } from './timeFormat';
const interpolatePattern = /(#\{(.*?)\})/g;
export function interpolate(input, values, formats) {
    return input.replace(interpolatePattern, function (...args) {
        const name = args[2];
        const [valueName, formatName] = name.split(':');
        const value = values[valueName];
        if (typeof value === 'number') {
            const format = formatName && formats && formats[formatName];
            if (format) {
                const { locales, options } = format;
                return value.toLocaleString(locales, options);
            }
            return String(value);
        }
        if (value instanceof Date) {
            const format = formatName && formats && formats[formatName];
            if (typeof format === 'string') {
                const formatter = buildFormatter(format);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvc3RyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFOUMsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFXM0MsTUFBTSxVQUFVLFdBQVcsQ0FDdkIsS0FBYSxFQUNiLE1BQWdDLEVBQ2hDLE9BQTBDO0lBRTFDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxVQUFVLEdBQUcsSUFBSTtRQUN0RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUMzQixNQUFNLE1BQU0sR0FBRyxVQUFVLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU1RCxJQUFJLE1BQU0sRUFBRTtnQkFDUixNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQXNCLENBQUM7Z0JBQ3BELE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDakQ7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QjtRQUVELElBQUksS0FBSyxZQUFZLElBQUksRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxVQUFVLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDNUIsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtZQUNELE9BQU8sS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQy9CO1FBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEtBQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFFBQVEsQ0FBQSxFQUFFO1lBQzlDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==