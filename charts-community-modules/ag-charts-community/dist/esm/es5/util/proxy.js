import { addTransformToInstanceProperty } from './decorator';
export function ProxyOnWrite(proxyProperty) {
    return addTransformToInstanceProperty(function (target, _, value) {
        target[proxyProperty] = value;
        return value;
    });
}
export function ProxyPropertyOnWrite(childName, childProperty) {
    return addTransformToInstanceProperty(function (target, key, value) {
        target[childName][childProperty !== null && childProperty !== void 0 ? childProperty : key] = value;
        return value;
    });
}
/**
 * Allows side-effects to be triggered on property write.
 *
 * @param opts.newValue called when a new value is set - never called for undefined values.
 * @param opts.oldValue called with the old value before a new value is set - never called for
 *                      undefined values.
 * @param opts.changeValue called on any change to the value - always called.
 */
export function ActionOnSet(opts) {
    var newValueFn = opts.newValue, oldValueFn = opts.oldValue, changeValueFn = opts.changeValue;
    return addTransformToInstanceProperty(function (target, _, newValue, oldValue) {
        if (newValue !== oldValue) {
            if (oldValue !== undefined) {
                oldValueFn === null || oldValueFn === void 0 ? void 0 : oldValueFn.call(target, oldValue);
            }
            if (newValue !== undefined) {
                newValueFn === null || newValueFn === void 0 ? void 0 : newValueFn.call(target, newValue);
            }
            changeValueFn === null || changeValueFn === void 0 ? void 0 : changeValueFn.call(target, newValue, oldValue);
        }
        return newValue;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9wcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFN0QsTUFBTSxVQUFVLFlBQVksQ0FBQyxhQUFxQjtJQUM5QyxPQUFPLDhCQUE4QixDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLO1FBQ25ELE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFOUIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLFNBQWlCLEVBQUUsYUFBc0I7SUFDMUUsT0FBTyw4QkFBOEIsQ0FBQyxVQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSztRQUNyRCxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxhQUFiLGFBQWEsY0FBYixhQUFhLEdBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWhELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFJLElBSTlCO0lBQ1csSUFBVSxVQUFVLEdBQXVELElBQUksU0FBM0QsRUFBWSxVQUFVLEdBQWlDLElBQUksU0FBckMsRUFBZSxhQUFhLEdBQUssSUFBSSxZQUFULENBQVU7SUFDeEYsT0FBTyw4QkFBOEIsQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVE7UUFDaEUsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ3ZCLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdEM7WUFDRCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ25EO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIn0=