import { AreaSparkline } from './area/areaSparkline';
import { LineSparkline } from './line/lineSparkline';
import { BarSparkline } from './bar-column/barSparkline';
import { ColumnSparkline } from './bar-column/columnSparkline';
import { _Util } from 'ag-charts-community';
const { isNumber } = _Util;
export class AgSparkline {
    static create(options, tooltip) {
        // avoid mutating user provided options
        options = _Util.jsonMerge([options]);
        const sparkline = getSparklineInstance(options.type);
        if (tooltip) {
            sparkline.tooltip = tooltip;
        }
        initSparkline(sparkline, options);
        initSparklineByType(sparkline, options);
        if (options.data) {
            sparkline.data = options.data;
        }
        sparkline.processedOptions = options;
        return sparkline;
    }
}
function getSparklineInstance(type = 'line') {
    switch (type) {
        case 'column':
            return new ColumnSparkline();
        case 'bar':
            return new BarSparkline();
        case 'area':
            return new AreaSparkline();
        case 'line':
        default:
            return new LineSparkline();
    }
}
function initSparklineByType(sparkline, options) {
    switch (options.type) {
        case 'bar':
            initBarColumnSparkline(sparkline, options);
            break;
        case 'column':
            initBarColumnSparkline(sparkline, options);
            break;
        case 'area':
            initAreaSparkline(sparkline, options);
            break;
        case 'line':
        default:
            initLineSparkline(sparkline, options);
            break;
    }
}
function initSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'context', options.context, options);
    setValueIfPropertyExists(sparkline, 'width', options.width, options);
    setValueIfPropertyExists(sparkline, 'height', options.height, options);
    setValueIfPropertyExists(sparkline, 'container', options.container, options);
    setValueIfPropertyExists(sparkline, 'xKey', options.xKey, options);
    setValueIfPropertyExists(sparkline, 'yKey', options.yKey, options);
    if (options.padding) {
        initPaddingOptions(sparkline.padding, options.padding);
    }
    if (options.axis) {
        initAxisOptions(sparkline.axis, options.axis);
    }
    if (options.highlightStyle) {
        initHighlightStyleOptions(sparkline.highlightStyle, options.highlightStyle);
    }
}
function initLineSparkline(sparkline, options) {
    if (options.marker) {
        initMarkerOptions(sparkline.marker, options.marker);
    }
    if (options.line) {
        initLineOptions(sparkline.line, options.line);
    }
    if (options.crosshairs) {
        initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
    }
}
function initAreaSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'fill', options.fill, options);
    if (options.marker) {
        initMarkerOptions(sparkline.marker, options.marker);
    }
    if (options.line) {
        initLineOptions(sparkline.line, options.line);
    }
    if (options.crosshairs) {
        initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
    }
}
function initBarColumnSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'valueAxisDomain', options.valueAxisDomain, options);
    setValueIfPropertyExists(sparkline, 'fill', options.fill, options);
    setValueIfPropertyExists(sparkline, 'stroke', options.stroke, options);
    setValueIfPropertyExists(sparkline, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(sparkline, 'paddingInner', options.paddingInner, options);
    setValueIfPropertyExists(sparkline, 'paddingOuter', options.paddingOuter, options);
    setValueIfPropertyExists(sparkline, 'formatter', options.formatter, options);
    if (options.label) {
        initLabelOptions(sparkline.label, options.label);
    }
}
function initPaddingOptions(target, options) {
    setValueIfPropertyExists(target, 'top', options.top, options);
    setValueIfPropertyExists(target, 'right', options.right, options);
    setValueIfPropertyExists(target, 'bottom', options.bottom, options);
    setValueIfPropertyExists(target, 'left', options.left, options);
}
function initMarkerOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'shape', options.shape, options);
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
}
function initLabelOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'fontStyle', options.fontStyle, options);
    setValueIfPropertyExists(target, 'fontWeight', options.fontWeight, options);
    setValueIfPropertyExists(target, 'fontSize', options.fontSize, options);
    setValueIfPropertyExists(target, 'fontFamily', options.fontFamily, options);
    setValueIfPropertyExists(target, 'textAlign', options.textAlign, options);
    setValueIfPropertyExists(target, 'textBaseline', options.textBaseline, options);
    setValueIfPropertyExists(target, 'color', options.color, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
    setValueIfPropertyExists(target, 'placement', options.placement, options);
}
function initLineOptions(target, options) {
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initAxisOptions(target, options) {
    setValueIfPropertyExists(target, 'type', options.type, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initHighlightStyleOptions(target, options) {
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initCrosshairsOptions(target, options) {
    if (target.xLine && options.xLine) {
        initCrosshairLineOptions(target.xLine, options.xLine);
    }
    if (target.yLine && options.yLine) {
        initCrosshairLineOptions(target.yLine, options.yLine);
    }
}
function initCrosshairLineOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'lineDash', options.lineDash, options);
    setValueIfPropertyExists(target, 'lineCap', options.lineCap, options);
}
const doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
const offsetValidator = (property, value, defaultOffset) => {
    if (isNumber(value)) {
        return true;
    }
    const message = `AG Charts: ${property} must be a number, the value you provided is not a valid number. Using the default of ${defaultOffset}px.`;
    doOnce(() => console.warn(message), `${property} not a number`);
    return false;
};
const validators = {
    xOffset: offsetValidator,
    yOffset: offsetValidator,
};
function setValueIfPropertyExists(target, property, value, options) {
    if (property in options) {
        if (property in target) {
            const validator = validators[property];
            const isValid = validator ? validator(property, value, target[property]) : true;
            if (isValid && target[property] !== value) {
                // only set property if the value is different to new value
                target[property] = value;
            }
        }
        else {
            console.warn(`Property ${property} does not exist on the target object.`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdTcGFya2xpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3BhcmtsaW5lL2FnU3BhcmtsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQWEvRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFNUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztBQWtCM0IsTUFBTSxPQUFnQixXQUFXO0lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZ0MsRUFBRSxPQUF5QjtRQUNyRSx1Q0FBdUM7UUFDdkMsT0FBTyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXJDLE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyRCxJQUFJLE9BQU8sRUFBRTtZQUNULFNBQVMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQy9CO1FBRUQsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFeEMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2QsU0FBUyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ2pDO1FBRUQsU0FBUyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztRQUVyQyxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFFRCxTQUFTLG9CQUFvQixDQUFDLE9BQWUsTUFBTTtJQUMvQyxRQUFRLElBQUksRUFBRTtRQUNWLEtBQUssUUFBUTtZQUNULE9BQU8sSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNqQyxLQUFLLEtBQUs7WUFDTixPQUFPLElBQUksWUFBWSxFQUFFLENBQUM7UUFDOUIsS0FBSyxNQUFNO1lBQ1AsT0FBTyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQy9CLEtBQUssTUFBTSxDQUFDO1FBQ1o7WUFDSSxPQUFPLElBQUksYUFBYSxFQUFFLENBQUM7S0FDbEM7QUFDTCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxTQUF3QixFQUFFLE9BQVk7SUFDL0QsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2xCLEtBQUssS0FBSztZQUNOLHNCQUFzQixDQUFDLFNBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0QsTUFBTTtRQUNWLEtBQUssUUFBUTtZQUNULHNCQUFzQixDQUFDLFNBQTRCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUQsTUFBTTtRQUNWLEtBQUssTUFBTTtZQUNQLGlCQUFpQixDQUFDLFNBQTBCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkQsTUFBTTtRQUNWLEtBQUssTUFBTSxDQUFDO1FBQ1o7WUFDSSxpQkFBaUIsQ0FBQyxTQUEwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE1BQU07S0FDYjtBQUNMLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxTQUF3QixFQUFFLE9BQVk7SUFDekQsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pFLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkUsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdFLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbkUsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ2pCLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzFEO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2QsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1FBQ3hCLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQy9FO0FBQ0wsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsU0FBd0IsRUFBRSxPQUFZO0lBQzdELElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNoQixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2RDtJQUVELElBQUksT0FBTyxDQUFDLElBQUksRUFBRTtRQUNkLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqRDtJQUVELElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRTtRQUNwQixxQkFBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNuRTtBQUNMLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFNBQXdCLEVBQUUsT0FBWTtJQUM3RCx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbkUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2hCLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2QsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFO1FBQ3BCLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25FO0FBQ0wsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsU0FBeUMsRUFBRSxPQUFZO0lBQ25GLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pGLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkUsd0JBQXdCLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pGLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRix3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkYsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTdFLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNmLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3BEO0FBQ0wsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsTUFBc0IsRUFBRSxPQUFZO0lBQzVELHdCQUF3QixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxNQUE4QixFQUFFLE9BQVk7SUFDbkUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlFLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQXNCLEVBQUUsT0FBWTtJQUMxRCx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMxRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEYsd0JBQXdCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMxRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUUsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLE1BQTRCLEVBQUUsT0FBWTtJQUMvRCx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFxQixFQUFFLE9BQVk7SUFDeEQsd0JBQXdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsTUFBNkIsRUFBRSxPQUFZO0lBQzFFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxNQUFrQyxFQUFFLE9BQVk7SUFDM0UsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDL0Isd0JBQXdCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekQ7SUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUMvQix3QkFBd0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6RDtBQUNMLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUFDLE1BQTRCLEVBQUUsT0FBWTtJQUN4RSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BFLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDeEUsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxNQUFNLFdBQVcsR0FBK0IsRUFBRSxDQUFDO0FBQ25EOzs7O0dBSUc7QUFDSCxTQUFTLE1BQU0sQ0FBQyxJQUFnQixFQUFFLEdBQVc7SUFDekMsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEIsT0FBTztLQUNWO0lBRUQsSUFBSSxFQUFFLENBQUM7SUFDUCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzVCLENBQUM7QUFFRCxNQUFNLGVBQWUsR0FBRyxDQUFDLFFBQWdCLEVBQUUsS0FBYSxFQUFFLGFBQXNCLEVBQVcsRUFBRTtJQUN6RixJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNqQixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsTUFBTSxPQUFPLEdBQUcsY0FBYyxRQUFRLHlGQUF5RixhQUFhLEtBQUssQ0FBQztJQUNsSixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLFFBQVEsZUFBZSxDQUFDLENBQUM7SUFDaEUsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQWU7SUFDM0IsT0FBTyxFQUFFLGVBQWU7SUFDeEIsT0FBTyxFQUFFLGVBQWU7Q0FDM0IsQ0FBQztBQUVGLFNBQVMsd0JBQXdCLENBQUMsTUFBVyxFQUFFLFFBQWdCLEVBQUUsS0FBVSxFQUFFLE9BQVk7SUFDckYsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO1FBQ3JCLElBQUksUUFBUSxJQUFJLE1BQU0sRUFBRTtZQUNwQixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBRWhGLElBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBQ3ZDLDJEQUEyRDtnQkFDM0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUM1QjtTQUNKO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSx1Q0FBdUMsQ0FBQyxDQUFDO1NBQzdFO0tBQ0o7QUFDTCxDQUFDIn0=