export const BREAK_TRANSFORM_CHAIN = Symbol('BREAK');
const CONFIG_KEY = '__decorator_config';
function initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey) {
    if (Object.getOwnPropertyDescriptor(target, CONFIG_KEY) == null) {
        Object.defineProperty(target, CONFIG_KEY, { value: {} });
    }
    const config = target[CONFIG_KEY];
    if (config[propertyKey] != null) {
        return config[propertyKey];
    }
    config[propertyKey] = { setters: [], getters: [] };
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKeyOrSymbol);
    const prevSet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.set;
    const prevGet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.get;
    const getter = function () {
        var _a, _b;
        let value = prevGet ? prevGet.call(this) : this[valueStoreKey];
        for (const transformFn of (_b = (_a = config[propertyKey]) === null || _a === void 0 ? void 0 : _a.getters) !== null && _b !== void 0 ? _b : []) {
            value = transformFn(this, propertyKeyOrSymbol, value);
            if (value === BREAK_TRANSFORM_CHAIN) {
                return undefined;
            }
        }
        return value;
    };
    const setter = function (value) {
        var _a, _b;
        const setters = (_b = (_a = config[propertyKey]) === null || _a === void 0 ? void 0 : _a.setters) !== null && _b !== void 0 ? _b : [];
        let oldValue;
        if (setters.some((f) => f.length > 2)) {
            // Lazily retrieve old value.
            oldValue = prevGet ? prevGet.call(this) : this[valueStoreKey];
        }
        for (const transformFn of setters) {
            value = transformFn(this, propertyKeyOrSymbol, value, oldValue);
            if (value === BREAK_TRANSFORM_CHAIN) {
                return;
            }
        }
        if (prevSet) {
            prevSet.call(this, value);
        }
        else {
            this[valueStoreKey] = value;
        }
    };
    Object.defineProperty(target, propertyKeyOrSymbol, {
        set: setter,
        get: getter,
        enumerable: true,
        configurable: false,
    });
    return config[propertyKey];
}
export function addTransformToInstanceProperty(setTransform, getTransform) {
    return (target, propertyKeyOrSymbol) => {
        const propertyKey = propertyKeyOrSymbol.toString();
        const valueStoreKey = `__${propertyKey}`;
        const { getters, setters } = initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey);
        setters.push(setTransform);
        if (getTransform) {
            getters.splice(0, 0, getTransform);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQVNyRCxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQztBQUV4QyxTQUFTLGdCQUFnQixDQUNyQixNQUFXLEVBQ1gsbUJBQW9DLEVBQ3BDLFdBQW1CLEVBQ25CLGFBQXFCO0lBRXJCLElBQUksTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsSUFBSSxJQUFJLEVBQUU7UUFDN0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDNUQ7SUFFRCxNQUFNLE1BQU0sR0FBb0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25FLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksRUFBRTtRQUM3QixPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM5QjtJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBRW5ELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUNoRixNQUFNLE9BQU8sR0FBRyxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsR0FBRyxDQUFDO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxHQUFHLENBQUM7SUFFaEMsTUFBTSxNQUFNLEdBQUc7O1FBQ1gsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0QsS0FBSyxNQUFNLFdBQVcsSUFBSSxNQUFBLE1BQUEsTUFBTSxDQUFDLFdBQVcsQ0FBQywwQ0FBRSxPQUFPLG1DQUFJLEVBQUUsRUFBRTtZQUMxRCxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV0RCxJQUFJLEtBQUssS0FBSyxxQkFBcUIsRUFBRTtnQkFDakMsT0FBTyxTQUFTLENBQUM7YUFDcEI7U0FDSjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztJQUNGLE1BQU0sTUFBTSxHQUFHLFVBQXFCLEtBQVU7O1FBQzFDLE1BQU0sT0FBTyxHQUFHLE1BQUEsTUFBQSxNQUFNLENBQUMsV0FBVyxDQUFDLDBDQUFFLE9BQU8sbUNBQUksRUFBRSxDQUFDO1FBRW5ELElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ25DLDZCQUE2QjtZQUM3QixRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDakU7UUFFRCxLQUFLLE1BQU0sV0FBVyxJQUFJLE9BQU8sRUFBRTtZQUMvQixLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFaEUsSUFBSSxLQUFLLEtBQUsscUJBQXFCLEVBQUU7Z0JBQ2pDLE9BQU87YUFDVjtTQUNKO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM3QjthQUFNO1lBQ0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUMvQjtJQUNMLENBQUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLG1CQUFtQixFQUFFO1FBQy9DLEdBQUcsRUFBRSxNQUFNO1FBQ1gsR0FBRyxFQUFFLE1BQU07UUFDWCxVQUFVLEVBQUUsSUFBSTtRQUNoQixZQUFZLEVBQUUsS0FBSztLQUN0QixDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQsTUFBTSxVQUFVLDhCQUE4QixDQUMxQyxZQUF5QixFQUN6QixZQUEwQjtJQUUxQixPQUFPLENBQUMsTUFBVyxFQUFFLG1CQUFvQyxFQUFFLEVBQUU7UUFDekQsTUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkQsTUFBTSxhQUFhLEdBQUcsS0FBSyxXQUFXLEVBQUUsQ0FBQztRQUV6QyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFdkcsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMzQixJQUFJLFlBQVksRUFBRTtZQUNkLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN0QztJQUNMLENBQUMsQ0FBQztBQUNOLENBQUMifQ==