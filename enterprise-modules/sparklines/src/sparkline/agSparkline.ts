import { AreaSparkline } from "./area/areaSparkline";
import { SparklineAxis } from "./sparkline";
import { ColumnSparkline } from "./column/columnSparkline";
import { LineSparkline } from "./line/lineSparkline";

import {
    SparklineOptions,
    LineSparklineOptions,
    AreaSparklineOptions,
    ColumnSparklineOptions,
    HighlightStyle,
    SparklineMarker,
    SparklineLine,
    Padding
} from "@ag-grid-community/core";
import { SparklineTooltip } from "./tooltip/sparklineTooltip";

export type AgSparklineType<T> =
    T extends LineSparklineOptions ? LineSparkline :
    T extends AreaSparklineOptions ? AreaSparkline :
    T extends ColumnSparklineOptions ? ColumnSparkline :
    never;

export type SparklineType = LineSparkline | AreaSparkline | ColumnSparkline;
export abstract class AgSparkline {
    static create<T extends SparklineOptions>(options: T, tooltip: SparklineTooltip, container?: HTMLElement, data?: any[]): AgSparklineType<T> {
        // avoid mutating user provided options
        options = Object.create(options);

        if (container) {
            options.container = container;
        }

        if (data) {
            options.data = data;
        }

        const sparkline = getSparklineInstance(options.type);

        if (tooltip) {
            sparkline.tooltip = tooltip;
        }

        initSparkline(sparkline, options);

        initSparklineByType(sparkline, options);

        // Set data last as this invokes the update method to produce the data joins and update the selection's nodes,
        // we only want to do this after all the other properties are set.
        initSparklineData(sparkline, options);

        return sparkline;
    }
}

function getSparklineInstance(type: string = 'line'): any {
    switch (type) {
        case 'column':
            return new ColumnSparkline();
        case 'area':
            return new AreaSparkline();
        case 'line':
        default:
            return new LineSparkline();
    }
}

function initSparklineByType(sparkline: SparklineType, options: any): void {
    switch (options.type) {
        case 'column':
            initColumnSparkline(sparkline as ColumnSparkline, options);
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
    // FIXME: it may not be necessary to set context
    setValueIfPropertyExists(sparkline, 'context', options.context, options);
    setValueIfPropertyExists(sparkline, 'container', options.container, options);
    setValueIfPropertyExists(sparkline, 'width', options.width, options);
    setValueIfPropertyExists(sparkline, 'height', options.height, options);
    setValueIfPropertyExists(sparkline, 'title', options.title, options);
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

function initSparklineData(sparkline: SparklineType, options: any) {
    setValueIfPropertyExists(sparkline, 'data', options.data, options);
}

function initLineSparkline(sparkline: LineSparkline, options: any) {
    if (options.marker) {
        initMarkerOptions(sparkline.marker, options.marker);
    }

    if (options.line) {
        initLineOptions(sparkline.line, options.line);
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
}

function initColumnSparkline(sparkline: ColumnSparkline, options: any) {
    setValueIfPropertyExists(sparkline, 'fill', options.fill, options);
    setValueIfPropertyExists(sparkline, 'stroke', options.stroke, options);
    setValueIfPropertyExists(sparkline, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(sparkline, 'paddingInner', options.paddingInner, options);
    setValueIfPropertyExists(sparkline, 'paddingOuter', options.paddingOuter, options);
    setValueIfPropertyExists(sparkline, 'formatter', options.formatter, options);
}

function setValueIfPropertyExists(target: any, property: string, value: any, options: any): void {
    if (property in options) {
        if (property in target) {
            if (target[property] !== value) { // only set property if the value is different to new value
                target[property] = value;
            }
        } else {
            console.warn(`Property ${property} does not exist on the target object.`);
        }
    }
}

function initPaddingOptions(target: Padding, options: any) {
    setValueIfPropertyExists(target, 'top', options.top, options);
    setValueIfPropertyExists(target, 'right', options.right, options);
    setValueIfPropertyExists(target, 'bottom', options.bottom, options);
    setValueIfPropertyExists(target, 'left', options.left, options);
}

function initMarkerOptions(target: SparklineMarker, options: any) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'shape', options.shape, options);
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
}

function initLineOptions(target: SparklineLine, options: any) {
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initAxisOptions(target: SparklineAxis, options: any) {
    setValueIfPropertyExists(target, 'type', options.type, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initHighlightStyleOptions(target: HighlightStyle, options: any) {
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initTooltipOptions(target: SparklineTooltip, options: any) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'container', options.container, options);
    setValueIfPropertyExists(target, 'renderer', options.renderer, options);
}