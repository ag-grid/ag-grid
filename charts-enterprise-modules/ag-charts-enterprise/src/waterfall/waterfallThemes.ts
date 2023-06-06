import { _Theme } from 'ag-charts-community';

export const WATERFALL_SERIES_THEME = {
    __extends__: _Theme.EXTENDS_SERIES_DEFAULTS,
    label: {
        enabled: false,
        placement: 'end',
        fontSize: 12,
        fontFamily: _Theme.DEFAULT_FONT_FAMILY,
        color: 'rgb(70, 70, 70)',
        __overrides__: _Theme.OVERRIDE_SERIES_LABEL_DEFAULTS,
    },
    positiveItem: {
        fill: '#233e6f',
        stroke: '#233e6f',
    },
    negativeItem: {
        fill: '#9FB7E1',
        stroke: '#9FB7E1',
    },
    line: {
        stroke: 'black',
        strokeOpacity: 1,
        lineDash: [0],
        lineDashOffset: 0,
        strokeWidth: 2,
    },
};
