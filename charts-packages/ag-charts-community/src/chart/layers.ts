/**
 * Constants to declare the expected nominal zIndex for all types of layer in chart rendering.
 */
export enum Layers {
    AXIS_GRIDLINES_ZINDEX = 0,
    SERIES_CROSSLINE_RANGE_ZINDEX = 10,
    AXIS_ZINDEX = 20,
    SERIES_LAYER_ZINDEX = 500,
    SERIES_LABEL_ZINDEX = 1000,
    SERIES_CROSSLINE_LINE_ZINDEX = 2500,
    LEGEND_ZINDEX = 3000,
}
