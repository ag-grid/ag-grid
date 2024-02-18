/** Types of chart-update, in pipeline execution order. */
export declare enum ChartUpdateType {
    FULL = 0,
    UPDATE_DATA = 1,
    PROCESS_DATA = 2,
    PERFORM_LAYOUT = 3,
    SERIES_UPDATE = 4,
    TOOLTIP_RECALCULATION = 5,
    SCENE_RENDER = 6,
    NONE = 7
}
