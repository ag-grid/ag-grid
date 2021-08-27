import { AreaSparkline } from "./areaSparkline";
import { SparklineAxis } from "./sparkline";
import { ColumnSparkline } from "./columnSparkline";
import { LineSparkline } from "./lineSparkline";

import {
    SparklineOptions,
    LineSparklineOptions,
    AreaSparklineOptions,
    ColumnSparklineOptions,
    HighlightStyle,
    SparklineMarker,
    SparklineLine
} from "@ag-grid-community/core";

export type AgSparklineType<T> =
    T extends LineSparklineOptions ? LineSparkline :
    T extends AreaSparklineOptions ? AreaSparkline :
    T extends ColumnSparklineOptions ? ColumnSparkline :
    never;

export abstract class AgSparkline {
    static create<T extends SparklineOptions>(options: T): AgSparklineType<T> {

        const sparkline = getSparklineInstance(options.type);

        initSparkline(sparkline, options);

        switch (options.type) {
            case 'column':
                initColumnSparkline(sparkline, options);
                break;
            case 'area':
                initAreaSparkline(sparkline, options);
                break;
            case 'line':
            default:
                initLineSparkline(sparkline, options);
                break;
        }

        //TODO: don't want to test this feature yet
        sparkline.tooltip.enabled = false;

        return sparkline;
    }
}

function getSparklineInstance(type: string = 'line'): any {
    switch (type) {
        case 'line':
            return new LineSparkline();
        case 'column':
            return new ColumnSparkline();
        case 'area':
            return new AreaSparkline();
        default:
            return new LineSparkline();
    }
}

function initSparkline(sparkline: ColumnSparkline, options: any) {
    setValueIfPropertyExists(sparkline, 'container', options.container, options);
    setValueIfPropertyExists(sparkline, 'data', options.data, options);
    setValueIfPropertyExists(sparkline, 'width', options.width, options);
    setValueIfPropertyExists(sparkline, 'height', options.height, options);
    setValueIfPropertyExists(sparkline, 'title', options.title, options);
    setValueIfPropertyExists(sparkline, 'padding', options.padding, options);

    if (options.axis) {
        initAxisOptions(sparkline.axis, options.axis);
    }

    if (options.highlightStyle) {
        initHighlightStyleOptions(sparkline.highlightStyle, options.highlightStyle);
    }
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
            target[property] = value;
        } else {
            console.warn(`Property ${property} does not exist on the target object.`);
        }
    }
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
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

function initHighlightStyleOptions(target: HighlightStyle, options: any) {
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}

