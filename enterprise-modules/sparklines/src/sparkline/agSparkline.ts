import { AreaSparkline } from './area/areaSparkline';
import { SparklineAxis } from './sparkline';
import { LineSparkline } from './line/lineSparkline';
import { BarSparkline } from './bar-column/barSparkline';
import { ColumnSparkline } from './bar-column/columnSparkline';

import {
    CrosshairLineOptions,
    SparklineOptions,
    HighlightStyleOptions,
    SparklineMarkerOptions,
    SparklineLineOptions,
    PaddingOptions,
    SparklineCrosshairsOptions,
} from '@ag-grid-community/core';
import { SparklineTooltip } from './tooltip/sparklineTooltip';
import { BarColumnLabel } from './bar-column/barColumnSparkline';
import { _Util } from 'ag-charts-community';

const { extent, isNumber } = _Util;

export type SparklineFactoryOptions = SparklineOptions & {
    data: any[];
    width: number;
    height: number;
    context?: any;
    container?: HTMLElement;
};

type SparklineType = LineSparkline | AreaSparkline | ColumnSparkline | BarSparkline;

type Validators = {
    [property: string] : ValidatorFunc;
}

type ValidatorFunc = (property: string, value: any, defaultValue?: any) => boolean;

export abstract class AgSparkline {
    static create(options: SparklineFactoryOptions, tooltip: SparklineTooltip) {
        // avoid mutating user provided options
        options = Object.create(options);

        const sparkline = getSparklineInstance(options.type);

        if (tooltip) {
            sparkline.tooltip = tooltip;
        }

        initSparkline(sparkline, options);
        initSparklineByType(sparkline, options);

        if (options.data) {
            sparkline.data = options.data;
        }

        return sparkline;
    }
}

function getSparklineInstance(type: string = 'line'): any {
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

function initSparklineByType(sparkline: SparklineType, options: any): void {
    switch (options.type) {
        case 'bar':
            initBarColumnSparkline(sparkline as BarSparkline, options);
            break;
        case 'column':
            initBarColumnSparkline(sparkline as ColumnSparkline, options);
            break;
        case 'area':
            initAreaSparkline(sparkline as AreaSparkline, options);
            break;
        case 'line':
        default:
            initLineSparkline(sparkline as LineSparkline, options);
            break;
    }
}

function initSparkline(sparkline: SparklineType, options: any) {
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

    if (options.tooltip && sparkline.tooltip) {
        initTooltipOptions(sparkline.tooltip, options.tooltip);
    }
}

function initLineSparkline(sparkline: LineSparkline, options: any) {
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

function initAreaSparkline(sparkline: AreaSparkline, options: any) {
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

function initBarColumnSparkline(sparkline: ColumnSparkline | BarSparkline, options: any) {
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

function initPaddingOptions(target: PaddingOptions, options: any) {
    setValueIfPropertyExists(target, 'top', options.top, options);
    setValueIfPropertyExists(target, 'right', options.right, options);
    setValueIfPropertyExists(target, 'bottom', options.bottom, options);
    setValueIfPropertyExists(target, 'left', options.left, options);
}

function initMarkerOptions(target: SparklineMarkerOptions, options: any) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'shape', options.shape, options);
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
}

function initLabelOptions(target: BarColumnLabel, options: any) {
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

function initLineOptions(target: SparklineLineOptions, options: any) {
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initAxisOptions(target: SparklineAxis, options: any) {
    setValueIfPropertyExists(target, 'type', options.type, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initHighlightStyleOptions(target: HighlightStyleOptions, options: any) {
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initTooltipOptions(target: SparklineTooltip, options: any) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'container', options.container, options);
    setValueIfPropertyExists(target, 'xOffset', options.xOffset, options);
    setValueIfPropertyExists(target, 'yOffset', options.yOffset, options);
    setValueIfPropertyExists(target, 'renderer', options.renderer, options);
}

function initCrosshairsOptions(target: SparklineCrosshairsOptions, options: any) {
    if (target.xLine && options.xLine) {
        initCrosshairLineOptions(target.xLine, options.xLine);
    }

    if (target.yLine && options.yLine) {
        initCrosshairLineOptions(target.yLine, options.yLine);
    }
}

function initCrosshairLineOptions(target: CrosshairLineOptions, options: any) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'lineDash', options.lineDash, options);
    setValueIfPropertyExists(target, 'lineCap', options.lineCap, options);
}

const doOnceFlags: { [key: string]: boolean; } = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func: () => void, key: string) {
    if (doOnceFlags[key]) { return; }

    func();
    doOnceFlags[key] = true;
}

const offsetValidator = (property: string, value: number, defaultOffset?: number) : boolean => {
    if (isNumber(value)) {
        return true;
    }

    const message = `AG Charts: ${property} must be a number, the value you provided is not a valid number. Using the default of ${defaultOffset}px.`;
    doOnce(() => console.warn(message), `${property} not a number`);
    return false;
}

const validators: Validators = {
    xOffset: offsetValidator,
    yOffset: offsetValidator
}

function setValueIfPropertyExists(target: any, property: string, value: any, options: any): void {
    if (property in options) {
        if (property in target) {
            const validator = validators[property];
            const isValid = validator ? validator(property, value, target[property]) : true;

            if (isValid && target[property] !== value) {
                // only set property if the value is different to new value
                target[property] = value;
            }
        } else {
            console.warn(`Property ${property} does not exist on the target object.`);
        }
    }
}