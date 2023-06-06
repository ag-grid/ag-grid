import { addTransformToInstanceProperty, BREAK_TRANSFORM_CHAIN } from './decorator';
import { Logger } from './logger';
function createDeprecationWarning() {
    return function (key, message) {
        var msg = ["Property [" + key + "] is deprecated.", message].filter(function (v) { return v != null; }).join(' ');
        Logger.warnOnce(msg);
    };
}
export function Deprecated(message, opts) {
    var def = opts === null || opts === void 0 ? void 0 : opts.default;
    var warn = createDeprecationWarning();
    return addTransformToInstanceProperty(function (_, key, value) {
        if (value !== def) {
            warn(key.toString(), message);
        }
        return value;
    });
}
export function DeprecatedAndRenamedTo(newPropName, mapValue) {
    var warnDeprecated = createDeprecationWarning();
    return addTransformToInstanceProperty(function (target, key, value) {
        if (value !== target[newPropName]) {
            warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
            target[newPropName] = mapValue ? mapValue(value) : value;
        }
        return BREAK_TRANSFORM_CHAIN;
    }, function (target, key) {
        warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
        return target[newPropName];
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcmVjYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9kZXByZWNhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsOEJBQThCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxTQUFTLHdCQUF3QjtJQUM3QixPQUFPLFVBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQ2pDLElBQU0sR0FBRyxHQUFHLENBQUMsZUFBYSxHQUFHLHFCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsSUFBSSxJQUFJLEVBQVQsQ0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsT0FBZ0IsRUFBRSxJQUF3QjtJQUNqRSxJQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsT0FBTyxDQUFDO0lBQzFCLElBQU0sSUFBSSxHQUFHLHdCQUF3QixFQUFFLENBQUM7SUFFeEMsT0FBTyw4QkFBOEIsQ0FBQyxVQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSztRQUNoRCxJQUFJLEtBQUssS0FBSyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUFDLFdBQWdCLEVBQUUsUUFBOEI7SUFDbkYsSUFBTSxjQUFjLEdBQUcsd0JBQXdCLEVBQUUsQ0FBQztJQUVsRCxPQUFPLDhCQUE4QixDQUNqQyxVQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSztRQUNmLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVEsV0FBVyxlQUFZLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUM1RDtRQUNELE9BQU8scUJBQXFCLENBQUM7SUFDakMsQ0FBQyxFQUNELFVBQUMsTUFBTSxFQUFFLEdBQUc7UUFDUixjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVEsV0FBVyxlQUFZLENBQUMsQ0FBQztRQUNoRSxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQ0osQ0FBQztBQUNOLENBQUMifQ==